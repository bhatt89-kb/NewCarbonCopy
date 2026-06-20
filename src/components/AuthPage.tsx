/**
 * EcoLens — Auth Page (Login/Signup)
 */
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css';

export default function AuthPage() {
  const { login, signup, error, clearError } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (mode === 'login') {
      await login(email, password);
    } else {
      await signup(username, email, password);
    }
    setLoading(false);
  };

  const switchMode = () => {
    setMode(m => m === 'login' ? 'signup' : 'login');
    clearError();
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <span className="auth-logo">🌱</span>
          <h1>EcoLens</h1>
          <p className="auth-subtitle">Track and reduce your carbon footprint</p>
        </div>

        <div className="auth-tabs">
          <button className={`auth-tab ${mode === 'login' ? 'active' : ''}`} onClick={() => { setMode('login'); clearError(); }}>Login</button>
          <button className={`auth-tab ${mode === 'signup' ? 'active' : ''}`} onClick={() => { setMode('signup'); clearError(); }}>Sign Up</button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className="auth-field">
              <label htmlFor="auth-username">Username</label>
              <input id="auth-username" type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Choose a username" required minLength={3} maxLength={30} autoComplete="username" />
            </div>
          )}
          <div className="auth-field">
            <label htmlFor="auth-email">Email</label>
            <input id="auth-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required autoComplete="email" />
          </div>
          <div className="auth-field">
            <label htmlFor="auth-password">Password</label>
            <input id="auth-password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
          </div>
          {error && <div className="auth-error">{error}</div>}
          <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
            {loading ? '...' : mode === 'login' ? '🔐 Login' : '🌱 Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button type="button" className="auth-switch-btn" onClick={switchMode}>
            {mode === 'login' ? 'Sign up' : 'Login'}
          </button>
        </p>

        <div className="auth-features">
          <div className="auth-feature"><span>🔒</span><span>Secure JWT Auth</span></div>
          <div className="auth-feature"><span>📊</span><span>Track Progress</span></div>
          <div className="auth-feature"><span>🏆</span><span>Join Community</span></div>
        </div>
      </div>
    </div>
  );
}
