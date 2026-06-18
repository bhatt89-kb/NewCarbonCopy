import { useState } from 'react';
import { useFootprint } from './hooks/useFootprint';
import Calculator from './components/Calculator';
import Results from './components/Results';
import Dashboard from './components/Dashboard';
import Hero from './components/Hero';
import './App.css';

export default function App() {
  const { result, insights, entries, loading, calculate, save, reset } = useFootprint();
  const [activeView, setActiveView] = useState('calculator');

  return (
    <>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      
      <div className="ambient-bg">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      {/* Navbar */}
      <nav className="navbar" role="navigation" aria-label="Main navigation">
        <div className="nav-inner">
          <div className="nav-brand">
            <span className="brand-icon">🌱</span>
            <span>EcoLens</span>
          </div>
          <div className="nav-links">
            <button 
              className={`nav-link ${activeView === 'calculator' ? 'active' : ''}`}
              onClick={() => setActiveView('calculator')}
            >
              Calculator
            </button>
            <button 
              className={`nav-link ${activeView === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveView('dashboard')}
            >
              Dashboard
            </button>
            <button 
              className={`nav-link ${activeView === 'history' ? 'active' : ''}`}
              onClick={() => setActiveView('history')}
            >
              History
            </button>
          </div>
        </div>
      </nav>

      <main id="main-content">
        {activeView === 'calculator' && (
          <>
            <Hero />
            <section className="section">
              <Calculator onCalculate={calculate} loading={loading} />
            </section>
            {result && (
              <Results
                result={result}
                insights={insights}
                onSave={save}
                onRecalculate={reset}
                saved={false}
              />
            )}
          </>
        )}

        {activeView === 'dashboard' && (
          <Dashboard result={result} entries={entries} />
        )}

        {activeView === 'history' && (
          <section className="section">
            <div className="section-header">
              <h2>📜 Calculation History</h2>
              <p className="section-desc">Review your past carbon footprint calculations</p>
            </div>
            {entries && entries.length > 0 ? (
              <div className="glass-card">
                <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Total Entries: {entries.length}
                </p>
                {entries.slice(0, 10).map((entry) => (
                  <div 
                    key={entry.id}
                    style={{
                      padding: '1rem',
                      background: 'var(--bg-el)',
                      borderRadius: 'var(--radius)',
                      marginBottom: '0.75rem',
                    }}
                  >
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
            ) : (
              <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
                <p style={{ color: 'var(--text-muted)' }}>
                  No history yet. Complete a calculation to start tracking!
                </p>
              </div>
            )}
          </section>
        )}
      </main>

      <footer className="footer" role="contentinfo">
        <p>
          EcoLens Carbon Calculator • Data-driven insights for climate action • 
          Emission factors from DEFRA 2023, EPA, IPCC
        </p>
        <p style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
          This tool provides estimates. Actual emissions may vary. Always consult professional assessments for precise measurements.
        </p>
      </footer>
    </>
  );
}
