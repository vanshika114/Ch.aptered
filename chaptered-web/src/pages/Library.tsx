
import { Link } from 'react-router-dom';
import '../library.css';

export const Library = () => {
  return (
    <>
      <nav className="nav" style={{position:'fixed',top:0,left:0,right:0,zIndex:100,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'1rem 5%',background:'rgba(250,246,239,.93)',backdropFilter:'blur(14px)',borderBottom:'1px solid var(--border)'}}>
        <Link to="/" className="logo" style={{fontFamily:"'Playfair Display',serif",fontSize:'1.55rem',fontWeight:900,color:'var(--ink)',textDecoration:'none',letterSpacing:'-.02em'}}>Ch<span style={{color:'var(--amber)'}}>.</span>aptered</Link>
        <Link to="/" className="nav-back" style={{display:'inline-flex',alignItems:'center',gap:'.4rem',background:'var(--warm)',border:'1px solid var(--border)',borderRadius:'50px',padding:'.35rem .9rem',fontSize:'.82rem',fontWeight:600,color:'var(--muted)',textDecoration:'none',transition:'all .2s'}}>← Home</Link>
      </nav>

      <div className="ph" style={{padding:'7rem 5% 2.5rem',background:'var(--ink)',position:'relative',overflow:'hidden'}}>
        <div className="ph-bg" style={{position:'absolute',inset:0,background:'radial-gradient(ellipse 50% 80% at 90% 50%,rgba(212,134,58,.14),transparent 70%),radial-gradient(ellipse 40% 50% at 5% 30%,rgba(45,90,61,.1),transparent 70%)'}}></div>
        <div className="ph-c" style={{position:'relative',zIndex:1,maxWidth:'1200px',margin:'0 auto'}}>
          <div className="crumb" style={{fontSize:'.75rem',fontWeight:600,color:'rgba(250,246,239,.4)',marginBottom:'1rem',letterSpacing:'.04em',textTransform:'uppercase'}}>Chaptered <span style={{color:'var(--al)'}}>›</span> Your Library</div>
          <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:'clamp(2rem,4vw,3.2rem)',fontWeight:900,color:'var(--cream)',lineHeight:1.1,letterSpacing:'-.03em'}}>Your <em style={{fontStyle:'italic',color:'var(--amber)'}}>Library</em></h1>
          <p style={{marginTop:'.8rem',fontSize:'.97rem',color:'rgba(250,246,239,.55)',maxWidth:'520px',lineHeight:1.7}}>Add, track, update, and read your books — all in one place. Upload PDFs to read them directly in your browser.</p>
          <div className="ph-stats" style={{display:'flex',gap:'2rem',marginTop:'2rem',paddingTop:'1.5rem',borderTop:'1px solid rgba(255,255,255,.08)',flexWrap:'wrap'}}>
            <div className="phs" style={{display:'flex',flexDirection:'column'}}><div className="psn" style={{fontFamily:"'Playfair Display',serif",fontSize:'1.6rem',fontWeight:900,color:'var(--cream)'}}>0</div><div className="psl" style={{fontSize:'.72rem',color:'rgba(250,246,239,.4)',marginTop:'.1rem',textTransform:'uppercase',letterSpacing:'.06em'}}>Books</div></div>
            <div className="phs" style={{display:'flex',flexDirection:'column'}}><div className="psn" style={{fontFamily:"'Playfair Display',serif",fontSize:'1.6rem',fontWeight:900,color:'var(--al)'}}>0</div><div className="psl" style={{fontSize:'.72rem',color:'rgba(250,246,239,.4)',marginTop:'.1rem',textTransform:'uppercase',letterSpacing:'.06em'}}>Pages Read</div></div>
          </div>
        </div>
      </div>

      <div className="layout" style={{maxWidth:'1200px',margin:'0 auto',padding:'2.5rem 5% 4rem',display:'grid',gridTemplateColumns:'250px 1fr',gap:'2rem',alignItems:'start'}}>
        <aside className="sb" style={{position:'sticky',top:'88px',display:'flex',flexDirection:'column',gap:'1rem'}}>
          <button className="sb-add" style={{background:'var(--amber)',color:'#fff',border:'none',borderRadius:'var(--r)',padding:'1rem',width:'100%',fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:'.95rem',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'.5rem',boxShadow:'0 4px 18px rgba(212,134,58,.35)',transition:'all .2s'}}>＋ Add New Book</button>
          <div className="sb-nav" style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:'var(--rl)',padding:'1.2rem',boxShadow:'var(--sh)'}}>
            <div className="sb-nav-t" style={{fontSize:'.67rem',fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:'var(--muted)',padding:'.2rem .5rem',marginBottom:'.6rem'}}>Navigation</div>
            <button className="sb-btn active" style={{width:'100%',display:'flex',alignItems:'center',gap:'.75rem',background:'var(--ink)',border:'none',borderRadius:'10px',padding:'.65rem .8rem',cursor:'pointer',fontFamily:"'DM Sans',sans-serif",fontSize:'.92rem',fontWeight:600,color:'var(--cream)',textAlign:'left',transition:'all .2s'}}><span>📚</span> My Shelf</button>
          </div>
        </aside>

        <main>
          <div className="panel active" style={{display:'block'}}>
            <div className="sh" style={{fontFamily:"'Playfair Display',serif",fontSize:'1.3rem',fontWeight:700,color:'var(--ink)',marginBottom:'1.2rem',display:'flex',alignItems:'center',gap:'.6rem'}}>My Books <span className="cnt" style={{fontFamily:"'DM Sans',sans-serif",fontSize:'.78rem',fontWeight:600,background:'var(--warm)',border:'1px solid var(--border)',color:'var(--muted)',padding:'.15rem .55rem',borderRadius:'50px'}}>0</span></div>
            <div className="empty" style={{textAlign:'center',padding:'5rem 2rem',background:'var(--card)',border:'2px dashed var(--border)',borderRadius:'var(--rl)'}}>
              <span className="ei" style={{fontSize:'3.5rem',marginBottom:'1rem',display:'block'}}>📭</span>
              <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.3rem',fontWeight:700,marginBottom:'.5rem'}}>Your shelf is empty</h3>
              <p style={{color:'var(--muted)',fontSize:'.9rem',maxWidth:'300px',margin:'0 auto'}}>Start your library by adding your first book.</p>
              <button className="eb" style={{marginTop:'1.2rem',background:'var(--amber)',color:'#fff',border:'none',borderRadius:'50px',padding:'.75rem 1.8rem',fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:'.92rem',cursor:'pointer',transition:'all .2s'}}>Add Your First Book</button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};
