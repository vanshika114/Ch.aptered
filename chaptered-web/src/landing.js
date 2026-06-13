
// ─── DATABASE ────────────────────────────────────────────────────────────────
const DB = {
  BOOKS_KEY: 'chaptered_books_v2',
  SESSIONS_KEY: 'chaptered_sessions_v2',
  FILES_KEY: 'chaptered_files_v2',

  getBooks() { try { return JSON.parse(localStorage.getItem(this.BOOKS_KEY) || '[]'); } catch { return []; } },
  saveBooks(b) { localStorage.setItem(this.BOOKS_KEY, JSON.stringify(b)); },

  getSessions() { try { return JSON.parse(localStorage.getItem(this.SESSIONS_KEY) || '[]'); } catch { return []; } },
  saveSessions(s) { localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(s)); },

  getFiles() { try { return JSON.parse(localStorage.getItem(this.FILES_KEY) || '{}'); } catch { return {}; } },
  saveFiles(f) { localStorage.setItem(this.FILES_KEY, JSON.stringify(f)); },

  addBook(book) { const b = this.getBooks(); b.push(book); this.saveBooks(b); },
  deleteBook(id) {
    this.saveBooks(this.getBooks().filter(b => b.id !== id));
    this.saveSessions(this.getSessions().filter(s => s.bookId !== id));
    const f = this.getFiles(); delete f[id]; this.saveFiles(f);
  },
  addSession(session) { const s = this.getSessions(); s.push(session); this.saveSessions(s); },
  deleteSession(id) { this.saveSessions(this.getSessions().filter(s => s.id !== id)); },
  getSessionsForBook(bookId) { return this.getSessions().filter(s => s.bookId === bookId); },
  getPagesReadForBook(bookId) { return this.getSessionsForBook(bookId).reduce((a,s) => a + (s.pages||0), 0); },
  getTotalPagesRead() { return this.getSessions().reduce((a,s) => a + (s.pages||0), 0); },
  getCurrentStreak() {
    const sessions = this.getSessions();
    if (!sessions.length) return 0;
    const days = [...new Set(sessions.map(s => s.date))].sort().reverse();
    const today = new Date().toISOString().slice(0,10);
    const yest  = new Date(Date.now()-86400000).toISOString().slice(0,10);
    if (days[0] !== today && days[0] !== yest) return 0;
    let streak = 1;
    for (let i = 1; i < days.length; i++) {
      const diff = (new Date(days[i-1]) - new Date(days[i])) / 86400000;
      if (diff === 1) streak++; else break;
    }
    return streak;
  }
};

// ─── STATE ────────────────────────────────────────────────────────────────────
let selectedColor = '#8B3A3A';
let selectedFile  = null;

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function esc(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function fmt(dateStr) {
  return new Date(dateStr+'T12:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'short'});
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
function toast(msg, type = 'success') {
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.textContent = msg;
  document.getElementById('toast-wrap').appendChild(el);
  setTimeout(() => el.remove(), 2800);
}

// ─── HERO STATS ───────────────────────────────────────────────────────────────
function updateHeroStats() {
  const books = DB.getBooks();
  const pages = DB.getTotalPagesRead();
  document.getElementById('heroTotalBooks').textContent = books.length;
  document.getElementById('heroTotalPages').textContent = pages >= 1000 ? (pages/1000).toFixed(1)+'k' : pages;
  document.getElementById('heroStreak').textContent     = DB.getCurrentStreak();
}

// ─── COLOR PICKER ─────────────────────────────────────────────────────────────
document.querySelectorAll('.color-dot').forEach(el => {
  el.addEventListener('click', () => {
    document.querySelectorAll('.color-dot').forEach(e => {
      e.classList.remove('selected');
      e.setAttribute('aria-checked','false');
      e.setAttribute('tabindex','-1');
    });
    el.classList.add('selected');
    el.setAttribute('aria-checked','true');
    el.setAttribute('tabindex','0');
    selectedColor = el.dataset.color;
  });
});

// ─── FILE UPLOAD ──────────────────────────────────────────────────────────────
document.getElementById('fileInput').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  selectedFile = file;
  document.getElementById('uploadLabel').textContent = '✓ ' + file.name;
  document.getElementById('uploadArea').classList.add('has-file');
});
document.getElementById('uploadArea').addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); document.getElementById('fileInput').click(); }
});

// ─── ADD BOOK ─────────────────────────────────────────────────────────────────
function addBook() {
  const title  = document.getElementById('bookTitle').value.trim();
  const author = document.getElementById('bookAuthor').value.trim();
  const genre  = document.getElementById('bookGenre').value;
  const pages  = parseInt(document.getElementById('bookPages').value);
  const desc   = document.getElementById('bookDesc').value.trim();

  if (!title || !author)     { toast('Please fill in Title and Author.','error'); return; }
  if (!pages || pages < 1)   { toast('Please enter a valid page count.','error'); return; }

  const id = Date.now().toString(36) + Math.random().toString(36).slice(2,6);
  const book = { id, title, author, genre, pages, desc, color: selectedColor, hasPdf: !!selectedFile, addedAt: new Date().toISOString() };

  if (selectedFile) {
    const reader = new FileReader();
    reader.onload = ev => {
      const f = DB.getFiles(); f[id] = ev.target.result; DB.saveFiles(f);
    };
    reader.readAsDataURL(selectedFile);
  }

  DB.addBook(book);
  resetForm();
  toast('📚 "' + title + '" added to your library!');
  updateHeroStats(); renderShelf(); updateTrackerUI();
  switchTab('shelf');
}

function resetForm() {
  ['bookTitle','bookAuthor','bookPages','bookDesc'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('uploadLabel').textContent = '📄 Upload PDF (optional) — click to browse';
  document.getElementById('uploadArea').classList.remove('has-file');
  document.getElementById('fileInput').value = '';
  selectedFile = null;
}

// ─── TABS ─────────────────────────────────────────────────────────────────────
function switchTab(tabId) {
  document.querySelectorAll('.lib-tab').forEach(b => {
    const active = b.dataset.tab === tabId;
    b.classList.toggle('active', active);
    b.setAttribute('aria-selected', active);
  });
  document.querySelectorAll('.lib-panel').forEach(p => p.classList.toggle('active', p.id === 'tab-' + tabId));
  if (tabId === 'tracker') updateTrackerUI();
  if (tabId === 'shelf') renderShelf();
}
document.querySelectorAll('.lib-tab').forEach(btn => btn.addEventListener('click', () => switchTab(btn.dataset.tab)));

// ─── SHELF ────────────────────────────────────────────────────────────────────
function getProgressPct(book) {
  return Math.min(100, Math.round((DB.getPagesReadForBook(book.id) / book.pages) * 100));
}

function renderShelf() {
  const q      = (document.getElementById('searchInput').value || '').toLowerCase();
  const genre  = document.getElementById('filterGenre').value;
  const status = document.getElementById('filterStatus').value;
  let books = DB.getBooks();

  if (q)      books = books.filter(b => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q));
  if (genre)  books = books.filter(b => b.genre === genre);
  if (status) books = books.filter(b => {
    const p = getProgressPct(b);
    if (status === 'completed')   return p >= 100;
    if (status === 'reading')     return p > 0 && p < 100;
    if (status === 'not_started') return p === 0;
    return true;
  });

  const grid  = document.getElementById('booksGrid');
  const empty = document.getElementById('shelfEmpty');

  if (!books.length) { empty.style.display = 'block'; grid.innerHTML = ''; return; }
  empty.style.display = 'none';

  grid.innerHTML = books.map(b => {
    const pct       = getProgressPct(b);
    const pagesRead = DB.getPagesReadForBook(b.id);
    return `
      <div class="book-card" role="listitem" onclick="openBook('${b.id}')" tabindex="0"
           onkeydown="if(event.key==='Enter')openBook('${b.id}')" aria-label="${esc(b.title)} by ${esc(b.author)}">
        <button class="book-delete"
          onclick="event.stopPropagation();deleteBook('${b.id}')"
          aria-label="Remove ${esc(b.title)}"
          title="Remove book">✕</button>
        <div class="book-cover ${b.hasPdf ? 'book-has-pdf' : ''}"
             style="background:linear-gradient(145deg,${b.color} 0%,${b.color}bb 100%)"
             aria-hidden="true">
          <div class="book-spine"></div>
          <div class="book-cover-title">${esc(b.title)}</div>
        </div>
        <div class="book-meta-title">${esc(b.title)}</div>
        <div class="book-meta-author">${esc(b.author)}</div>
        <span class="book-meta-genre">${esc(b.genre)}</span>
        <div class="book-progress-track" aria-hidden="true">
          <div class="book-progress-fill" style="width:${pct}%"></div>
        </div>
        <span class="book-progress-pct" aria-label="${pagesRead} of ${b.pages} pages, ${pct}% complete">${pagesRead}/${b.pages} · ${pct}%</span>
      </div>`;
  }).join('');
}

function deleteBook(id) {
  const book = DB.getBooks().find(b => b.id === id);
  if (!book) return;
  if (!confirm(`Remove "${book.title}" from your library? This will also delete all logged sessions.`)) return;
  DB.deleteBook(id);
  toast('Book removed.', 'error');
  renderShelf(); updateHeroStats(); updateTrackerUI();
}

// ─── OPEN BOOK ────────────────────────────────────────────────────────────────
function openBook(id) {
  const book = DB.getBooks().find(b => b.id === id);
  if (!book) return;
  document.getElementById('modalTitle').textContent = book.title + ' · ' + book.author;
  const body  = document.getElementById('readerBody');
  const files = DB.getFiles();
  if (files[id]) {
    body.innerHTML = `<iframe src="${files[id]}" title="${esc(book.title)}"></iframe>`;
  } else {
    body.innerHTML = `<div class="no-pdf">
      <span class="icon">📖</span>
      <p>No PDF uploaded for this book.</p>
      <small>Re-add the book and attach a PDF to read it here.</small>
    </div>`;
  }
  const pct = getProgressPct(book);
  document.getElementById('bookInfoPanel').innerHTML = `
    <div class="book-info-row">
      <div class="book-info-item"><label>Genre</label><span>${esc(book.genre)}</span></div>
      <div class="book-info-item"><label>Pages</label><span>${esc(String(book.pages))}</span></div>
      <div class="book-info-item"><label>Author</label><span>${esc(book.author)}</span></div>
      <div class="book-info-item"><label>Progress</label><span>${pct}%</span></div>
    </div>`;
  document.getElementById('readerModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('readerModal').classList.remove('open');
  document.getElementById('readerBody').innerHTML = '';
  document.body.style.overflow = '';
}
document.getElementById('readerModal').addEventListener('click', function(e) { if (e.target === this) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// ─── TRACKER ─────────────────────────────────────────────────────────────────
function updateTrackerUI() { renderTrackerStats(); renderLogBookSelector(); renderSessions(); }

function renderTrackerStats() {
  const books    = DB.getBooks();
  const sessions = DB.getSessions();
  const total    = DB.getTotalPagesRead();
  const streak   = DB.getCurrentStreak();
  const done     = books.filter(b => getProgressPct(b) >= 100).length;

  document.getElementById('trackerStats').innerHTML = `
    <div class="t-stat"><div class="t-stat-num">${books.length}</div><div class="t-stat-label">Books in Library</div></div>
    <div class="t-stat"><div class="t-stat-num accent">${total.toLocaleString()}</div><div class="t-stat-label">Pages Read</div></div>
    <div class="t-stat"><div class="t-stat-num">${sessions.length}</div><div class="t-stat-label">Sessions Logged</div></div>
    <div class="t-stat"><div class="t-stat-num accent">${streak} 🔥</div><div class="t-stat-label">Day Streak</div></div>
    <div class="t-stat"><div class="t-stat-num">${done}</div><div class="t-stat-label">Books Finished</div></div>`;
}

function renderLogBookSelector() {
  const books = DB.getBooks();
  document.getElementById('logBook').innerHTML = books.length
    ? books.map(b => `<option value="${b.id}">${esc(b.title)}</option>`).join('')
    : '<option value="">No books yet — add one first</option>';
}

function logSession() {
  const bookId = document.getElementById('logBook').value;
  const pages  = parseInt(document.getElementById('logPages').value);
  const note   = document.getElementById('logNote').value.trim();

  if (!bookId)         { toast('Add a book first!','error'); return; }
  if (!pages || pages < 1) { toast('Enter a valid page count.','error'); return; }

  const book = DB.getBooks().find(b => b.id === bookId);
  if (!book) return;

  DB.addSession({ id: Date.now().toString(36), bookId, pages, note, date: new Date().toISOString().slice(0,10), timestamp: new Date().toISOString() });
  document.getElementById('logPages').value = '';
  document.getElementById('logNote').value  = '';

  const pct = Math.min(100, Math.round((DB.getPagesReadForBook(bookId) / book.pages) * 100));
  toast(`✓ Logged ${pages} pages in "${book.title}" (${pct}% done)`);
  updateHeroStats(); renderTrackerStats(); renderSessions(); renderShelf();
}

function renderSessions() {
  const books     = DB.getBooks();
  const container = document.getElementById('sessionsContainer');
  if (!books.length) { container.innerHTML = '<div class="no-sessions">No books yet. Add some books and start logging!</div>'; return; }

  const sorted = [
    ...books.filter(b => DB.getSessionsForBook(b.id).length > 0),
    ...books.filter(b => DB.getSessionsForBook(b.id).length === 0)
  ];

  container.innerHTML = sorted.map(book => {
    const sessions  = DB.getSessionsForBook(book.id).sort((a,b) => b.timestamp.localeCompare(a.timestamp));
    const pagesRead = DB.getPagesReadForBook(book.id);
    const pct       = Math.min(100, Math.round((pagesRead / book.pages) * 100));

    return `<div class="sessions-book">
      <div class="sessions-book-header">
        <div>
          <div class="sessions-book-title">${esc(book.title)}</div>
          <div class="sessions-book-meta">${esc(book.author)} · ${esc(book.genre)}</div>
        </div>
        <div class="sessions-book-pct">${pagesRead} / ${book.pages} pages<br><strong>${pct}%</strong></div>
      </div>
      <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
      ${pct >= 100 ? '<div class="completed-badge">🎉 Completed!</div>' : ''}
      <div class="sessions-list">
        ${sessions.length ? sessions.map(s => `
          <div class="session-item">
            <span class="session-date">${fmt(s.date)}</span>
            <span class="session-pages">${s.pages}<sub>pages</sub></span>
            <span class="session-note">${s.note ? esc(s.note) : '—'}</span>
            <button class="session-del" onclick="deleteSession('${s.id}')" aria-label="Delete session">✕</button>
          </div>`).join('') : '<div class="no-sessions" style="padding:.75rem 0">No sessions yet — log your first read above.</div>'}
      </div>
    </div>`;
  }).join('');
}

function deleteSession(id) {
  DB.deleteSession(id);
  toast('Session removed.','error');
  updateHeroStats(); renderTrackerStats(); renderSessions(); renderShelf();
}

// ─── NAV ──────────────────────────────────────────────────────────────────────
const menuBtn    = document.getElementById('menuBtn');
const navDrawer  = document.getElementById('navDrawer');

menuBtn.addEventListener('click', () => {
  const open = navDrawer.classList.toggle('open');
  menuBtn.classList.toggle('open', open);
  menuBtn.setAttribute('aria-expanded', open);
  menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
});

// Close drawer on any link click
document.querySelectorAll('.nav-drawer a, #navLinks a').forEach(a => {
  a.addEventListener('click', () => {
    navDrawer.classList.remove('open');
    menuBtn.classList.remove('open');
    menuBtn.setAttribute('aria-expanded','false');
    menuBtn.setAttribute('aria-label','Open menu');
  });
});

// ─── SCROLL REVEAL ────────────────────────────────────────────────────────────
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    // Stagger children if it's a grid
    const children = el.querySelectorAll('.feat-card,.how-step,.roadmap-card,.benefit-card');
    if (children.length) {
      children.forEach((c, i) => setTimeout(() => c.classList.add('visible'), i * 70));
    } else {
      el.classList.add('visible');
    }
    revealObs.unobserve(el);
  });
}, { threshold: 0.07 });

document.querySelectorAll('.reveal, .features-grid, .how-grid, .roadmap-grid, .benefits-grid').forEach(el => revealObs.observe(el));

// ─── INIT ─────────────────────────────────────────────────────────────────────
updateHeroStats();
renderShelf();
=======
<section class="features" id="features">
  <div class="fh">
    <div class="stag">Features</div>
    <h2 class="stitle">Everything you need to read more</h2>
    <p class="ssub">From personal tracking to social clubs, Chaptered has all the tools to make reading a habit you love.</p>
  </div>
  <div class="fg">
    <div class="fc"><div class="fi a">🔐</div><h3>Authentication</h3><p>JWT-based login & signup with secure password hashing and persistent sessions across devices.</p></div>
    <div class="fc"><div class="fi g">📖</div><h3>Reading Tracker</h3><p>Add books manually or via search. Log reading sessions with pages and time. Build streaks.</p></div>
    <div class="fc"><div class="fi a">📊</div><h3>Dashboard</h3><p>Active books overview, weekly reading insights, and quick session logging all in one view.</p></div>
    <div class="fc"><div class="fi g">📚</div><h3>In-Browser Reader</h3><p>Upload a PDF and read it directly in Chaptered — no downloads, no external apps needed.</p></div>
    <div class="fc"><div class="fi a">👥</div><h3>Book Clubs</h3><p>Create or join clubs with invite codes. Track member reading progress together.</p></div>
    <div class="fc"><div class="fi g">💬</div><h3>Real-Time Chat</h3><p>Socket.io powered messaging with persistent history and timestamps inside every club.</p></div>
    <div class="fc"><div class="fi a">🗳️</div><h3>Book Voting</h3><p>Suggest books, vote within clubs, and let the community auto-select the next read.</p></div>
    <div class="fc"><div class="fi g">🤖</div><h3>AI Reading Coach</h3><p>Personalized recommendations, spoiler-free discussions, and an intelligent reading assistant.</p></div>
    <div class="fc"><div class="fi a">📱</div><h3>Mobile App</h3><p>React Native mobile app, push notifications, video book club meetings, and reading challenges.</p></div>
  </div>
</section>

<section id="how">
  <div style="text-align:center">
    <div class="stag">How it Works</div>
    <h2 class="stitle">Up and reading in minutes</h2>
    <p class="ssub" style="margin:.7rem auto 0">Sign up, add your books, and start your reading journey with your community.</p>
  </div>
  <div class="hg">
    <div class="hs"><div class="hn">1</div><h3>Create an Account</h3><p>Sign up in seconds with a secure JWT-authenticated account that keeps your data private.</p></div>
    <div class="hs"><div class="hn">2</div><h3>Add Your Books</h3><p>Enter title, author, genre and pages. Optionally upload a PDF to read it right inside Chaptered.</p></div>
    <div class="hs"><div class="hn">3</div><h3>Log Sessions</h3><p>Track every reading session — how many pages, a quick note. Watch your progress bar fill up.</p></div>
    <div class="hs"><div class="hn">4</div><h3>Build Your Streak</h3><p>Log daily sessions, watch your streaks grow, and see your stats live on the hero panel.</p></div>
  </div>
</section>

<section class="why" id="why">
  <div style="text-align:center">
    <div class="stag">Why Reading Matters</div>
    <h2 class="stitle">The quiet superpower</h2>
    <p class="ssub" style="margin:.7rem auto 0">Reading isn't just a hobby — it's one of the most powerful habits you can build.</p>
  </div>
  <div class="bg">
    <div class="bc"><span class="bi">🧠</span><h3>Sharpens Your Mind</h3><p>Regular reading keeps the brain active, improves memory retention, and slows cognitive decline over time.</p></div>
    <div class="bc"><span class="bi">💬</span><h3>Builds Empathy</h3><p>Fiction readers consistently score higher on empathy tests — stepping into characters' lives broadens your emotional range.</p></div>
    <div class="bc"><span class="bi">😌</span><h3>Reduces Stress</h3><p>Just six minutes of reading can reduce stress levels by up to 68% — more effective than music or a walk.</p></div>
    <div class="bc"><span class="bi">✍️</span><h3>Improves Writing</h3><p>Reading widely exposes you to different styles, vocabularies, and structures that naturally enrich your own writing.</p></div>
  </div>
</section>

<section>
  <div style="text-align:center">
    <div class="stag">Tech Stack</div>
    <h2 class="stitle">Built with modern tools</h2>
  </div>
  <div class="tg">
    <div class="tgr"><div class="tgt">Frontend</div><div class="chips"><span class="chip">React 18</span><span class="chip">TypeScript</span><span class="chip">Vite</span><span class="chip">Tailwind CSS</span><span class="chip">Zustand</span><span class="chip">React Router</span><span class="chip">Axios</span><span class="chip">Socket.io Client</span></div></div>
    <div class="tgr"><div class="tgt">Backend</div><div class="chips"><span class="chip">Node.js</span><span class="chip">Express</span><span class="chip">TypeScript</span><span class="chip">MongoDB</span><span class="chip">Mongoose</span><span class="chip">JWT Auth</span><span class="chip">Socket.io</span></div></div>
    <div class="tgr"><div class="tgt">DevOps</div><div class="chips"><span class="chip">Vercel</span><span class="chip">Railway</span><span class="chip">MongoDB Atlas</span></div></div>
  </div>
</section>

<section id="roadmap" style="background:var(--warm)">
  <div style="text-align:center">
    <div class="stag">Roadmap</div>
    <h2 class="stitle">What's coming next</h2>
  </div>
  <div class="rm-g">
    <div class="rm-c"><h3>✅ Phase 1 — MVP</h3><ul><li>JWT Authentication</li><li>Reading Tracker & Streaks</li><li>In-Browser PDF Reader</li><li>Book Clubs & Invite Codes</li><li>Real-Time Chat (Socket.io)</li><li>Book Voting System</li></ul></div>
    <div class="rm-c"><h3>🚧 Phase 2 — Premium</h3><ul><li>Stripe-based Premium Tier</li><li>AI Reading Coach</li><li>Personalized Recommendations</li><li>Spoiler-Free Discussions</li></ul></div>
  </div>
</section>

<footer>
  <span class="fl">Ch<span>.</span>aptered</span>
  <p>📚 Chaptered — Transforming reading into a shared experience.</p>
  <p>Built by <strong style="color:var(--cream)">Vanshika Sharma</strong> · Open to collaborations and contributions</p>
  <p style="margin-top:.4rem">Turning pages into progress and readers into communities.</p>
</footer>
<div id="tc"></div>

<script>
const DB={
  B:'chaptered_books_v2',S:'chaptered_sessions_v2',
  books(){try{return JSON.parse(localStorage.getItem(this.B)||'[]')}catch{return[]}},
  sessions(){try{return JSON.parse(localStorage.getItem(this.S)||'[]')}catch{return[]}},
  totalPages(){return this.sessions().reduce((a,s)=>a+(s.pages||0),0)},
  streak(){
    const ss=this.sessions();if(!ss.length)return 0;
    const days=[...new Set(ss.map(s=>s.date))].sort().reverse();
    const t=new Date().toISOString().slice(0,10),y=new Date(Date.now()-86400000).toISOString().slice(0,10);
    if(days[0]!==t&&days[0]!==y)return 0;
    let n=1;for(let i=1;i<days.length;i++){if((new Date(days[i-1])-new Date(days[i]))/86400000===1)n++;else break;}
    return n;
  }
};
function upd(){
  const b=DB.books(),p=DB.totalPages(),s=DB.streak();
  document.getElementById('hb').textContent=b.length;
  document.getElementById('hp').textContent=p>=1000?(p/1000).toFixed(1)+'k':p;
  document.getElementById('hs').textContent=s;
}
upd();
const obs=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('vis');e.target.querySelectorAll('.fc,.hs,.rm-c,.bc').forEach((c,i)=>setTimeout(()=>c.classList.add('vis'),i*80))}})},{threshold:.08});
document.querySelectorAll('.fg,.hg,.rm-g,.bg,.fc,.hs,.rm-c,.bc').forEach(el=>obs.observe(el));
document.getElementById('mb').addEventListener('click',()=>document.getElementById('nl').classList.toggle('open'));
document.querySelectorAll('#nl a').forEach(a=>a.addEventListener('click',()=>document.getElementById('nl').classList.remove('open')));

