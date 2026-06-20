import { useState, useEffect } from 'react';
import { SUSTAINABLE_TARGET } from '../engine';
import { sanitizeNumber, validateDate, safeJSONParse, safeLocalStorageSet } from '../utils/security';
import './GoalTracker.css';

const GOAL_TYPES = [
  { value: 'sustainable', label: 'Sustainable Target (2.0t)', target: SUSTAINABLE_TARGET / 1000 },
  { value: 'custom', label: 'Custom Target', target: null },
];

export default function GoalTracker({ currentFootprint }) {
  const [goal, setGoal] = useState(() => {
    const saved = localStorage.getItem('carbon_goal');
    return saved ? safeJSONParse(saved, null) : null;
  });
  
  const [customTarget, setCustomTarget] = useState(2.0);
  const [targetDate, setTargetDate] = useState('');
  const [goalType, setGoalType] = useState('sustainable');

  useEffect(() => {
    if (goal) {
      safeLocalStorageSet('carbon_goal', JSON.stringify(goal));
    }
  }, [goal]);

  const handleSetGoal = () => {
    if (!currentFootprint) return;

    const target = goalType === 'sustainable' 
      ? SUSTAINABLE_TARGET / 1000 
      : sanitizeNumber(customTarget, 0.5, 20);

    const validatedDate = targetDate ? validateDate(targetDate) : null;

    const newGoal = {
      baseline: currentFootprint.total_annual_tonnes,
      target: target,
      targetDate: validatedDate,
      createdAt: new Date().toISOString(),
      type: goalType,
    };

    setGoal(newGoal);
  };

  const handleResetGoal = () => {
    setGoal(null);
    try {
      localStorage.removeItem('carbon_goal');
    } catch {
      // Silently fail
    }
  };

  if (!goal) {
    return (
      <div className="goal-tracker">
        <div className="goal-header">
          <h3 className="goal-title">🎯 Set Your Reduction Goal</h3>
        </div>
        <div className="goal-setup">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
            Track your progress toward reducing your carbon footprint. Set a target and monitor your journey!
          </p>
          <div className="goal-input-group">
            <div className="goal-field">
              <label htmlFor="goal-type">Goal Type</label>
              <select 
                id="goal-type" 
                value={goalType} 
                onChange={(e) => setGoalType(e.target.value)}
              >
                {GOAL_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            {goalType === 'custom' && (
              <div className="goal-field">
                <label htmlFor="custom-target">Target (tonnes CO₂e/year)</label>
                <input 
                  id="custom-target"
                  type="number" 
                  min="0.5" 
                  max="20" 
                  step="0.1"
                  value={customTarget}
                  onChange={(e) => setCustomTarget(parseFloat(e.target.value) || 2.0)}
                />
              </div>
            )}
            <div className="goal-field">
              <label htmlFor="target-date">Target Date (optional)</label>
              <input 
                id="target-date"
                type="date" 
                value={targetDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setTargetDate(e.target.value)}
              />
            </div>
            <button 
              className="btn btn-accent" 
              onClick={handleSetGoal}
              disabled={!currentFootprint}
            >
              🎯 Set Goal
            </button>
          </div>
          {!currentFootprint && (
            <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
              Complete a calculation first to set your baseline.
            </p>
          )}
        </div>
      </div>
    );
  }

  // Calculate progress
  const current = currentFootprint?.total_annual_tonnes || goal.baseline;
  const progress = ((goal.baseline - current) / (goal.baseline - goal.target)) * 100;
  const progressClamped = Math.max(0, Math.min(100, progress));
  const achieved = current <= goal.target;
  const reduction = ((goal.baseline - current) / goal.baseline) * 100;

  // Calculate days remaining if target date is set
  let daysRemaining = null;
  if (goal.targetDate) {
    const today = new Date();
    const target = new Date(goal.targetDate);
    daysRemaining = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
  }

  return (
    <div className="goal-tracker">
      <div className="goal-header">
        <h3 className="goal-title">🎯 Your Reduction Goal</h3>
        <span className={`goal-status ${achieved ? 'achieved' : progress > 50 ? '' : 'danger'}`}>
          {achieved ? '✓ Achieved!' : progress > 50 ? 'On Track' : 'Needs Attention'}
        </span>
      </div>

      <div className="goal-display">
        <div className="goal-metrics">
          <div className="goal-metric">
            <span className="metric-label">Baseline</span>
            <span className="metric-value">{goal.baseline.toFixed(2)}t</span>
          </div>
          <div className="goal-metric">
            <span className="metric-label">Current</span>
            <span className={`metric-value ${achieved ? 'success' : ''}`}>
              {current.toFixed(2)}t
            </span>
          </div>
          <div className="goal-metric">
            <span className="metric-label">Target</span>
            <span className="metric-value success">{goal.target.toFixed(2)}t</span>
          </div>
          <div className="goal-metric">
            <span className="metric-label">Reduction</span>
            <span className={`metric-value ${reduction > 0 ? 'success' : 'danger'}`}>
              {reduction.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="goal-progress">
          <div className="progress-header">
            <span className="progress-label">Progress to Goal</span>
            <span className="progress-percentage">{progressClamped.toFixed(0)}%</span>
          </div>
          <div className="progress-bar-track">
            <div 
              className={`progress-bar-fill ${progress < 50 ? 'danger' : ''}`}
              style={{ width: `${progressClamped}%` }}
            />
          </div>
          <p className="progress-message">
            {achieved ? (
              <>🎉 Congratulations! You've achieved your goal! You've reduced your footprint by {reduction.toFixed(1)}%.</>
            ) : progress > 75 ? (
              <>🌟 Almost there! Just {(goal.baseline - goal.target - (goal.baseline - current)).toFixed(2)}t more to reach your target.</>
            ) : progress > 50 ? (
              <>💪 Good progress! Keep going to reach your {goal.target.toFixed(2)}t target.</>
            ) : progress > 25 ? (
              <>📊 You're making progress. Focus on high-impact changes to accelerate your reduction.</>
            ) : (
              <>🚀 Let's get started! Check your personalized recommendations to begin reducing emissions.</>
            )}
            {daysRemaining !== null && (
              <> {daysRemaining > 0 ? `${daysRemaining} days remaining.` : 'Target date reached!'}</>
            )}
          </p>
        </div>

        <div className="goal-actions">
          <button className="btn btn-ghost btn-sm" onClick={handleResetGoal}>
            Reset Goal
          </button>
        </div>
      </div>
    </div>
  );
}
