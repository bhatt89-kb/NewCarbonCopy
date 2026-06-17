import { CATEGORY_LABELS, CATEGORY_ICONS, CATEGORY_COLORS, SUSTAINABLE_TARGET, formatKg } from '../engine';
import './Results.css';

export default function Results({ result, insights, onSave, onRecalculate, saved }) {
  if (!result) return null;

  const isOver = result.total_annual_kg > SUSTAINABLE_TARGET;
  const maxBar = Math.max(...Object.values(result.breakdown_kg), 1);

  return (
    <section className="section" id="results">
      <div className="section-header">
        <h2>Your Carbon Footprint</h2>
        <p className="section-desc">Estimated annual breakdown with personalized reduction tips.</p>
      </div>

      {/* Total card */}
      <div className="result-total-card">
        <div className="result-total-top">
          <span className="result-label">Your Annual Footprint</span>
          <div className={`result-value ${isOver ? 'over' : 'under'}`}>
            {result.total_annual_tonnes.toFixed(2)}
          </div>
          <span className="result-unit">tonnes CO₂e per year</span>
        </div>
        <div className="result-comparison">
          <div className="comparison-item">
            <span className="comp-dot comp-dot-target" aria-hidden="true" />
            <span className="comp-text">vs Sustainable Target (2.0t)</span>
            <span className="comp-ratio">{result.comparison.ratio_to_sustainable_target.toFixed(1)}×</span>
          </div>
          <div className="comparison-item">
            <span className="comp-dot comp-dot-global" aria-hidden="true" />
            <span className="comp-text">vs Global Average (4.8t)</span>
            <span className="comp-ratio">{result.comparison.ratio_to_global_average.toFixed(1)}×</span>
          </div>
        </div>
        <div className="result-actions">
          <button type="button" className="btn btn-primary" onClick={onSave} disabled={saved}>
            {saved ? '✓ Saved' : '💾 Save to History'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={onRecalculate}>Recalculate</button>
        </div>
      </div>

      {/* Breakdown */}
      <div className="glass-card">
        <h3 className="card-title">Breakdown by Category</h3>
        {Object.entries(result.breakdown_kg).map(([cat, kg]) => (
          <div className="bar-row" key={cat} role="img" aria-label={`${CATEGORY_LABELS[cat]}: ${formatKg(kg)} CO₂e per year`}>
            <div className="bar-label">
              <span className="bar-label-icon">{CATEGORY_ICONS[cat]}</span>
              {CATEGORY_LABELS[cat]}
            </div>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: `${(kg / maxBar) * 100}%`, background: CATEGORY_COLORS[cat] }} />
            </div>
            <div className="bar-value">{formatKg(kg)}</div>
          </div>
        ))}
        {/* Accessible data table */}
        <table className="visually-hidden" aria-label="Breakdown data">
          <thead><tr><th>Category</th><th>Annual kg CO₂e</th></tr></thead>
          <tbody>{Object.entries(result.breakdown_kg).map(([c, k]) => (
            <tr key={c}><td>{CATEGORY_LABELS[c]}</td><td>{k.toFixed(0)}</td></tr>
          ))}</tbody>
        </table>
      </div>

      {/* Insights */}
      {insights && (
        <div className="glass-card">
          <div className="insights-header">
            <h3 className="card-title">Personalized Insights</h3>
            <span className="source-badge">{insights.source === 'gemini' ? 'AI Powered' : 'Rule Engine'}</span>
          </div>
          <p className="insights-summary">{insights.summary}</p>
          <div className="recommendations-list" role="list" aria-label="Recommended actions">
            {insights.recommendations.map((rec, i) => (
              <div className="rec-item" role="listitem" key={i}>
                <div className="rec-icon" style={{ background: `${CATEGORY_COLORS[rec.category]}20`, color: CATEGORY_COLORS[rec.category] }}>
                  {CATEGORY_ICONS[rec.category] || '💡'}
                </div>
                <div className="rec-body">
                  <div className="rec-category" style={{ color: CATEGORY_COLORS[rec.category] }}>{CATEGORY_LABELS[rec.category]}</div>
                  <div className="rec-action">{rec.action}</div>
                  <div className="rec-saving">↓ Save ~{formatKg(rec.estimated_annual_savings_kg)} CO₂e/year</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div role="status" aria-live="polite" className="visually-hidden">
        Your footprint results are ready.
      </div>
    </section>
  );
}
