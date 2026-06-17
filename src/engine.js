/**
 * Carbon Calculation Engine & Rule-Based Insights
 * Emission factors: DEFRA 2023, EPA, IPCC / Our World in Data.
 * All quantities normalized to annual kg CO₂e.
 */

const WEEKS = 52;
const MONTHS = 12;

export const CAR_FACTORS = { petrol: 0.170, diesel: 0.171, hybrid: 0.120, electric: 0.047 };
export const PUBLIC_TRANSIT_KM = 0.060;
export const FLIGHT_SHORT_KM = 0.158;
export const FLIGHT_LONG_KM = 0.150;
export const SHORT_HAUL = 1100;
export const LONG_HAUL = 6500;
export const ELEC_KWH = 0.450;
export const GAS_KWH = 0.183;
export const GOODS_USD = 0.40;
export const WASTE_KG = 0.580;

export const DIET_ANNUAL = {
  heavy_meat: 3300, medium_meat: 2500, low_meat: 1900,
  pescatarian: 1700, vegetarian: 1500, vegan: 1050
};

export const GLOBAL_AVG = 4800;
export const SUSTAINABLE_TARGET = 2000;

const DIET_LADDER = ['heavy_meat','medium_meat','low_meat','pescatarian','vegetarian','vegan'];
const DIET_LABELS = { heavy_meat:'heavy meat', medium_meat:'medium meat', low_meat:'low meat', pescatarian:'pescatarian', vegetarian:'vegetarian', vegan:'vegan' };

export const CATEGORY_LABELS = { transport:'Transport', home:'Home Energy', diet:'Diet & Food', consumption:'Consumption' };
export const CATEGORY_ICONS = { transport:'🚗', home:'🏠', diet:'🥗', consumption:'🛍️' };
export const CATEGORY_COLORS = { transport:'#6366f1', home:'#f59e0b', diet:'#10b981', consumption:'#f43f5e' };

const r2 = n => Math.round(n * 100) / 100;
const r3 = n => Math.round(n * 1000) / 1000;

export function calculateFootprint(input) {
  const t = input.transport;
  const h = input.home;
  const c = input.consumption;

  const transport = r2(
    t.car_km_per_week * WEEKS * (CAR_FACTORS[t.car_fuel] || CAR_FACTORS.petrol) +
    t.public_transit_km_per_week * WEEKS * PUBLIC_TRANSIT_KM +
    t.short_haul_flights_per_year * SHORT_HAUL * FLIGHT_SHORT_KM +
    t.long_haul_flights_per_year * LONG_HAUL * FLIGHT_LONG_KM
  );
  const home = r2((h.electricity_kwh_per_month * MONTHS * ELEC_KWH + h.natural_gas_kwh_per_month * MONTHS * GAS_KWH) / Math.max(1, h.household_size));
  const diet = r2(DIET_ANNUAL[input.diet] || DIET_ANNUAL.medium_meat);
  const consumption = r2(c.goods_spend_usd_per_month * MONTHS * GOODS_USD + c.waste_kg_per_week * WEEKS * WASTE_KG);

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

function transportRec(input, amt) {
  const t = input.transport;
  const flKm = t.short_haul_flights_per_year * SHORT_HAUL + t.long_haul_flights_per_year * LONG_HAUL;
  const carYr = t.car_km_per_week * WEEKS;
  const carE = carYr * (CAR_FACTORS[t.car_fuel] || CAR_FACTORS.petrol);
  if ((t.short_haul_flights_per_year + t.long_haul_flights_per_year) > 0 && flKm * FLIGHT_LONG_KM > carE) {
    return { category:'transport', action:'Replace one or more flights per year with rail or video calls, and combine trips to reduce aviation emissions.', estimated_annual_savings_kg: r2(0.5 * amt) };
  }
  if (t.car_km_per_week > 0 && t.car_fuel !== 'electric') {
    const saving = r2(carYr * (CAR_FACTORS[t.car_fuel] - CAR_FACTORS.electric));
    if (saving > 0) return { category:'transport', action:'Shift short car trips to walking, cycling or public transit, and consider an EV for longer journeys.', estimated_annual_savings_kg: saving };
  }
  if (amt > 0) return { category:'transport', action:'Carpool or use public transit for routine journeys.', estimated_annual_savings_kg: r2(0.2 * amt) };
  return null;
}

function homeRec(amt) {
  return amt > 0 ? { category:'home', action:'Switch to a renewable electricity tariff and improve insulation to cut roughly a third of home energy emissions.', estimated_annual_savings_kg: r2(0.33 * amt) } : null;
}

function dietRec(input) {
  const idx = DIET_LADDER.indexOf(input.diet);
  if (idx < 0 || idx >= DIET_LADDER.length - 1) return null;
  const target = DIET_LADDER[idx + 1];
  const saving = r2(DIET_ANNUAL[input.diet] - DIET_ANNUAL[target]);
  return saving > 0 ? { category:'diet', action:`Shift toward a ${DIET_LABELS[target]} diet — even a few plant-based days each week helps.`, estimated_annual_savings_kg: saving } : null;
}

function consumptionRec(amt) {
  return amt > 0 ? { category:'consumption', action:'Buy less and choose durable, second-hand goods. Reduce landfill waste by recycling and composting.', estimated_annual_savings_kg: r2(0.25 * amt) } : null;
}

export function formatKg(kg) {
  return kg >= 1000 ? (kg / 1000).toFixed(2) + ' t' : kg.toFixed(0) + ' kg';
}

export function emptyInput() {
  return {
    transport: { car_km_per_week:0, car_fuel:'petrol', public_transit_km_per_week:0, short_haul_flights_per_year:0, long_haul_flights_per_year:0 },
    home: { electricity_kwh_per_month:0, natural_gas_kwh_per_month:0, household_size:1 },
    diet: 'medium_meat',
    consumption: { goods_spend_usd_per_month:0, waste_kg_per_week:0 }
  };
}

export function getDeviceId() {
  const KEY = 'ecolens_device_id';
  let id = localStorage.getItem(KEY);
  if (!id) { id = 'dev_' + crypto.randomUUID().replace(/-/g,'').substring(0,24); localStorage.setItem(KEY, id); }
  return id;
}

export function getHistory() {
  try { return JSON.parse(localStorage.getItem('ecolens_history') || '[]'); } catch { return []; }
}

export function saveEntry(input, result) {
  const entries = getHistory();
  const entry = { id:'entry_'+Date.now(), created_at: new Date().toISOString(), device_id: getDeviceId(), input, result };
  entries.unshift(entry);
  if (entries.length > 50) entries.length = 50;
  localStorage.setItem('ecolens_history', JSON.stringify(entries));
  return entry;
}

export function clearHistory() {
  localStorage.removeItem('ecolens_history');
}
