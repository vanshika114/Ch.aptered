import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLibraryStore } from '../store/useLibraryStore';
import '../landing.css';

export const Landing = () => {
  const books = useLibraryStore((s) => s.books);
  const sessions = useLibraryStore((s) => s.sessions);

  const totalPages = sessions.reduce((a, s) => a + s.pages, 0);
  const streak = getStreak(sessions);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('vis');
            e.target.querySelectorAll('.fc,.hs,.rm-c,.bc').forEach((c, i) =>
              setTimeout(() => c.classList.add('vis'), i * 80)
            );
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08 }
    );
    document.querySelectorAll('.fg,.hg,.rm-g,.bg,.fc,.hs,.rm-c,.bc').forEach((el) => obs.observe(el));
  }, []);

  return (
    <div>


      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-wm">📚</div>
        <div className="hero-inner">
          <div className="badge">📚 Social Reading Platform · MVP Phase 1</div>
          <h1>Read <em>Together</em>,<br/>Grow Together.</h1>
          <p>Chaptered turns reading from a solo habit into a shared experience — track books, log sessions, build streaks, and read right in your browser.</p>
          <div className="actions">
            <Link to="/library" className="btn">Start Reading →</Link>
            <a href="#features" className="btn-o">Explore Features</a>
          </div>
          <div className="stats">
            <div><div className="sn" id="hb">{books.length}</div><div className="sl">Books Added</div></div>
            <div><div className="sn" id="hp">{totalPages >= 1000 ? (totalPages / 1000).toFixed(1) + 'k' : totalPages}</div><div className="sl">Pages Read</div></div>
            <div><div className="sn" id="hs">{streak}</div><div className="sl">Day Streak 🔥</div></div>
          </div>
        </div>
      </section>

      <section className="features" id="features">
        <div className="fh">
          <div className="stag">Features</div>
          <h2 className="stitle">Everything you need to read more</h2>
          <p className="ssub">From personal tracking to social clubs, Chaptered has all the tools to make reading a habit you love.</p>
        </div>
        <div className="fg">
          {[
            ['🔐','Authentication','JWT-based login & signup with secure password hashing and persistent sessions across devices.'],
            ['📖','Reading Tracker','Add books manually or via search. Log reading sessions with pages and time. Build streaks.'],
            ['📊','Dashboard','Active books overview, weekly reading insights, and quick session logging all in one view.'],
            ['📚','In-Browser Reader','Upload a PDF and read it directly in Chaptered — no downloads, no external apps needed.'],
            ['👥','Book Clubs','Create or join clubs with invite codes. Track member reading progress together.'],
            ['💬','Real-Time Chat','Socket.io powered messaging with persistent history and timestamps inside every club.'],
            ['🗳️','Book Voting','Suggest books, vote within clubs, and let the community auto-select the next read.'],
            ['🤖','AI Reading Coach','Personalized recommendations, spoiler-free discussions, and an intelligent reading assistant.'],
            ['📱','Mobile App','React Native mobile app, push notifications, video book club meetings, and reading challenges.'],
          ].map(([emoji, title, desc], i) => (
              <div key={i} className="bc">
                <span className="bi">{emoji}</span>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
        </div>
      </section>

      <section id="how">
        <div style={{ textAlign: 'center' }}>
          <div className="stag">How it Works</div>
          <h2 className="stitle">Up and reading in minutes</h2>
          <p className="ssub" style={{ margin: '.7rem auto 0' }}>Sign up, add your books, and start your reading journey with your community.</p>
        </div>
        <div className="hg">
          <div className="hs"><div className="hn">1</div><h3>Create an Account</h3><p>Sign up in seconds with a secure JWT-authenticated account that keeps your data private.</p></div>
          <div className="hs"><div className="hn">2</div><h3>Add Your Books</h3><p>Enter title, author, genre and pages. Optionally upload a PDF to read it right inside Chaptered.</p></div>
          <div className="hs"><div className="hn">3</div><h3>Log Sessions</h3><p>Track every reading session — how many pages, a quick note. Watch your progress bar fill up.</p></div>
          <div className="hs"><div className="hn">4</div><h3>Build Your Streak</h3><p>Log daily sessions, watch your streaks grow, and see your stats live on the hero panel.</p></div>
        </div>
      </section>

      <section className="why" id="why">
        <div style={{ textAlign: 'center' }}>
          <div className="stag">Why Reading Matters</div>
          <h2 className="stitle">The quiet superpower</h2>
          <p className="ssub" style={{ margin: '.7rem auto 0' }}>Reading isn't just a hobby — it's one of the most powerful habits you can build.</p>
        </div>
        <div className="bg">
          <div className="bc"><span className="bi">🧠</span><h3>Sharpens Your Mind</h3><p>Regular reading keeps the brain active, improves memory retention, and slows cognitive decline over time.</p></div>
          <div className="bc"><span className="bi">💬</span><h3>Builds Empathy</h3><p>Fiction readers consistently score higher on empathy tests — stepping into characters' lives broadens your emotional range.</p></div>
          <div className="bc"><span className="bi">😌</span><h3>Reduces Stress</h3><p>Just six minutes of reading can reduce stress levels by up to 68% — more effective than music or a walk.</p></div>
          <div className="bc"><span className="bi">✍️</span><h3>Improves Writing</h3><p>Reading widely exposes you to different styles, vocabularies, and structures that naturally enrich your own writing.</p></div>
        </div>
      </section>

      <section>
        <div style={{ textAlign: 'center' }}>
          <div className="stag">Tech Stack</div>
          <h2 className="stitle">Built with modern tools</h2>
        </div>
        <div className="tg">
          <div className="tgr"><div className="tgt">Frontend</div><div className="chips"><span className="chip">React 19</span><span className="chip">TypeScript</span><span className="chip">Vite</span><span className="chip">Tailwind CSS</span><span className="chip">Zustand</span><span className="chip">React Router</span><span className="chip">Axios</span><span className="chip">Socket.io Client</span></div></div>
          <div className="tgr"><div className="tgt">Backend</div><div className="chips"><span className="chip">Node.js</span><span className="chip">Express</span><span className="chip">TypeScript</span><span className="chip">MongoDB</span><span className="chip">Mongoose</span><span className="chip">JWT Auth</span><span className="chip">Socket.io</span></div></div>
          <div className="tgr"><div className="tgt">DevOps</div><div className="chips"><span className="chip">Vercel</span><span className="chip">Railway</span><span className="chip">MongoDB Atlas</span></div></div>
        </div>
      </section>

      <section id="roadmap" style={{ background: 'var(--warm)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="stag">🗺️ Roadmap</div>
          <h2 className="stitle">What's coming next</h2>
        </div>
        <div className="rm-g">
          <div className="rm-c"><h3>Phase 1 • MVP</h3><ul><li>User Authentication</li><li>Book Search (Google Books API)</li><li>Manual Book Entry</li><li>Reading Session Logging</li><li>Reading Streaks</li><li>Personal Dashboard</li><li>Book Clubs</li><li>Invite-Based Club Joining</li><li>Real-Time Club Chat (Socket.io)</li><li>Club Book Voting</li></ul></div>
          <div className="rm-c"><h3>Phase 2</h3><ul><li>Premium Features</li><li>AI Reading Coach</li><li>Personalized Recommendations</li><li>Advanced Reading Analytics</li></ul></div>
          <div className="rm-c"><h3>Phase 3+</h3><ul><li>Mobile App</li><li>Video Book Club Meetings</li><li>Reading Challenges</li><li>Achievement Badges</li><li>Push Notifications</li></ul></div>
        </div>
      </section>

      <footer>
        <span className="fl">Ch<span>.</span>aptered</span>
        <p>📚 Chaptered — Transforming reading into a shared experience.</p>
        <p>Built by <strong style={{ color: 'var(--cream)' }}>Vanshika Sharma</strong> · Open to collaborations and contributions</p>
        <p style={{ marginTop: '.4rem' }}>Turning pages into progress and readers into communities.</p>
      </footer>

      <div id="tc"></div>
    </div>
  );
};

function getStreak(sessions: { date: string }[]): number {
  if (!sessions.length) return 0;
  const days = [...new Set(sessions.map((s) => s.date))].sort().reverse();
  const t = new Date().toISOString().slice(0, 10);
  const y = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (days[0] !== t && days[0] !== y) return 0;
  let n = 1;
  for (let i = 1; i < days.length; i++) {
    if ((new Date(days[i - 1]).getTime() - new Date(days[i]).getTime()) / 86400000 === 1) n++;
    else break;
  }
  return n;
}
