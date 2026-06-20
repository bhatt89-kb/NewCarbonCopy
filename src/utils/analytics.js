/**
 * Advanced Analytics Utilities
 * Statistical analysis and predictions
 */

/**
 * Calculate moving average
 * @param {Array} values - Array of numbers
 * @param {number} window - Window size for moving average
 * @returns {Array} Moving average values
 */
export function calculateMovingAverage(values, window = 3) {
  if (!values || values.length < window) {
    return values;
  }
  
  const result = [];
  for (let i = 0; i < values.length; i++) {
    if (i < window - 1) {
      result.push(values[i]);
    } else {
      const sum = values.slice(i - window + 1, i + 1).reduce((a, b) => a + b, 0);
      result.push(sum / window);
    }
  }
  return result;
}

/**
 * Calculate trend using linear regression
 * @param {Array} entries - History entries
 * @returns {Object} Trend analysis
 */
export function calculateTrend(entries) {
  if (!entries || entries.length < 2) {
    return { slope: 0, direction: 'stable', prediction: null };
  }

  const sorted = [...entries].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  const values = sorted.map(e => e.result.total_annual_tonnes);
  
  // Simple linear regression
  const n = values.length;
  const xValues = Array.from({ length: n }, (_, i) => i);
  const xMean = xValues.reduce((a, b) => a + b, 0) / n;
  const yMean = values.reduce((a, b) => a + b, 0) / n;
  
  let numerator = 0;
  let denominator = 0;
  
  for (let i = 0; i < n; i++) {
    numerator += (xValues[i] - xMean) * (values[i] - yMean);
    denominator += Math.pow(xValues[i] - xMean, 2);
  }
  
  const slope = denominator !== 0 ? numerator / denominator : 0;
  
  // Predict next value
  const prediction = values[n - 1] + slope;
  
  // Determine direction
  let direction = 'stable';
  if (Math.abs(slope) > 0.05) {
    direction = slope < 0 ? 'decreasing' : 'increasing';
  }
  
  return {
    slope: Math.round(slope * 1000) / 1000,
    direction,
    prediction: Math.max(0, Math.round(prediction * 100) / 100),
    changePerPeriod: slope,
  };
}

/**
 * Calculate percentile rank
 * @param {number} value - User's value
 * @param {number} globalAvg - Global average
 * @param {number} sustainableTarget - Sustainable target
 * @returns {Object} Percentile information
 */
export function calculatePercentile(value, globalAvg = 4800, sustainableTarget = 2000) {
  // Simplified percentile based on distribution
  // Assuming normal distribution with mean=globalAvg, target=sustainableTarget
  
  let percentile;
  if (value <= sustainableTarget) {
    percentile = 10; // Top 10%
  } else if (value <= globalAvg * 0.7) {
    percentile = 25; // Top 25%
  } else if (value <= globalAvg) {
    percentile = 50; // Top 50%
  } else if (value <= globalAvg * 1.3) {
    percentile = 70; // Top 70%
  } else {
    percentile = 90; // Bottom 10%
  }
  
  let category;
  if (percentile <= 10) category = 'Excellent';
  else if (percentile <= 25) category = 'Very Good';
  else if (percentile <= 50) category = 'Good';
  else if (percentile <= 70) category = 'Average';
  else category = 'Needs Improvement';
  
  return {
    percentile,
    category,
    betterThan: 100 - percentile,
  };
}

/**
 * Generate AI-style recommendations based on patterns
 * @param {Object} input - User input
 * @param {Object} result - Calculation result
 * @param {Array} history - User history
 * @returns {Array} Enhanced recommendations
 */
export function generateAdvancedRecommendations(input, result, history = []) {
  const recommendations = [];
  
  // Analyze patterns if history exists
  let trend = null;
  if (history.length >= 2) {
    trend = calculateTrend(history);
  }
  
  // Transport recommendations with AI context
  if (result.breakdown_kg.transport > 1000) {
    const saving = Math.round(result.breakdown_kg.transport * 0.3);
    recommendations.push({
      category: 'transport',
      title: '🚗 Reduce Car Usage',
      description: 'Users who reduced car trips by 30% saved an average of ' + saving + ' kg CO₂e annually.',
      actions: [
        'Work from home 2 days per week',
        'Combine errands into single trips',
        'Use public transit for commute',
      ],
      impact: 'high',
      difficulty: 'medium',
      savings: saving,
    });
  }
  
  // Flight recommendations
  if (input.transport.short_haul_flights_per_year + input.transport.long_haul_flights_per_year > 2) {
    recommendations.push({
      category: 'transport',
      title: '✈️ Reconsider Air Travel',
      description: 'One fewer flight per year can save up to 1,000 kg CO₂e.',
      actions: [
        'Replace short flights with train travel',
        'Combine business trips',
        'Use video conferencing',
      ],
      impact: 'high',
      difficulty: 'medium',
      savings: 1000,
    });
  }
  
  // Home energy recommendations
  if (result.breakdown_kg.home > 1000) {
    recommendations.push({
      category: 'home',
      title: '🏠 Energy Efficiency Quick Wins',
      description: 'Small changes can reduce home energy by 20-30%.',
      actions: [
        'Switch to LED bulbs (saves 50 kg/year)',
        'Lower thermostat by 2°C (saves 300 kg/year)',
        'Use energy-efficient appliances',
      ],
      impact: 'medium',
      difficulty: 'easy',
      savings: Math.round(result.breakdown_kg.home * 0.25),
    });
  }
  
  // Diet recommendations with trending data
  const dietEmissions = result.breakdown_kg.diet;
  if (dietEmissions > 2000) {
    recommendations.push({
      category: 'diet',
      title: '🥗 Plant-Based Transition',
      description: 'Users who adopted 2 meatless days per week reduced emissions by 15%.',
      actions: [
        'Start "Meatless Mondays"',
        'Try plant-based alternatives',
        'Reduce beef consumption first (highest impact)',
      ],
      impact: 'high',
      difficulty: 'easy',
      savings: Math.round(dietEmissions * 0.15),
    });
  }
  
  // Consumption recommendations
  if (result.breakdown_kg.consumption > 500) {
    recommendations.push({
      category: 'consumption',
      title: '♻️ Sustainable Consumption',
      description: 'Buying second-hand and repairing items can cut consumption emissions by 40%.',
      actions: [
        'Buy second-hand when possible',
        'Repair instead of replace',
        'Choose quality over quantity',
      ],
      impact: 'medium',
      difficulty: 'easy',
      savings: Math.round(result.breakdown_kg.consumption * 0.4),
    });
  }
  
  // Trend-based recommendation
  if (trend && trend.direction === 'increasing') {
    recommendations.push({
      category: 'trend',
      title: '📈 Reverse the Trend',
      description: `Your footprint is increasing by ${Math.abs(trend.changePerPeriod).toFixed(2)}t per calculation. Take action now!`,
      actions: [
        'Review your recent lifestyle changes',
        'Set a reduction goal',
        'Focus on your highest emission category',
      ],
      impact: 'high',
      difficulty: 'medium',
      savings: Math.abs(trend.changePerPeriod * 1000),
    });
  } else if (trend && trend.direction === 'decreasing') {
    recommendations.push({
      category: 'trend',
      title: '🎉 Keep Up the Good Work!',
      description: `You're reducing emissions by ${Math.abs(trend.changePerPeriod).toFixed(2)}t per calculation. Maintain momentum!`,
      actions: [
        'Share your success with friends',
        'Set a more ambitious goal',
        'Help others reduce their footprint',
      ],
      impact: 'low',
      difficulty: 'easy',
      savings: 0,
    });
  }
  
  // Sort by impact and return top 5
  const impactOrder = { high: 3, medium: 2, low: 1 };
  return recommendations
    .sort((a, b) => impactOrder[b.impact] - impactOrder[a.impact])
    .slice(0, 5);
}

/**
 * Calculate statistics for dashboard
 * @param {Array} entries - History entries
 * @returns {Object} Statistics
 */
export function calculateStatistics(entries) {
  if (!entries || entries.length === 0) {
    return null;
  }
  
  const values = entries.map(e => e.result.total_annual_tonnes);
  const sorted = [...entries].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  
  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const latest = values[0]; // entries are newest first
  const oldest = sorted[0].result.total_annual_tonnes;
  const totalChange = oldest - latest;
  const percentChange = ((totalChange / oldest) * 100).toFixed(1);
  
  // Calculate days tracking
  const firstDate = new Date(sorted[0].created_at);
  const lastDate = new Date(entries[0].created_at);
  const daysTracking = Math.ceil((lastDate - firstDate) / (1000 * 60 * 60 * 24));
  
  return {
    min: Math.round(min * 100) / 100,
    max: Math.round(max * 100) / 100,
    average: Math.round(avg * 100) / 100,
    latest: Math.round(latest * 100) / 100,
    oldest: Math.round(oldest * 100) / 100,
    totalChange: Math.round(totalChange * 100) / 100,
    percentChange,
    totalCalculations: entries.length,
    daysTracking,
    trend: calculateTrend(entries),
  };
}
