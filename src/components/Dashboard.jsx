import { CarbonTrendChart, CategoryBreakdownChart, ComparisonChart, ProgressChart } from './CarbonChart';
import GoalTracker from './GoalTracker';
import Achievements from './Achievements';
import './Dashboard.css';

export default function Dashboard({ result, entries }) {
  return (
    <section className="dashboard-section">
      <div className="dashboard-header">
        <h2>📊 Carbon Dashboard</h2>
        <p className="dashboard-desc">Track your progress, visualize trends, and unlock achievements</p>
      </div>

      {/* Goal Tracker */}
      <GoalTracker currentFootprint={result} entries={entries} />

      {/* Current Breakdown and Comparison */}
      {result && (
        <div className="chart-row">
          <CategoryBreakdownChart result={result} />
          <ComparisonChart result={result} />
        </div>
      )}

      {/* Progress and Trend Charts */}
      <div className="chart-row">
        <ProgressChart entries={entries} />
        <CarbonTrendChart entries={entries} />
      </div>

      {/* Achievements */}
      <Achievements entries={entries} currentFootprint={result} />

      {/* Quick Stats */}
      {entries && entries.length > 0 && (
        <div className="quick-stats">
          <div className="stat-card">
            <span className="stat-icon">📈</span>
            <div>
              <div className="stat-value">{entries.length}</div>
              <div className="stat-label">Calculations</div>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🗓️</span>
            <div>
              <div className="stat-value">
                {Math.ceil((new Date() - new Date(entries[entries.length - 1].created_at)) / (1000 * 60 * 60 * 24))}
              </div>
              <div className="stat-label">Days Tracking</div>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">⭐</span>
            <div>
              <div className="stat-value">
                {entries.length >= 10 ? '🌟' : entries.length >= 5 ? '📊' : '🌱'}
              </div>
              <div className="stat-label">Status</div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
