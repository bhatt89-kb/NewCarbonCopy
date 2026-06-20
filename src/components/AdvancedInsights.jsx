import { useMemo } from 'react';
import { generateAdvancedRecommendations, calculateStatistics, calculatePercentile } from '../utils/analytics';
import { GLOBAL_AVG, SUSTAINABLE_TARGET } from '../engine';
import './AdvancedInsights.css';

export default function AdvancedInsights({ result, input, entries }) {
  const recommendations = useMemo(() => {
    if (!result || !input) return [];
    return generateAdvancedRecommendations(input, result, entries);
  }, [result, input, entries]);

  const statistics = useMemo(() => {
    if (!entries || entries.length === 0) return null;
    return calculateStatistics(entries);
  }, [entries]);

  const percentile = useMemo(() => {
    if (!result) return null;
    return calculatePercentile(result.total_annual_kg, GLOBAL_AVG, SUSTAINABLE_TARGET);
  }, [result]);

  if (!result) return null;

  return (
    <section className="advanced-insights">
      {/* Percentile Ranking */}
      {percentile && (
        <div className="insight-card percentile-card">
          <div className="card-header">
            <h3>📊 Your Global Ranking</h3>
          </div>
          <div className="percentile-display">
            <div className="percentile-main">
              <span className="percentile-value">{percentile.category}</span>
              <span className="percentile-subtitle">
                Better than {percentile.betterThan}% of global citizens
              </span>
            </div>
            <div className="percentile-bar">
              <div
                className="percentile-fill"
                style={{ width: `${percentile.betterThan}%` }}
              />
              <div className="percentile-marker" style={{ left: `${percentile.percentile}%` }}>
                You
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Summary */}
      {statistics && (
        <div className="insight-card stats-card">
          <div className="card-header">
            <h3>📈 Your Progress Summary</h3>
          </div>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Tracking For</span>
              <span className="stat-value">{statistics.daysTracking} days</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Change</span>
              <span className={`stat-value ${statistics.totalChange < 0 ? 'negative' : 'positive'}`}>
                {statistics.totalChange > 0 ? '+' : ''}{statistics.totalChange}t
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Trend</span>
              <span className={`stat-value trend-${statistics.trend.direction}`}>
                {statistics.trend.direction === 'decreasing' ? '↓' :
                  statistics.trend.direction === 'increasing' ? '↑' : '→'}
                {' '}{statistics.trend.direction}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Best Result</span>
              <span className="stat-value">{statistics.min}t</span>
            </div>
          </div>
        </div>
      )}

      {/* AI-Style Recommendations */}
      <div className="insight-card recommendations-card">
        <div className="card-header">
          <h3>🤖 Personalized Action Plan</h3>
          <span className="ai-badge">AI-Enhanced</span>
        </div>
        <p className="recommendations-intro">
          Based on your footprint and patterns from thousands of users, here are your best opportunities:
        </p>
        <div className="recommendations-grid">
          {recommendations.map((rec, index) => (
            <div key={index} className={`recommendation-item impact-${rec.impact}`}>
              <div className="rec-header">
                <span className="rec-title">{rec.title}</span>
                <span className={`impact-badge impact-${rec.impact}`}>
                  {rec.impact} impact
                </span>
              </div>
              <p className="rec-description">{rec.description}</p>
              <ul className="rec-actions">
                {rec.actions.map((action, i) => (
                  <li key={i}>{action}</li>
                ))}
              </ul>
              <div className="rec-footer">
                <span className="rec-savings">
                  💚 Potential savings: {rec.savings} kg CO₂e/year
                </span>
                <span className="rec-difficulty">
                  Difficulty: {rec.difficulty}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Tips */}
      <div className="insight-card tips-card">
        <div className="card-header">
          <h3>💡 Quick Wins This Month</h3>
        </div>
        <div className="tips-list">
          <div className="tip-item">
            <span className="tip-icon">🚴</span>
            <div className="tip-content">
              <strong>This Week:</strong> Replace 2 car trips with walking or cycling
            </div>
          </div>
          <div className="tip-item">
            <span className="tip-icon">🌱</span>
            <div className="tip-content">
              <strong>This Month:</strong> Try 8 plant-based meals
            </div>
          </div>
          <div className="tip-item">
            <span className="tip-icon">💡</span>
            <div className="tip-content">
              <strong>Long Term:</strong> Switch to renewable energy provider
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
