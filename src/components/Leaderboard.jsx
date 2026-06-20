/**
 * EcoLens — Leaderboard Component
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import './Community.css';

export default function Leaderboard() {
  const { isAuthenticated } = useAuth();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [lb, st] = await Promise.all([api.getLeaderboard(), api.getCommunityStats()]);
      setLeaders(lb.leaderboard);
      setStats(st);
    } catch { setLeaders([]); }
    setLoading(false);
  };

  const getRankStyle = (rank) => {
    if (rank === 1) return { background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', color: '#000' };
    if (rank === 2) return { background: 'linear-gradient(135deg, #94a3b8, #64748b)', color: '#fff' };
    if (rank === 3) return { background: 'linear-gradient(135deg, #cd7f32, #b8860b)', color: '#fff' };
    return {};
  };

  const getRankEmoji = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <section className="community-section">
      <div className="section-header">
        <h2>🏆 Leaderboard</h2>
        <p className="section-desc">Top eco-contributors ranked by lowest carbon footprint</p>
      </div>

      {stats && (
        <div className="community-stats">
          <div className="cstat-card"><span className="cstat-value">{stats.total_users}</span><span className="cstat-label">Users</span></div>
          <div className="cstat-card"><span className="cstat-value">{stats.total_calculations}</span><span className="cstat-label">Calculations</span></div>
          <div className="cstat-card"><span className="cstat-value">{stats.average_footprint}t</span><span className="cstat-label">Avg Footprint</span></div>
        </div>
      )}

      {loading ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="loading-spinner" />
          <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Loading leaderboard...</p>
        </div>
      ) : leaders.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏆</p>
          <p style={{ color: 'var(--text-muted)' }}>
            {isAuthenticated ? 'No entries yet. Save a calculation to appear on the leaderboard!' : 'Sign in and save calculations to join the leaderboard!'}
          </p>
        </div>
      ) : (
        <div className="leaderboard-list">
          {leaders.map((entry) => (
            <div key={entry.rank} className={`leader-card ${entry.is_you ? 'is-you' : ''}`}>
              <div className="leader-rank" style={getRankStyle(entry.rank)}>
                {getRankEmoji(entry.rank)}
              </div>
              <div className="leader-info">
                <span className="leader-name">{entry.username} {entry.is_you && <span className="you-badge">YOU</span>}</span>
                <span className="leader-badges">{entry.badges.join(' ')}</span>
              </div>
              <div className="leader-stats">
                <span className="leader-footprint">{entry.footprint_tonnes}t</span>
                <span className={`leader-reduction ${entry.reduction_percent > 0 ? 'positive' : ''}`}>
                  {entry.reduction_percent > 0 ? '↓' : ''}{entry.reduction_percent}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
