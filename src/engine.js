import { safeJSONParse, safeLocalStorageSet, generateSecureId } from './utils/security';
import {
  WEEKS_PER_YEAR,
  MONTHS_PER_YEAR,
  CAR_FACTORS,
  PUBLIC_TRANSIT_PER_KM,
  FLIGHT_SHORT_PER_KM,
  FLIGHT_LONG_PER_KM,
  SHORT_HAUL_KM,
  LONG_HAUL_KM,
  ELECTRICITY_PER_KWH,
  GAS_PER_KWH,
  GOODS_PER_USD,
  WASTE_PER_KG,
  DIET_ANNUAL,
  GLOBAL_AVG,
  SUSTAINABLE_TARGET,
  DIET_LADDER,
  DIET_LABELS,
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  CATEGORY_COLORS
} from './constants/emissions';

/**
 * Carbon Calculation Engine & Rule-Based Insights
 * Emission factors: DEFRA 2023, EPA, IPCC / Our World in Data.
 * All quantities normalized to annual kg CO₂e.
 */

const WEEKS = WEEKS_PER_YEAR;
const MONTHS = MONTHS_PER_YEAR;

export { CAR_FACTORS, PUBLIC_TRANSIT_PER_KM, FLIGHT_SHORT_PER_KM, FLIGHT_LONG_PER_KM, SHORT_HAUL_KM, LONG_HAUL_KM };
export { ELECTRICITY_PER_KWH as ELEC_KWH, GAS_PER_KWH as GAS_KWH, GOODS_PER_USD as GOODS_USD, WASTE_PER_KG as WASTE_KG };
export { DIET_ANNUAL, GLOBAL_AVG, SUSTAINABLE_TARGET };
export { CATEGORY_LABELS, CATEGORY_ICONS, CATEGORY_COLORS };

/**
 * Helper function for rounding to 2 decimal places
 * @param {number} n - Number to round
 * @returns {number} Rounded number
 */
const r2 = n => Math.round(n * 100) / 100;

/**
 * Helper function for rounding to 3 decimal places
 * @param {number} n - Number to round
 * @returns {number} Rounded number
 */
const r3 = n => Math.round(n * 1000) / 1000;

/**
 * Calculate carbon footprint from user input
 * @param {Object} input - User input data
 * @param {Object} input.transport - Transport data
 * @param {Object} input.home - Home energy data
 * @param {string} input.diet - Diet type
 * @param {Object} input.consumption - Consumption data
 * @returns {Object} Calculated footprint with breakdown and comparison
 */
export function calculateFootprint(input) {
  const t = input.transport;
  const h = input.home;
  const c = input.consumption;

  const transport = r2(
    t.car_km_per_week * WEEKS * (CAR_FACTORS[t.car_fuel] || CAR_FACTORS.petrol) +
    t.public_transit_km_per_week * WEEKS * PUBLIC_TRANSIT_PER_KM +
    t.short_haul_flights_per_year * SHORT_HAUL_KM * FLIGHT_SHORT_PER_KM +
    t.long_haul_flights_per_year * LONG_HAUL_KM * FLIGHT_LONG_PER_KM
  );
  const home = r2((h.electricity_kwh_per_month * MONTHS * ELECTRICITY_PER_KWH + h.natural_gas_kwh_per_month * MONTHS * GAS_PER_KWH) / Math.max(1, h.household_size));
  const diet = r2(DIET_ANNUAL[input.diet] || DIET_ANNUAL.medium_meat);
  const consumption = r2(c.goods_spend_usd_per_month * MONTHS * GOODS_PER_USD + c.waste_kg_per_week * WEEKS * WASTE_PER_KG);

  const breakdown = { transport, home, diet, consumption };
  const total = r2(Object.values(breakdown).reduce((a, b) => a + b, 0));

  return {
    breakdown_kg: breakdown,
    total_annual_kg: total,
    total_annual_tonnes: r3(total / 1000),
    comparison: {
      global_average_annual_kg: GLOBAL_AVG,
      sustainable_target_annual_kg: SUSTAINABLE_TARGET,
      ratio_to_global_average: r3(total / GLOBAL_AVG),
      ratio_to_sustainable_target: r3(total / SUSTAINABLE_TARGET)
    }
  };
}

/**
 * Generate rule-based personalized insights
 * @param {Object} input - User input data
 * @param {Object} result - Calculated footprint result
 * @returns {Object} Insights with summary and recommendations
 */
export function generateInsights(input, result) {
  const recs = [];
  const ranked = Object.entries(result.breakdown_kg).sort((a, b) => b[1] - a[1]);

  for (const [cat, amt] of ranked) {
    let rec = null;
    if (cat === 'transport') rec = transportRec(input, amt);
    else if (cat === 'home') rec = homeRec(amt);
    else if (cat === 'diet') rec = dietRec(input);
    else if (cat === 'consumption') rec = consumptionRec(amt);
    if (rec) recs.push(rec);
  }

  const total = result.total_annual_kg;
  const tgt = SUSTAINABLE_TARGET;
  let summary;
  if (total <= tgt) {
    summary = `Your estimated footprint is ${result.total_annual_tonnes} t CO₂e/yr — at or below the sustainable target of ${(tgt/1000).toFixed(1)} t. Excellent work!`;
  } else {
    const over = r2((total - tgt) / 1000);
    summary = `Your estimated footprint is ${result.total_annual_tonnes} t CO₂e/yr, about ${over} t above the sustainable target of ${(tgt/1000).toFixed(1)} t. The actions below target your biggest sources first.`;
  }
  return { summary, recommendations: recs.slice(0, 4), source: 'rules' };
}

/**
 * Generate transport-specific recommendation
 * @private
 */
function transportRec(input, amt) {
  const t = input.transport;
  const flKm = t.short_haul_flights_per_year * SHORT_HAUL_KM + t.long_haul_flights_per_year * LONG_HAUL_KM;
  const carYr = t.car_km_per_week * WEEKS;
  const carE = carYr * (CAR_FACTORS[t.car_fuel] || CAR_FACTORS.petrol);
  if ((t.short_haul_flights_per_year + t.long_haul_flights_per_year) > 0 && flKm * FLIGHT_LONG_PER_KM > carE) {
    return { category:'transport', action:'Replace one or more flights per year with rail or video calls, and combine trips to reduce aviation emissions.', estimated_annual_savings_kg: r2(0.5 * amt) };
  }
  if (t.car_km_per_week > 0 && t.car_fuel !== 'electric') {
    const saving = r2(carYr * (CAR_FACTORS[t.car_fuel] - CAR_FACTORS.electric));
    if (saving > 0) return { category:'transport', action:'Shift short car trips to walking, cycling or public transit, and consider an EV for longer journeys.', estimated_annual_savings_kg: saving };
  }
  if (amt > 0) return { category:'transport', action:'Carpool or use public transit for routine journeys.', estimated_annual_savings_kg: r2(0.2 * amt) };
  return null;
}

/**
 * Generate home energy recommendation
 * @private
 */
function homeRec(amt) {
  return amt > 0 ? { category:'home', action:'Switch to a renewable electricity tariff and improve insulation to cut roughly a third of home energy emissions.', estimated_annual_savings_kg: r2(0.33 * amt) } : null;
}

/**
 * Generate diet recommendation
 * @private
 */
function dietRec(input) {
  const idx = DIET_LADDER.indexOf(input.diet);
  if (idx < 0 || idx >= DIET_LADDER.length - 1) return null;
  const target = DIET_LADDER[idx + 1];
  const saving = r2(DIET_ANNUAL[input.diet] - DIET_ANNUAL[target]);
  return saving > 0 ? { category:'diet', action:`Shift toward a ${DIET_LABELS[target]} diet — even a few plant-based days each week helps.`, estimated_annual_savings_kg: saving } : null;
}

/**
 * Generate consumption recommendation
 * @private
 */
function consumptionRec(amt) {
  return amt > 0 ? { category:'consumption', action:'Buy less and choose durable, second-hand goods. Reduce landfill waste by recycling and composting.', estimated_annual_savings_kg: r2(0.25 * amt) } : null;
}

/**
 * Format kg value for display
 * @param {number} kg - Value in kilograms
 * @returns {string} Formatted string with units
 */
export function formatKg(kg) {
  return kg >= 1000 ? (kg / 1000).toFixed(2) + ' t' : kg.toFixed(0) + ' kg';
}

/**
 * Create empty input structure
 * @returns {Object} Empty input object with default values
 */
export function emptyInput() {
  return {
    transport: { car_km_per_week:0, car_fuel:'petrol', public_transit_km_per_week:0, short_haul_flights_per_year:0, long_haul_flights_per_year:0 },
    home: { electricity_kwh_per_month:0, natural_gas_kwh_per_month:0, household_size:1 },
    diet: 'medium_meat',
    consumption: { goods_spend_usd_per_month:0, waste_kg_per_week:0 }
  };
}

/**
 * Get or generate unique device ID
 * @returns {string} Device ID
 */
export function getDeviceId() {
  const KEY = 'ecolens_device_id';
  let id = localStorage.getItem(KEY);
  if (!id) {
    // Use crypto.randomUUID if available, otherwise fallback to secure ID generator
    id = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? 'dev_' + crypto.randomUUID().replace(/-/g,'').substring(0,24)
      : generateSecureId('dev');
    safeLocalStorageSet(KEY, id);
  }
  return id;
}

/**
 * Retrieve calculation history from localStorage
 * @returns {Array} Array of history entries
 */
export function getHistory() {
  try {
    const data = localStorage.getItem('ecolens_history');
    return safeJSONParse(data, []);
  } catch {
    return [];
  }
}

/**
 * Save calculation entry to history
 * @param {Object} input - User input data
 * @param {Object} result - Calculation result
 * @returns {Object} Saved entry with metadata
 */
export function saveEntry(input, result) {
  const entries = getHistory();
  const entry = {
    id: 'entry_' + Date.now(),
    created_at: new Date().toISOString(),
    device_id: getDeviceId(),
    input,
    result
  };
  entries.unshift(entry);
  if (entries.length > 50) entries.length = 50;
  
  safeLocalStorageSet('ecolens_history', JSON.stringify(entries));
  return entry;
}

/**
 * Clear all calculation history
 */
export function clearHistory() {
  try {
    localStorage.removeItem('ecolens_history');
  } catch {
    // Silently fail if localStorage is not available
  }
}
