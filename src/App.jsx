import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { useFootprint } from './hooks/useFootprint';
import AuthPage from './components/AuthPage';
import Calculator from './components/Calculator';
import Results from './components/Results';
import Dashboard from './components/Dashboard';
import AdvancedInsights from './components/AdvancedInsights';
import Hero from './components/Hero';
import Leaderboard from './components/Leaderboard';
import Challenges from './components/Challenges';
import OffsetMarketplace from './components/OffsetMarketplace';
import ReportGenerator from './components/ReportGenerator';
import { exportData, exportCSV, generateShareText, copyToClipboard } from './utils/export';
import api from './api/client';
import './App.css';

export default function App() {
  const { user, isAuthenticated, logout, loading: authLoading } = useAuth();
  const { result, insights, entries, loading, calculate, save, reset } = useFootprint();
  const [activeView, setActiveView] = useState('calculator');
  const [lastInput, setLastInput] = useState(null);
  const [showAuth, setShowAuth] = useState(false);

  const handleCalculate = (input) => {
    setLastInput(input);
    calculate(input);
  };

  const handleSave = async () => {
    const localSaved = save();
    if (isAuthenticated && result && lastInput) {
      try { await api.saveEntry(lastInput, result); } catch (e) { console.error(e); }
    }
    return localSaved;
  };

  const handleExport = () => {
    const goal = localStorage.getItem('carbon_goal');
    exportData(entries, goal ? JSON.parse(goal) : null);
  };

  const handleShare = async () => {
    if (!result) return;
    const text = generateShareText(result);
    const success = await copyToClipboard(text);
    alert(success ? '✅ Results copied to clipboard!' : '❌ Failed to copy.');
  };

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loading-spinner" style={{ width: 48, height: 48, border: '4px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  if (showAuth && !isAuthenticated) {
    return (
      <>
        <div className="ambient-bg"><div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" /></div>
        <AuthPage />
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1, paddingBottom: '2rem' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowAuth(false)}>← Continue as Guest</button>
        </div>
      </>
    );
  }

  return (
    <>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <div className="ambient-bg"><div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" /></div>

      {/* Navbar */}
      <nav className="navbar" role="navigation" aria-label="Main navigation">
        <div className="nav-inner">
          <div className="nav-brand">
            <span className="brand-icon">🌱</span>
            <span>EcoLens</span>
          </div>
          <div className="nav-links">
            <button className={`nav-link ${activeView === 'calculator' ? 'active' : ''}`} onClick={() => setActiveView('calculator')}>Calculator</button>
            <button className={`nav-link ${activeView === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveView('dashboard')}>Dashboard</button>
            <button className={`nav-link ${activeView === 'insights' ? 'active' : ''}`} onClick={() => setActiveView('insights')}>AI Insights</button>
            <button className={`nav-link ${activeView === 'community' ? 'active' : ''}`} onClick={() => setActiveView('community')}>Community</button>
            <button className={`nav-link ${activeView === 'marketplace' ? 'active' : ''}`} onClick={() => setActiveView('marketplace')}>Offsets</button>
            <button className={`nav-link ${activeView === 'history' ? 'active' : ''}`} onClick={() => setActiveView('history')}>History</button>
          </div>
          <div className="nav-auth">
            {isAuthenticated ? (
              <div className="user-menu">
                <span className="user-avatar">👤</span>
                <span className="user-name">{user?.username}</span>
                <button className="btn btn-ghost btn-sm" onClick={logout}>Logout</button>
              </div>
            ) : (
              <button className="btn btn-primary btn-sm" onClick={() => setShowAuth(true)}>🔐 Sign In</button>
            )}
          </div>
        </div>
      </nav>

      <main id="main-content">
        {activeView === 'calculator' && (
          <>
            <Hero />
            <section className="section">
              <Calculator onCalculate={handleCalculate} loading={loading} />
            </section>
            {result && (
              <Results result={result} insights={insights} onSave={handleSave} onRecalculate={reset} saved={false} />
            )}
            {result && (
              <div style={{ textAlign: 'center', marginTop: '1rem', marginBottom: '2rem' }}>
                <button className="btn btn-ghost btn-sm" onClick={handleShare}>📤 Share Results</button>
              </div>
            )}
          </>
        )}

        {activeView === 'insights' && (
          <>
            <AdvancedInsights result={result} input={lastInput} entries={entries} />
            {!result && (
              <section className="section">
                <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Complete a calculation first to see personalized AI insights!</p>
                  <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => setActiveView('calculator')}>Go to Calculator</button>
                </div>
              </section>
            )}
          </>
        )}

        {activeView === 'dashboard' && (
          <>
            <Dashboard result={result} entries={entries} />
            <section className="section">
              <ReportGenerator result={result} entries={entries} insights={insights} />
            </section>
          </>
        )}

        {activeView === 'community' && (
          <>
            <Leaderboard />
            <Challenges />
          </>
        )}

        {activeView === 'marketplace' && (
          <OffsetMarketplace />
        )}

        {activeView === 'history' && (
          <section className="section">
            <div className="section-header">
              <h2>📜 Calculation History</h2>
              <p className="section-desc">Review your past carbon footprint calculations</p>
            </div>
            {entries && entries.length > 0 ? (
              <>
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => exportCSV(entries)}>📊 Export CSV</button>
                  <button className="btn btn-ghost btn-sm" onClick={handleExport}>📥 Export JSON</button>
                </div>
                <div className="glass-card">
                  <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Total Entries: {entries.length}</p>
                  {entries.slice(0, 10).map((entry) => (
                    <div key={entry.id} style={{ padding: '1rem', background: 'var(--bg-el)', borderRadius: 'var(--radius)', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <strong>{new Date(entry.created_at).toLocaleString()}</strong>
                        <span style={{ fontFamily: 'var(--mono)', color: 'var(--primary)', fontSize: '1.1rem', fontWeight: '700' }}>
                          {entry.result.total_annual_tonnes.toFixed(2)}t CO₂e
                        </span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                        Transport: {entry.result.breakdown_kg.transport.toFixed(0)} kg •
                        Home: {entry.result.breakdown_kg.home.toFixed(0)} kg •
                        Diet: {entry.result.breakdown_kg.diet.toFixed(0)} kg •
                        Consumption: {entry.result.breakdown_kg.consumption.toFixed(0)} kg
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
                <p style={{ color: 'var(--text-muted)' }}>No history yet. Complete a calculation to start tracking!</p>
              </div>
            )}
          </section>
        )}
      </main>

      <footer className="footer" role="contentinfo">
        <p>EcoLens Carbon Calculator • Data-driven insights for climate action • Emission factors from DEFRA 2023, EPA, IPCC</p>
        <p style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>This tool provides estimates. Actual emissions may vary. Always consult professional assessments for precise measurements.</p>
      </footer>
    </>
  );
}
