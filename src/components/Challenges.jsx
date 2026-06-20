/**
 * EcoLens — Challenges Component
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import './Community.css';

export default function Challenges() {
  const { isAuthenticated } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(null);

  useEffect(() => { loadChallenges(); }, []);

  const loadChallenges = async () => {
    setLoading(true);
    try {
      const res = await api.getChallenges();
      setChallenges(res.challenges);
    } catch { setChallenges([]); }
    setLoading(false);
  };

  const handleJoin = async (id) => {
    if (!isAuthenticated) return;
    setJoining(id);
    try {
      await api.joinChallenge(id);
      await loadChallenges();
    } catch (err) { console.error(err); }
    setJoining(null);
  };

  const getDaysLeft = (endDate) => {
    const diff = new Date(endDate).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const getCategoryColor = (cat) => {
    const colors = { transport: '#6366f1', diet: '#10b981', home: '#f59e0b', consumption: '#f43f5e', all: '#818cf8' };
    return colors[cat] || '#818cf8';
  };

  return (
    <section className="community-section">
      <div className="section-header">
        <h2>🎯 Challenges</h2>
        <p className="section-desc">Join community challenges and earn achievements</p>
      </div>

      {loading ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="loading-spinner" />
        </div>
      ) : (
        <div className="challenges-grid">
          {challenges.map((ch) => (
            <div key={ch.id} className={`challenge-card ${ch.joined ? 'joined' : ''}`}>
              <div className="challenge-header" style={{ borderColor: getCategoryColor(ch.category) }}>
                <span className="challenge-icon">{ch.icon}</span>
                <div className="challenge-meta">
                  <span className="challenge-duration">{ch.duration_days} days</span>
                  <span className="challenge-days-left">{getDaysLeft(ch.end_date)}d left</span>
                </div>
              </div>
              <h3 className="challenge-title">{ch.title}</h3>
              <p className="challenge-desc">{ch.description}</p>
              <div className="challenge-stats">
                <span className="challenge-target">🎯 Save {ch.target_reduction_kg}kg CO₂e</span>
                <span className="challenge-participants">👥 {ch.participants} joined</span>
              </div>
              {ch.joined ? (
                <div className="challenge-joined-badge">
                  <span>✓ Joined</span>
                  <div className="challenge-progress-bar">
                    <div className="challenge-progress-fill" style={{ width: `${ch.progress}%` }} />
                  </div>
                </div>
              ) : (
                <button className="btn btn-accent btn-sm challenge-join-btn" onClick={() => handleJoin(ch.id)} disabled={!isAuthenticated || joining === ch.id}>
                  {!isAuthenticated ? '🔐 Sign in to join' : joining === ch.id ? '...' : '🚀 Join Challenge'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
