/**
 * Export/Import Utilities
 * Data portability and backup
 */

/**
 * Export user data as JSON file
 * @param {Array} history - Calculation history
 * @param {Object} goal - Current goal
 * @returns {void}
 */
export function exportData(history, goal = null) {
  const data = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    history: history || [],
    goal: goal,
    metadata: {
      totalCalculations: history?.length || 0,
      application: 'EcoLens Carbon Tracker',
    },
  };
  
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `ecolens-data-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Import user data from JSON file
 * @param {File} file - JSON file to import
 * @returns {Promise<Object>} Imported data
 */
export function importData(file) {
  return new Promise((resolve, reject) => {
    if (!file || file.type !== 'application/json') {
      reject(new Error('Invalid file type. Please select a JSON file.'));
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        
        // Validate data structure
        if (!data.version || !data.history) {
          reject(new Error('Invalid data format. File may be corrupted.'));
          return;
        }
        
        // Validate history entries
        if (!Array.isArray(data.history)) {
          reject(new Error('Invalid history data.'));
          return;
        }
        
        resolve(data);
      } catch (error) {
        reject(new Error('Failed to parse JSON file: ' + error.message));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file.'));
    };
    
    reader.readAsText(file);
  });
}

/**
 * Export data as CSV
 * @param {Array} history - Calculation history
 * @returns {void}
 */
export function exportCSV(history) {
  if (!history || history.length === 0) {
    alert('No data to export');
    return;
  }
  
  // CSV headers
  const headers = [
    'Date',
    'Total (tonnes)',
    'Transport (kg)',
    'Home (kg)',
    'Diet (kg)',
    'Consumption (kg)',
  ];
  
  // CSV rows
  const rows = history.map(entry => [
    new Date(entry.created_at).toLocaleDateString(),
    entry.result.total_annual_tonnes.toFixed(2),
    entry.result.breakdown_kg.transport.toFixed(0),
    entry.result.breakdown_kg.home.toFixed(0),
    entry.result.breakdown_kg.diet.toFixed(0),
    entry.result.breakdown_kg.consumption.toFixed(0),
  ]);
  
  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `ecolens-history-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate shareable summary text
 * @param {Object} result - Latest calculation result
 * @returns {string} Summary text
 */
export function generateShareText(result) {
  const total = result.total_annual_tonnes.toFixed(2);
  const comparison = result.total_annual_kg <= 2000 
    ? 'below' 
    : 'above';
  const target = (2000 / 1000).toFixed(1);
  
  return `🌱 My Carbon Footprint: ${total} tonnes CO₂e/year
  
📊 Breakdown:
🚗 Transport: ${(result.breakdown_kg.transport / 1000).toFixed(2)}t
🏠 Home: ${(result.breakdown_kg.home / 1000).toFixed(2)}t
🥗 Diet: ${(result.breakdown_kg.diet / 1000).toFixed(2)}t
🛍️ Consumption: ${(result.breakdown_kg.consumption / 1000).toFixed(2)}t

I'm ${comparison} the sustainable target of ${target}t. Track yours at EcoLens! 🌍`;
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    }
  } catch {
    return false;
  }
}
