import { useMemo } from 'react';
import { SUSTAINABLE_TARGET, GLOBAL_AVG } from '../engine';
import './Achievements.css';

const ACHIEVEMENT_DEFINITIONS = [
  {
    id: 'first_calculation',
    icon: '🌱',
    title: 'Getting Started',
    description: 'Complete your first carbon footprint calculation',
    check: (entries) => entries.length >= 1,
  },
  {
    id: 'five_calculations',
    icon: '📊',
    title: 'Data Collector',
    description: 'Track your footprint 5 times',
    check: (entries) => entries.length >= 5,
  },
  {
    id: 'below_global',
    icon: '🌍',
    title: 'Global Citizen',
    description: 'Achieve footprint below global average (4.8t)',
    check: (entries, current) => current && current.total_annual_kg < GLOBAL_AVG,
  },
  {
    id: 'sustainable',
    icon: '🌳',
    title: 'Sustainable Warrior',
    description: 'Reach the sustainable target of 2.0t CO₂e/year',
    check: (entries, current) => current && current.total_annual_kg <= SUSTAINABLE_TARGET,
  },
  {
    id: 'reduction_10',
    icon: '📉',
    title: 'Reducer',
    description: 'Reduce emissions by 10% from baseline',
    check: (entries) => {
      if (entries.length < 2) return false;
      const sorted = [...entries].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      const baseline = sorted[0].result.total_annual_kg;
      const latest = sorted[sorted.length - 1].result.total_annual_kg;
      return ((baseline - latest) / baseline) * 100 >= 10;
    },
  },
  {
    id: 'reduction_25',
    icon: '💚',
    title: 'Climate Champion',
    description: 'Reduce emissions by 25% from baseline',
    check: (entries) => {
      if (entries.length < 2) return false;
      const sorted = [...entries].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      const baseline = sorted[0].result.total_annual_kg;
      const latest = sorted[sorted.length - 1].result.total_annual_kg;
      return ((baseline - latest) / baseline) * 100 >= 25;
    },
  },
  {
    id: 'consistent_tracker',
    icon: '📅',
    title: 'Consistent Tracker',
    description: 'Calculate footprint 10 times',
    check: (entries) => entries.length >= 10,
  },
  {
    id: 'super_green',
    icon: '🌟',
    title: 'Super Green',
    description: 'Achieve footprint below 1.5t CO₂e/year',
    check: (entries, current) => current && current.total_annual_kg < 1500,
  },
];

export default function Achievements({ entries, currentFootprint }) {
  const achievements = useMemo(() => {
    return ACHIEVEMENT_DEFINITIONS.map(def => ({
      ...def,
      earned: def.check(entries || [], currentFootprint),
    }));
  }, [entries, currentFootprint]);

  const earnedCount = achievements.filter(a => a.earned).length;
  const totalCount = achievements.length;
  const progress = (earnedCount / totalCount) * 100;

  return (
    <div className="achievements-container">
      <div className="achievements-header">
        <h3 className="achievements-title">🏆 Achievements</h3>
        <div className="achievements-progress">
          <span className="achievements-count">{earnedCount} / {totalCount}</span>
          <div className="achievements-progress-bar">
            <div 
              className="achievements-progress-fill" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="achievements-grid">
        {achievements.map((achievement) => (
          <div 
            key={achievement.id} 
            className={`achievement-card ${achievement.earned ? 'earned' : 'locked'}`}
          >
            <div className="achievement-icon">{achievement.icon}</div>
            <div className="achievement-content">
              <div className="achievement-title">{achievement.title}</div>
              <div className="achievement-description">{achievement.description}</div>
            </div>
            {achievement.earned && (
              <div className="achievement-badge">✓</div>
            )}
          </div>
        ))}
      </div>

      {earnedCount === 0 && (
        <div className="achievements-empty">
          <p>🎯 Start calculating your carbon footprint to unlock achievements!</p>
        </div>
      )}
    </div>
  );
}
