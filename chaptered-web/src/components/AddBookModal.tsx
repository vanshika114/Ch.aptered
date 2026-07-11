import { useState, useRef } from 'react';
import { compressPDF, detectPages } from '../lib/pdfUtils';
import { LoadingButton } from './ui/LoadingButton';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAddBook: (data: {
    title: string;
    author: string;
    genre: string;
    pages: number;
    desc?: string;
    color: string;
    file?: File | null;
  }) => void;
}

interface SearchResult {
  id: string;
  title: string;
  author: string;
  totalPages: number;
  coverImage: string;
  description?: string;
}

const COLORS = ['#8B3A3A', '#2d5a3d', '#3a4a8b', '#7a3a8b', '#8b6a2a', '#1a4a5a', '#5a2a1a', '#2a2a2a'];
const CARD_TINTS = ['#fef3e2', '#e6f4ea', '#e8edf5', '#f3e8f5', '#f5efe3', '#e3f0f5', '#f5e8e3', '#e8e8e8'];

function toast(msg: string, type = '') {
  const el = document.createElement('div');
  el.className = 'toast' + (type ? ' ' + type : '');
  el.textContent = msg;
  const c = document.getElementById('tc');
  if (c) { c.appendChild(el); setTimeout(() => el.remove(), 2800); }
}

export const AddBookModal = ({ isOpen, onClose, onAddBook }: Props) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('Fiction');
  const [pages, setPages] = useState<number | ''>('');
  const [desc, setDesc] = useState('');
  const [color, setColor] = useState('#8B3A3A');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfLabel, setPdfLabel] = useState('Upload PDF — drag & drop or click to browse');
  const [detectedPages, setDetectedPages] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`/api/books/search?q=${encodeURIComponent(searchQuery.trim())}`);
      const data = await res.json();
      setSearchResults(data.results || []);
      toast(`Found ${(data.results || []).length} results`);
    } catch {
      toast('Search failed. Try again.', 'err');
      setSearchResults([]);
    }
    setIsSearching(false);
  };

  const selectSearchResult = (r: SearchResult) => {
    setTitle(r.title);
    setAuthor(r.author);
    if (r.totalPages > 0) setPages(r.totalPages);
    if (r.description) setDesc(r.description);
    setShowSearch(false);
    setSearchResults([]);
    setSearchQuery('');
    toast(`Selected "${r.title}"`);
  };

  const handleSubmit = () => {
    const p = Number(pages);
    if (!title.trim() || !author.trim()) { toast('Title and Author required.', 'err'); return; }
    if (!p || p < 1) { toast('Enter a valid page count.', 'err'); return; }
    if (detectedPages && p > detectedPages) { toast(`Page count cannot exceed detected pages (${detectedPages}).`, 'err'); setPages(detectedPages); return; }
    onAddBook({ title: title.trim(), author: author.trim(), genre, pages: p, desc: desc.trim() || undefined, color, file: pdfFile });
    resetForm();
  };

  const resetForm = () => {
    setTitle(''); setAuthor(''); setGenre('Fiction'); setPages(''); setDesc(''); setColor('#8B3A3A');
    setPdfFile(null); setPdfLabel('Upload PDF — drag & drop or click to browse'); setDetectedPages(null);
    setSearchQuery(''); setSearchResults([]); setShowSearch(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handlePdf = async (file: File) => {
    if (file.type !== 'application/pdf') { toast('Please select a PDF file.', 'err'); return; }
    setPdfLabel('Processing...');
    try {
      const compressed = await compressPDF(file, 'add-bar', 'add-label', 'add-wrap');
      const n = await detectPages(compressed);
      setPdfFile(compressed);
      setPdfLabel(`✓ ${file.name}${n ? ` — ${n} pages` : ''}`);
      if (n) { setPages(n); setDetectedPages(n); toast(`Detected ${n} pages from PDF.`); }
    } catch { toast('PDF processing failed.', 'err'); setPdfLabel('Processing failed'); }
  };

  if (!isOpen) return null;

  return (
    <div className="fc">
      <h2>📚 Add a New Book</h2>
      <p className="fdesc">Search for a book online or fill in the details manually.</p>

      {/* Book Search */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '.4rem', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="🔍 Search Google Books..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            style={{ flex: 1, minWidth: 0, background: 'var(--warm)', border: '1.5px solid var(--border)', borderRadius: '10px', padding: '.65rem 1rem', color: 'var(--ink)', fontFamily: 'inherit', fontSize: '.93rem', outline: 'none' }}
          />
          <LoadingButton onClick={handleSearch} loading={isSearching} style={{ padding: '.65rem 1.4rem', lineHeight: 1 }}>
            Search
          </LoadingButton>
        </div>

        {isSearching && (
          <div style={{ marginTop: '.75rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '.6rem', padding: '.25rem 0' }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.35rem', padding: '.7rem .4rem',
                  borderRadius: '10px', border: '2px solid var(--border)', background: 'var(--warm)',
                  textAlign: 'center', position: 'relative', overflow: 'hidden'
                }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'var(--border-dark)', borderRadius: '8px 8px 0 0' }} />
                <div style={{ width: 44, height: 64, borderRadius: 6 }} className="bg-warm-deep/60 animate-pulse" />
                <div style={{ width: '60px', height: '10px', borderRadius: '4px' }} className="bg-warm-deep/60 animate-pulse mt-1" />
                <div style={{ width: '45px', height: '8px', borderRadius: '4px' }} className="bg-warm-deep/60 animate-pulse mt-1" />
                <div style={{ width: '50px', height: '18px', borderRadius: '6px' }} className="bg-warm-deep/60 animate-pulse mt-1.5" />
              </div>
            ))}
          </div>
        )}

        {!isSearching && searchResults.length > 0 && (
          <div style={{ marginTop: '.75rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '.6rem', maxHeight: '300px', overflowY: 'auto', padding: '.25rem 0' }}>
            {searchResults.map((r, i) => {
              const tint = CARD_TINTS[i % CARD_TINTS.length];
              const accent = COLORS[i % COLORS.length];
              return (
                <div
                  key={r.id}
                  onClick={() => selectSearchResult(r)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.35rem', padding: '.7rem .4rem',
                    cursor: 'pointer', borderRadius: '10px', border: `2px solid ${accent}44`, background: tint,
                    transition: 'all .2s', textAlign: 'center', position: 'relative', overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 4px 12px ${accent}33`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${accent}44`; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: accent, borderRadius: '8px 8px 0 0' }} />
                  {r.coverImage
                    ? <img src={r.coverImage} alt="" style={{ width: 44, height: 64, borderRadius: 6, objectFit: 'cover', boxShadow: '0 2px 6px rgba(0,0,0,.12)' }} />
                    : <div style={{ width: 44, height: 64, borderRadius: 6, background: `${accent}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>📖</div>
                  }
                  <div style={{ fontWeight: 600, fontSize: '.78rem', lineHeight: 1.2, color: '#333' }}>{r.title}</div>
                  <div style={{ fontSize: '.68rem', color: accent, opacity: .8 }}>{r.author}{r.totalPages ? ` · ${r.totalPages}p` : ''}</div>
                  <span style={{ fontSize: '.68rem', color: '#fff', background: accent, borderRadius: '6px', padding: '.15rem .6rem', fontWeight: 600 }}>+ Select</span>
                </div>
              );
            })}
          </div>
        )}

        {showSearch && searchResults.length === 0 && searchQuery && !isSearching && (
          <p style={{ fontSize: '.82rem', color: 'var(--muted)', marginTop: '.5rem' }}>No results found. Try a different search or fill in manually below.</p>
        )}
      </div>

      <span className="fsl">Book Details</span>
      <div className="fr">
        <div className="fg"><label>Title *</label><input type="text" placeholder="e.g. The Alchemist" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
        <div className="fg"><label>Author *</label><input type="text" placeholder="e.g. Paulo Coelho" value={author} onChange={(e) => setAuthor(e.target.value)} /></div>
      </div>
      <div className="fr">
        <div className="fg">
          <label>Genre</label>
          <select value={genre} onChange={(e) => setGenre(e.target.value)}>
            {['Fiction', 'Non-Fiction', 'Fantasy', 'Science Fiction', 'Mystery', 'Romance', 'Biography', 'Self-Help', 'History', 'Other'].map((g) => <option key={g}>{g}</option>)}
          </select>
        </div>
        <div className="fg">
          <label>Total Pages *</label>
          <input type="number" min="1" placeholder="e.g. 256" value={pages} onChange={(e) => setPages(e.target.value ? Number(e.target.value) : '')} />
          <span style={{ fontSize: '.72rem', color: 'var(--muted)', marginTop: '.3rem', display: 'block' }}>{detectedPages ? `📄 ${detectedPages} pages detected from PDF` : ''}</span>
        </div>
      </div>
      <div className="fg"><label>Description (optional)</label><textarea rows={2} placeholder="A short note about this book…" style={{ resize: 'vertical' }} value={desc} onChange={(e) => setDesc(e.target.value)}></textarea></div>
      <div className="fdiv"></div>
      <span className="fsl">Appearance & PDF</span>
      <span className="cl">Cover Color</span>
      <div className="cr" id="acr">
        {COLORS.map((c) => (
          <div key={c} className={`co${color === c ? ' sel' : ''}`} data-c={c} style={{ background: c }} onClick={() => setColor(c)}></div>
        ))}
      </div>
      <div
        className={`fu${pdfFile ? ' has' : ''}`}
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('drag'); }}
        onDragLeave={(e) => { e.currentTarget.classList.remove('drag'); }}
        onDrop={async (e) => { e.preventDefault(); e.currentTarget.classList.remove('drag'); const f = e.dataTransfer.files[0]; if (f) await handlePdf(f); }}
      >
        <p id="ul">{pdfLabel}</p>
        <p style={{ fontSize: '.72rem', color: 'var(--muted)', marginTop: '.3rem' }}>PDFs over 5MB will be auto-compressed.</p>
        <div id="add-wrap" style={{ display: 'none', marginTop: '.6rem' }}>
          <div style={{ height: '4px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
            <div id="add-bar" style={{ height: '100%', background: 'var(--amber)', width: '0%', transition: 'width .3s', borderRadius: '4px' }}></div>
          </div>
          <p id="add-label" style={{ fontSize: '.72cm', color: 'var(--amber)', marginTop: '.3rem' }}>⏳ Compressing...</p>
        </div>
      </div>
      <input type="file" id="fi" ref={fileRef} accept=".pdf" style={{ display: 'none' }} onChange={async (e) => { const f = e.target.files?.[0]; if (f) await handlePdf(f); }} />
      <div className="fa">
        <button className="btn" onClick={handleSubmit}>Add to Library →</button>
        <button className="btn-o" onClick={resetForm}>Clear</button>
        <button className="btn-o" onClick={() => { resetForm(); onClose(); }}>Cancel</button>
      </div>
    </div>
  );
};
