import './Hero.css';

export default function Hero({ onStart }) {
  return (
    <section className="hero" id="hero-section">
      <div className="hero-content">
        <div className="hero-badge">
          <span className="badge-pulse" aria-hidden="true" />
          <span>Free &amp; Anonymous</span>
        </div>
        <h1>Know Your <span className="gradient-text">Carbon Impact</span></h1>
        <p className="hero-subtitle">
          Answer a few lifestyle questions and get a personalized breakdown of your annual carbon footprint — plus actionable steps to reduce it.
        </p>
        <button className="btn btn-primary btn-lg" onClick={onStart} type="button" id="start-btn">
          <span>Start Your Assessment</span>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 10h12m-4-4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>
      <div className="hero-stats" aria-label="Key facts">
        <div className="stat-card"><span className="stat-value">4.8t</span><span className="stat-label">Global Average</span></div>
        <div className="stat-card"><span className="stat-value">2.0t</span><span className="stat-label">2030 Target</span></div>
        <div className="stat-card"><span className="stat-value">4</span><span className="stat-label">Categories Tracked</span></div>
      </div>
    </section>
  );
}
