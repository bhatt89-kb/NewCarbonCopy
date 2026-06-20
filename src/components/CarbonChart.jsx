import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { memo } from 'react';
import { CATEGORY_LABELS, CATEGORY_COLORS, SUSTAINABLE_TARGET, GLOBAL_AVG } from '../engine';
import './CarbonChart.css';

// Trend Chart - Shows history over time
export const CarbonTrendChart = memo(function CarbonTrendChart({ entries }) {
  if (!entries || entries.length === 0) {
    return (
      <div className="chart-empty">
        <p>📊 No history data yet. Save your first calculation to see trends!</p>
      </div>
    );
  }

  // Prepare data - reverse to show oldest first
  const data = [...entries]
    .reverse()
    .slice(-12) // Last 12 entries
    .map((entry, index) => ({
      name: `Entry ${index + 1}`,
      date: new Date(entry.created_at).toLocaleDateString(),
      total: entry.result.total_annual_tonnes,
      target: SUSTAINABLE_TARGET / 1000,
      global: GLOBAL_AVG / 1000,
    }));

  return (
    <div className="chart-container">
      <h3 className="chart-title">📈 Carbon Footprint Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2e3348" />
          <XAxis dataKey="date" stroke="#8b8fa3" style={{ fontSize: '0.75rem' }} />
          <YAxis stroke="#8b8fa3" style={{ fontSize: '0.75rem' }} label={{ value: 'Tonnes CO₂e', angle: -90, position: 'insideLeft', style: { fill: '#8b8fa3' } }} />
          <Tooltip
            contentStyle={{ background: '#1a1d27', border: '1px solid #2e3348', borderRadius: '8px', color: '#e8eaf0' }}
            labelStyle={{ color: '#8b8fa3' }}
          />
          <Legend wrapperStyle={{ fontSize: '0.85rem' }} />
          <Line type="monotone" dataKey="total" stroke="#818cf8" strokeWidth={3} name="Your Footprint" dot={{ r: 4 }} />
          <Line type="monotone" dataKey="target" stroke="#34d399" strokeWidth={2} strokeDasharray="5 5" name="Sustainable Target (2t)" />
          <Line type="monotone" dataKey="global" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" name="Global Average (4.8t)" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

// Category Breakdown Chart
export const CategoryBreakdownChart = memo(function CategoryBreakdownChart({ result }) {
  if (!result) return null;

  const data = Object.entries(result.breakdown_kg).map(([category, value]) => ({
    name: CATEGORY_LABELS[category],
    value: Math.round(value),
    percentage: ((value / result.total_annual_kg) * 100).toFixed(1),
  }));

  const colors = Object.keys(result.breakdown_kg).map(cat => CATEGORY_COLORS[cat]);

  return (
    <div className="chart-container">
      <h3 className="chart-title">🥧 Emission Breakdown</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percentage }) => `${name}: ${percentage}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: '#1a1d27', border: '1px solid #2e3348', borderRadius: '8px', color: '#e8eaf0' }}
            formatter={(value) => `${value} kg CO₂e`}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
});

// Comparison Bar Chart
export const ComparisonChart = memo(function ComparisonChart({ result }) {
  if (!result) return null;

  const data = [
    {
      name: 'You',
      value: result.total_annual_tonnes,
      fill: result.total_annual_kg <= SUSTAINABLE_TARGET ? '#34d399' : '#f43f5e',
    },
    {
      name: 'Sustainable Target',
      value: SUSTAINABLE_TARGET / 1000,
      fill: '#34d399',
    },
    {
      name: 'Global Average',
      value: GLOBAL_AVG / 1000,
      fill: '#f59e0b',
    },
  ];

  return (
    <div className="chart-container">
      <h3 className="chart-title">📊 How You Compare</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2e3348" />
          <XAxis dataKey="name" stroke="#8b8fa3" style={{ fontSize: '0.85rem' }} />
          <YAxis stroke="#8b8fa3" style={{ fontSize: '0.75rem' }} label={{ value: 'Tonnes CO₂e/year', angle: -90, position: 'insideLeft', style: { fill: '#8b8fa3' } }} />
          <Tooltip
            contentStyle={{ background: '#1a1d27', border: '1px solid #2e3348', borderRadius: '8px', color: '#e8eaf0' }}
            formatter={(value) => `${value.toFixed(2)} tonnes`}
          />
          <Bar dataKey="value" fill="#818cf8" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});

// Progress Chart - Shows reduction progress
export const ProgressChart = memo(function ProgressChart({ entries }) {
  if (!entries || entries.length < 2) {
    return (
      <div className="chart-empty">
        <p>📉 Save at least 2 calculations to track your reduction progress!</p>
      </div>
    );
  }

  const sorted = [...entries].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  const baseline = sorted[0].result.total_annual_tonnes;
  
  const data = sorted.map((entry) => {
    const current = entry.result.total_annual_tonnes;
    const reduction = ((baseline - current) / baseline) * 100;
    
    return {
      name: `${new Date(entry.created_at).toLocaleDateString()}`,
      emissions: current,
      reduction: reduction.toFixed(1),
      baseline: baseline,
    };
  });

  return (
    <div className="chart-container">
      <h3 className="chart-title">📉 Reduction Progress</h3>
      <div className="progress-stats">
        <div className="progress-stat">
          <span className="stat-label">Baseline</span>
          <span className="stat-value">{baseline.toFixed(2)}t</span>
        </div>
        <div className="progress-stat">
          <span className="stat-label">Current</span>
          <span className="stat-value">{data[data.length - 1].emissions.toFixed(2)}t</span>
        </div>
        <div className="progress-stat">
          <span className="stat-label">Reduction</span>
          <span className="stat-value" style={{ color: parseFloat(data[data.length - 1].reduction) > 0 ? '#34d399' : '#f43f5e' }}>
            {data[data.length - 1].reduction}%
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2e3348" />
          <XAxis dataKey="name" stroke="#8b8fa3" style={{ fontSize: '0.7rem' }} />
          <YAxis stroke="#8b8fa3" style={{ fontSize: '0.75rem' }} label={{ value: 'Tonnes CO₂e', angle: -90, position: 'insideLeft', style: { fill: '#8b8fa3' } }} />
          <Tooltip
            contentStyle={{ background: '#1a1d27', border: '1px solid #2e3348', borderRadius: '8px', color: '#e8eaf0' }}
            formatter={(value, name) => {
              if (name === 'reduction') return [`${value}%`, 'Reduction'];
              return [`${value.toFixed(2)}t`, name === 'emissions' ? 'Current' : 'Baseline'];
            }}
          />
          <Legend wrapperStyle={{ fontSize: '0.85rem' }} />
          <Line type="monotone" dataKey="emissions" stroke="#818cf8" strokeWidth={3} name="Current Emissions" dot={{ r: 5 }} />
          <Line type="monotone" dataKey="baseline" stroke="#8b8fa3" strokeWidth={2} strokeDasharray="5 5" name="Baseline" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});
