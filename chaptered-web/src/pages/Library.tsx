import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLibraryStore } from '../store/useLibraryStore';
import { compressPDF, detectPages } from '../lib/pdfUtils';
import { formatSessionDate } from '../lib/bookUtils';
import { AddBookModal } from '../components/AddBookModal';
import '../library.css';

function toast(msg: string, type = '') {
  const el = document.createElement('div');
  el.className = 'toast' + (type ? ' ' + type : '');
  el.textContent = msg;
  const c = document.getElementById('tc');
  if (c) { c.appendChild(el); setTimeout(() => el.remove(), 2800); }
}

const COLORS = ['#8B3A3A', '#2d5a3d', '#3a4a8b', '#7a3a8b', '#8b6a2a', '#1a4a5a', '#5a2a1a', '#2a2a2a'];

export const Library = () => {
  const books = useLibraryStore((s) => s.books);
  const sessions = useLibraryStore((s) => s.sessions);
  const addBook = useLibraryStore((s) => s.addBook);
  const updateBook = useLibraryStore((s) => s.updateBook);
  const deleteBook = useLibraryStore((s) => s.deleteBook);
  const addSession = useLibraryStore((s) => s.addSession);
  const deleteSession = useLibraryStore((s) => s.deleteSession);
  const pagesFor = useLibraryStore((s) => s.pagesFor);
  const getBookProgress = useLibraryStore((s) => s.getBookProgress);
  const getTotalPagesRead = useLibraryStore((s) => s.getTotalPagesRead);
  const getStreak = useLibraryStore((s) => s.getStreak);
  const getBooksStats = useLibraryStore((s) => s.getBooksStats);
  const getSessionsForBook = useLibraryStore((s) => s.getSessionsForBook);
  const getBookPdfUrl = useLibraryStore((s) => s.getBookPdfUrl);

  const [activePanel, setActivePanel] = useState('shelf');
  const [search, setSearch] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [editId, setEditId] = useState<string | null>(null);
  const [readerBook, setReaderBook] = useState<string | null>(null);

  // Edit form state
  const [eTitle, setETitle] = useState('');
  const [eAuthor, setEAuthor] = useState('');
  const [eGenre, setEGenre] = useState('Fiction');
  const [ePages, setEPages] = useState<number | ''>('');
  const [eDesc, setEDesc] = useState('');
  const [eColor, setEColor] = useState('#8B3A3A');
  const [ePdfFile, setEPdfFile] = useState<File | null>(null);
  const [ePdfLabel, setEPdfLabel] = useState('Click or drag & drop PDF to attach');
  const [eHasPdf, setEHasPdf] = useState(false);
  const [eDetectedPages, setEDetectedPages] = useState<number | null>(null);

  // Log session form
  const [logBook, setLogBook] = useState('');
  const [logPages, setLogPages] = useState<number | ''>('');
  const [logNote, setLogNote] = useState('');

  // Stats from store
  const stats = getBooksStats();
  const totalPagesRead = getTotalPagesRead();
  const streak = getStreak();
  const sessionCount = sessions.length;

  // Filtered books
  const filtered = books.filter((b) => {
    if (search && !b.title.toLowerCase().includes(search.toLowerCase()) && !b.author.toLowerCase().includes(search.toLowerCase())) return false;
    if (genreFilter && b.genre !== genreFilter) return false;
    if (statusFilter) {
      const p = getBookProgress(b.id);
      if (statusFilter === 'completed' && p < 100) return false;
      if (statusFilter === 'reading' && (p <= 0 || p >= 100)) return false;
      if (statusFilter === 'not_started' && p !== 0) return false;
    }
    return true;
  });

  // Log hint
  const selectedBook = books.find((b) => b.id === logBook);
  const alreadyRead = selectedBook ? pagesFor(selectedBook.id) : 0;
  const remaining = selectedBook ? Math.max(0, selectedBook.pages - alreadyRead) : 0;

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
        });
      },
      { threshold: 0.08 }
    );
    document.querySelectorAll('.reveal').forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [activePanel]);

  const handleAddBook = async (data: { title: string; author: string; genre: string; pages: number; desc?: string; color: string; file?: File | null }) => {
    await addBook({
      title: data.title,
      author: data.author,
      genre: data.genre,
      pages: data.pages,
      desc: data.desc || '',
      color: data.color,
      hasPdf: false,
      file: data.file || undefined,
    });
    toast(`📚 "${data.title}" added!`);
    setActivePanel('shelf');
  };

  const handleDeleteBook = (id: string) => {
    const b = books.find((x) => x.id === id);
    if (!b || !confirm(`Remove "${b.title}"? All sessions will also be deleted.`)) return;
    deleteBook(id);
    toast('Book removed.', 'err');
  };

  const openEdit = (id: string) => {
    const b = books.find((x) => x.id === id);
    if (!b) return;
    setEditId(id);
    setETitle(b.title);
    setEAuthor(b.author);
    setEGenre(b.genre);
    setEPages(b.pages);
    setEDesc(b.desc || '');
    setEColor(b.color);
    setEDetectedPages(null);
    setEPdfFile(null);
    const hasPdf = !!getBookPdfUrl(id);
    setEHasPdf(hasPdf);
    setEPdfLabel(hasPdf ? '✓ PDF attached — click to replace' : 'Click or drag & drop PDF to attach');
  };

  const closeEdit = () => { setEditId(null); };

  const saveEdit = async () => {
    if (!editId) return;
    if (!eTitle.trim() || !eAuthor.trim()) { toast('Title and Author required.', 'err'); return; }
    const pages = Number(ePages);
    if (!pages || pages < 1) { toast('Enter a valid page count.', 'err'); return; }
    if (eDetectedPages && pages > eDetectedPages) { toast(`Page count cannot exceed detected pages (${eDetectedPages}).`, 'err'); return; }
    await updateBook(editId, {
      title: eTitle.trim(),
      author: eAuthor.trim(),
      genre: eGenre,
      pages,
      desc: eDesc.trim(),
      color: eColor,
      file: ePdfFile || undefined,
    });
    toast('✓ Book updated!');
    closeEdit();
  };

  const openReader = (id: string) => { setReaderBook(id); document.body.style.overflow = 'hidden'; };
  const closeReader = () => { setReaderBook(null); document.body.style.overflow = ''; };

  const handleLogSession = () => {
    if (!logBook) { toast('Select a book.', 'err'); return; }
    const p = Number(logPages);
    if (!p || p < 1) { toast('Enter valid pages.', 'err'); return; }
    const book = books.find((b) => b.id === logBook);
    if (!book) return;
    if (remaining <= 0) { toast(`"${book.title}" is already fully read!`, 'err'); return; }
    if (p > remaining) { toast(`Only ${remaining} pages left.`, 'err'); setLogPages(remaining); return; }
    addSession({ bookId: logBook, pages: p, note: logNote || undefined });
    toast(`✓ Logged ${p} pages — "${book.title}"`);
    setLogPages('');
    setLogNote('');
  };

  const handleEditPdf = async (file: File) => {
    if (file.type !== 'application/pdf') { toast('Please select a PDF.', 'err'); return; }
    setEPdfLabel('Processing...');
    try {
      const compressed = await compressPDF(file, 'ecompress-bar', 'ecompress-label', 'ecompress-progress');
      const n = await detectPages(compressed);
      setEPdfFile(compressed);
      setEPdfLabel(`✓ ${file.name}${n ? ` — ${n} pages` : ''}`);
      if (n) { setEPages(n); setEDetectedPages(n); }
    } catch { toast('PDF processing failed.', 'err'); setEPdfLabel('Processing failed'); }
  };

  const readerBookData = readerBook ? books.find((b) => b.id === readerBook) : null;
  const readerPdfUrl = readerBookData ? getBookPdfUrl(readerBookData.id) : null;
  const readerProgress = readerBookData ? getBookProgress(readerBookData.id) : 0;

  const renderBookCard = (book: typeof books[0]) => {
    const p = getBookProgress(book.id);
    const pr = pagesFor(book.id);
    return (
      <div key={book.id} className="bcard" onClick={() => openReader(book.id)}>
        {book.hasPdf && <span className="pdf-badge">PDF</span>}
        <div className="bactions">
          <button className="bab" onClick={(e) => { e.stopPropagation(); openEdit(book.id); }} title="Edit">✎</button>
          <button className="bab del" onClick={(e) => { e.stopPropagation(); handleDeleteBook(book.id); }} title="Delete">✕</button>
        </div>
        <div className="bcover" style={{ background: `linear-gradient(145deg, ${book.color} 0%, ${book.color}bb 100%)` }}>
          <div className="bcover-t">{book.title}</div>
        </div>
        <div className="bbody">
          <div className="bt">{book.title}</div>
          <div className="ba">{book.author}</div>
          <span className="bg-chip">{book.genre}</span>
          <div className="bprog">
            <div className="pb"><div className="pf" style={{ width: `${p}%` }}></div></div>
            <div className="pp">{pr}/{book.pages} pages · {p}%</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="library">


      {/* PAGE HERO */}
      <div className="ph">
        <div className="ph-bg"></div>
        <div className="ph-wm">Library</div>
        <div className="ph-c">
          <div className="crumb">Chaptered <span>›</span> Your Library</div>
          <h1>Your <em>Library</em></h1>
          <p>Add, track, update, and read your books — all in one place. Upload PDFs to read them directly in Chaptered.</p>
          <div className="ph-stats">
            <div className="phs"><div className="psn" id="hs-b">{stats.total}</div><div className="psl">Books</div></div>
            <div className="phs"><div className="psn a" id="hs-p">{totalPagesRead >= 1000 ? (totalPagesRead / 1000).toFixed(1) + 'k' : totalPagesRead}</div><div className="psl">Pages Read</div></div>
            <div className="phs"><div className="psn" id="hs-s">{sessionCount}</div><div className="psl">Sessions</div></div>
            <div className="phs"><div className="psn a" id="hs-st">{streak} 🔥</div><div className="psl">Day Streak</div></div>
          </div>
        </div>
      </div>

      <div className="layout">
        {/* SIDEBAR */}
        <aside className="sb">
          <button className="sb-add" onClick={() => setActivePanel('add')}>＋ Add New Book</button>
          <div className="sb-nav">
            <div className="sb-nav-t">Navigation</div>
            {(['shelf', 'add', 'progress'] as const).map((p) => (
              <button key={p} className={`sb-btn${activePanel === p ? ' active' : ''}`} data-p={p} onClick={() => setActivePanel(p)}>
                <span>{p === 'shelf' ? '📚' : p === 'add' ? '＋' : '📊'}</span>
                {p === 'shelf' ? 'My Shelf' : p === 'add' ? 'Add Book' : 'Progress Tracker'}
              </button>
            ))}
          </div>
          <div className="sb-mini">
            <div className="ms"><span className="ms-l">Books in Library</span><span className="ms-v" id="ms-b">{stats.total}</span></div>
            <div className="ms"><span className="ms-l">Completed</span><span className="ms-v a" id="ms-d">{stats.completed}</span></div>
            <div className="ms"><span className="ms-l">In Progress</span><span className="ms-v" id="ms-r">{stats.reading}</span></div>
            <div className="ms"><span className="ms-l">Not Started</span><span className="ms-v" id="ms-u">{stats.notStarted}</span></div>
          </div>
        </aside>

        <main>
          {/* SHELF PANEL */}
          {activePanel === 'shelf' && (
            <div className="panel active" id="p-shelf">
              <div className="toolbar">
                <div className="sw">
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="6.5" cy="6.5" r="5.5" stroke="#7a6a55" strokeWidth="1.5"/><line x1="10.7" y1="10.7" x2="14" y2="14" stroke="#7a6a55" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  <input className="si" placeholder="Search titles or authors…" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <select className="fp" value={genreFilter} onChange={(e) => setGenreFilter(e.target.value)}>
                  <option value="">All Genres</option>
                  {['Fiction', 'Non-Fiction', 'Fantasy', 'Science Fiction', 'Mystery', 'Romance', 'Biography', 'Self-Help', 'History', 'Other'].map((g) => <option key={g}>{g}</option>)}
                </select>
                <select className="fp" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="">All Status</option>
                  <option value="reading">Reading</option>
                  <option value="completed">Completed</option>
                  <option value="not_started">Not Started</option>
                </select>
                <div className="vbtns">
                  <button className={`vb${viewMode === 'grid' ? ' active' : ''}`} id="gvb" onClick={() => setViewMode('grid')} title="Grid">⊞</button>
                  <button className={`vb${viewMode === 'list' ? ' active' : ''}`} id="lvb" onClick={() => setViewMode('list')} title="List">☰</button>
                </div>
              </div>
              <div className="sh">My Books <span className="cnt" id="bcnt">{filtered.length}</span></div>
              {filtered.length === 0 ? (
                <div className="empty" id="se">
                  <span className="ei">📭</span>
                  <h3>Your shelf is empty</h3>
                  <p>Start your library by adding your first book.</p>
                  <button className="eb" onClick={() => setActivePanel('add')}>Add Your First Book</button>
                </div>
              ) : (
                <div className={`books-grid${viewMode === 'list' ? ' lv' : ''}`} id="bg">
                  {filtered.map(renderBookCard)}
                </div>
              )}
            </div>
          )}

          {/* ADD BOOK PANEL */}
          {activePanel === 'add' && (
            <div className="panel active" id="p-add">
              <AddBookModal
                isOpen={true}
                onClose={() => { setActivePanel('shelf'); }}
                onAddBook={handleAddBook}
              />
            </div>
          )}

          {/* PROGRESS PANEL */}
          {activePanel === 'progress' && (
            <div className="panel active" id="p-progress">
              <div className="tstats" id="tstats">
                <div className="ts"><div className="tsn">{stats.total}</div><div className="tsl">Books</div></div>
                <div className="ts"><div className="tsn a">{totalPagesRead.toLocaleString()}</div><div className="tsl">Pages Read</div></div>
                <div className="ts"><div className="tsn">{sessionCount}</div><div className="tsl">Sessions</div></div>
                <div className="ts"><div className="tsn a">{streak} 🔥</div><div className="tsl">Streak</div></div>
                <div className="ts"><div className="tsn">{stats.completed}</div><div className="tsl">Finished</div></div>
              </div>

              <div className="lb">
                <h3>📝 Log a Reading Session</h3>
                <div className="lr">
                  <div>
                    <span className="ll">Book</span>
                    <select className="li" value={logBook} onChange={(e) => setLogBook(e.target.value)} style={{ padding: '.62rem 1rem' }}>
                      <option value="">{books.length ? 'Select a book' : 'No books yet'}</option>
                      {books.map((b) => <option key={b.id} value={b.id}>{b.title}</option>)}
                    </select>
                  </div>
                  <div>
                    <span className="ll">Pages Read</span>
                    <input type="number" className="li" min="1" placeholder="e.g. 25" value={logPages} onChange={(e) => setLogPages(e.target.value ? Number(e.target.value) : '')} />
                    {selectedBook && <span id="lHint" style={{ fontSize: '.72rem', display: 'block', marginTop: '.3rem', color: remaining === 0 ? 'var(--green)' : 'var(--muted)' }}>{remaining === 0 ? '✓ Fully read!' : `${remaining} pages remaining of ${selectedBook.pages}`}</span>}
                  </div>
                  <div>
                    <span className="ll">Note (optional)</span>
                    <input type="text" className="li" placeholder="Quick thought…" value={logNote} onChange={(e) => setLogNote(e.target.value)} />
                  </div>
                  <button className="log-btn" onClick={handleLogSession}>Log →</button>
                </div>
              </div>

              <div className="sh">Per-Book Progress</div>
              <div className="sw-wrap" id="sc">
                {books.length === 0 ? (
                  <div className="no-s" style={{ padding: '2rem' }}>Add books to start tracking.</div>
                ) : (
                  [...books].filter((b) => getSessionsForBook(b.id).length > 0 || true).map((book) => {
                    const slist = getSessionsForBook(book.id);
                    const pr = pagesFor(book.id);
                    const p = getBookProgress(book.id);
                    return (
                      <div key={book.id} className="sb-book">
                        <div className="sb-hd">
                          <div>
                            <div className="sb-t">{book.title}</div>
                            <div className="sb-au">{book.author} · {book.genre}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div className="sb-pct">{p}%</div>
                            <div style={{ fontSize: '.75rem', color: 'var(--muted)' }}>{pr}/{book.pages} pages</div>
                            {p >= 100 && <span className="done-badge">✓ Completed</span>}
                          </div>
                        </div>
                        <div className="spbar"><div className="spfill" style={{ width: `${p}%` }}></div></div>
                        <div className="s-items">
                          {slist.length > 0 ? slist.map((s) => (
                            <div key={s.id} className="s-item">
                              <span className="s-date">{formatSessionDate(s.date)}</span>
                              <span className="s-pg">{s.pages}<span> pages</span></span>
                              <span className="s-note">{s.note || '—'}</span>
                              <button className="s-del" onClick={() => { deleteSession(s.id); toast('Session removed.', 'err'); }} title="Remove">✕</button>
                            </div>
                          )) : <div className="no-s">No sessions yet — log one above.</div>}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* EDIT MODAL */}
      {editId && (
        <div className="mo open" id="em" onClick={closeEdit}>
          <div className="em" onClick={(e) => e.stopPropagation()}>
            <div className="mh">
              <h3>✏️ Edit Book</h3>
              <button className="mc" onClick={closeEdit}>✕</button>
            </div>
            <span className="fsl">Book Details</span>
            <div className="fr">
              <div className="fg"><label>Title *</label><input type="text" value={eTitle} onChange={(e) => setETitle(e.target.value)} placeholder="e.g. The Alchemist" /></div>
              <div className="fg"><label>Author *</label><input type="text" value={eAuthor} onChange={(e) => setEAuthor(e.target.value)} placeholder="e.g. Paulo Coelho" /></div>
            </div>
            <div className="fr">
              <div className="fg">
                <label>Genre</label>
                <select value={eGenre} onChange={(e) => setEGenre(e.target.value)}>
                  {['Fiction', 'Non-Fiction', 'Fantasy', 'Science Fiction', 'Mystery', 'Romance', 'Biography', 'Self-Help', 'History', 'Other'].map((g) => <option key={g}>{g}</option>)}
                </select>
              </div>
              <div className="fg">
                <label>Total Pages *</label>
                <input type="number" min="1" value={ePages} onChange={(e) => setEPages(e.target.value ? Number(e.target.value) : '')} />
                <span id="ePagesHint" style={{ fontSize: '.72rem', display: 'block', marginTop: '.3rem' }}>{eDetectedPages ? `📄 ${eDetectedPages} pages detected from PDF` : ''}</span>
              </div>
            </div>
            <div className="fg"><label>Description</label><textarea rows={2} value={eDesc} onChange={(e) => setEDesc(e.target.value)} style={{ resize: 'vertical' }}></textarea></div>
            <span className="cl">Cover Color</span>
            <div className="cr" id="ecr">
              {COLORS.map((c) => (
                <div key={c} className={`co${eColor === c ? ' sel' : ''}`} data-c={c} style={{ background: c }} onClick={() => setEColor(c)}></div>
              ))}
            </div>
            <div className="fdiv"></div>
            <span className="fsl">PDF (optional)</span>
            <div
              className={`fu${eHasPdf || ePdfFile ? ' has' : ''}`}
              onClick={() => document.getElementById('efi')?.click()}
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('drag'); }}
              onDragLeave={(e) => { e.currentTarget.classList.remove('drag'); }}
              onDrop={async (e) => { e.preventDefault(); e.currentTarget.classList.remove('drag'); const f = e.dataTransfer.files[0]; if (f) await handleEditPdf(f); }}
            >
              <p id="eul">{ePdfLabel}</p>
              <p style={{ fontSize: '.72rem', color: 'var(--muted)', marginTop: '.3rem' }}>⚠️ Max 100MB. Larger files will be auto-compressed.</p>
              <div id="ecompress-progress" style={{ display: 'none', marginTop: '.6rem' }}>
                <div style={{ height: '4px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div id="ecompress-bar" style={{ height: '100%', background: 'var(--amber)', width: '0%', transition: 'width .3s', borderRadius: '4px' }}></div>
                </div>
                <p id="ecompress-label" style={{ fontSize: '.72rem', color: 'var(--amber)', marginTop: '.3rem' }}>⏳ Compressing...</p>
              </div>
            </div>
            <input type="file" id="efi" accept=".pdf" style={{ display: 'none' }} onChange={async (e) => { const f = e.target.files?.[0]; if (f) await handleEditPdf(f); }} />
            <div style={{ display: 'flex', gap: '1rem', marginTop: '.5rem' }}>
              <button className="btn" onClick={saveEdit}>Save Changes</button>
              <button className="btn-o" onClick={closeEdit}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* PDF READER MODAL */}
      {readerBookData && (
        <div className="ro open" id="ro" onClick={closeReader}>
          <div className="rm" onClick={(e) => e.stopPropagation()}>
            <div className="rh">
              <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', flex: '1', minWidth: '0' }}>
                <span className="rt" id="rTitle">{readerBookData.title}</span>
                <span className="rm2" id="rMeta">· {readerBookData.author}</span>
              </div>
              <button className="rc" onClick={closeReader}>✕</button>
            </div>
            <div className="rb" id="rBody">
              {readerPdfUrl ? (
                <iframe src={readerPdfUrl} title={readerBookData.title}></iframe>
              ) : (
                <div className="no-pdf">
                  <div className="ni">📖</div>
                  <p>No PDF uploaded for this book.</p>
                  <p style={{ fontSize: '.82rem', opacity: '.6' }}>PDFs are session-only — re-upload via Edit after refreshing.</p>
                </div>
              )}
            </div>
            <div className="ri" id="rInfo">
              <div className="ri-item"><label>Genre</label><span>{readerBookData.genre}</span></div>
              <div className="ri-item"><label>Pages</label><span>{readerBookData.pages}</span></div>
              <div className="ri-item"><label>Progress</label><span>{readerProgress}%</span></div>
              {readerBookData.desc && <div className="ri-item"><label>Note</label><span>{readerBookData.desc}</span></div>}
            </div>
          </div>
        </div>
      )}

      <div id="tc"></div>
    </div>
  );
};
