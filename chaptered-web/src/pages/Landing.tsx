
import { Link } from 'react-router-dom';
import '../landing.css';

export const Landing = () => {
  return (
    <>
      <nav className="nav">
        <Link to="/" className="nav-logo">Ch<span>.</span>aptered</Link>
        <ul className="nav-links">
          <li><a href="#features">Features</a></li>
          <li><a href="#how">How it Works</a></li>
          <li><a href="#why">Why Read</a></li>
          <li><a href="#roadmap">Roadmap</a></li>
        </ul>
        <div className="nav-cta">
          <Link to="/library" className="btn btn-primary btn-sm">Enter Library →</Link>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-ornament">C</div>
        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot"></span> v1.0 — Now in Development
          </div>
          <h1>Turn reading from a solo habit into a <em>shared experience.</em></h1>
          <p className="hero-sub">
            Track your reading, discover insights, and join book clubs that actually meet. 
            Chaptered is the modern, social way to read.
          </p>
          <div className="hero-actions">
            <Link to="/library" className="btn btn-primary">Go to Library</Link>
            <a href="#features" className="btn btn-secondary">Explore Features</a>
          </div>
          <div className="hero-stats">
            <div>
              <div className="hero-stat-num">0</div>
              <div className="hero-stat-label">Books Read</div>
            </div>
            <div>
              <div className="hero-stat-num">0</div>
              <div className="hero-stat-label">Active Clubs</div>
            </div>
            <div>
              <div className="hero-stat-num">0</div>
              <div className="hero-stat-label">Total Pages</div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="section section-warm">
        <div className="section-inner">
          <header className="section-header reveal">
            <span className="section-tag">Features</span>
            <h2 className="section-title">Everything you need, <br/>nothing you don't.</h2>
            <p className="section-sub">A clean, focused environment designed to help you read more and connect with others over great books.</p>
          </header>
          
          <div className="features-grid">
            <div className="feat-card reveal">
              <div className="feat-icon feat-icon-amber">📚</div>
              <h3>Smart Tracking</h3>
              <p>Log your reading sessions, track pages read, and build streaks to keep your momentum going.</p>
            </div>
            <div className="feat-card reveal">
              <div className="feat-icon feat-icon-green">👥</div>
              <h3>Book Clubs</h3>
              <p>Create private clubs, invite friends via code, vote on the next read, and discuss chapters in real-time.</p>
            </div>
            <div className="feat-card reveal">
              <div className="feat-icon feat-icon-amber">📊</div>
              <h3>Reading Insights</h3>
              <p>Visualize your habits with beautiful charts. See when you read best and how quickly you finish books.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
