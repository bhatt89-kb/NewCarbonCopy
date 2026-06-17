/**
 * EcoLens — Carbon Calculation Engine & Rule-Based Insights
 * 
 * Pure, deterministic functions with no side effects.
 * Emission factors sourced from DEFRA 2023, EPA, IPCC/Our World in Data.
 * All quantities normalized to annual kg CO₂e.
 */

const WEEKS_PER_YEAR = 52;
const MONTHS_PER_YEAR = 12;

/* kg CO₂e per km driven (single occupant). Source: DEFRA 2023 */
const CAR_FACTORS = {
  petrol: 0.170,
  diesel: 0.171,
  hybrid: 0.120,
  electric: 0.047
};

const PUBLIC_TRANSIT_PER_KM = 0.060;
const FLIGHT_SHORT_PER_KM = 0.158;
const FLIGHT_LONG_PER_KM = 0.150;
const SHORT_HAUL_KM = 1100;
const LONG_HAUL_KM = 6500;
const ELECTRICITY_PER_KWH = 0.450;
const GAS_PER_KWH = 0.183;
const GOODS_PER_USD = 0.40;
const WASTE_PER_KG = 0.580;

const DIET_ANNUAL = {
  heavy_meat: 3300,
  medium_meat: 2500,
  low_meat: 1900,
  pescatarian: 1700,
  vegetarian: 1500,
  vegan: 1050
};

const GLOBAL_AVG = 4800;
const SUSTAINABLE_TARGET = 2000;

const DIET_LADDER = [
  'heavy_meat', 'medium_meat', 'low_meat',
  'pescatarian', 'vegetarian', 'vegan'
];

const DIET_LABELS = {
  heavy_meat: 'heavy meat',
  medium_meat: 'medium meat',
  low_meat: 'low meat',
  pescatarian: 'pescatarian',
  vegetarian: 'vegetarian',
  vegan: 'vegan'
};

const CATEGORY_LABELS = {
  transport: 'Transport',
  home: 'Home Energy',
  diet: 'Diet & Food',
  consumption: 'Consumption'
};

const CATEGORY_ICONS = {
  transport: '🚗',
  home: '🏠',
  diet: '🥗',
  consumption: '🛍️'
};

const CATEGORY_COLORS = {
  transport: '#6366f1',
  home: '#f59e0b',
  diet: '#10b981',
  consumption: '#f43f5e'
};

/**
 * Calculate transport emissions (annual kg CO₂e)
 */
function calcTransport(t) {
  const car = t.car_km_per_week * WEEKS_PER_YEAR * (CAR_FACTORS[t.car_fuel] || CAR_FACTORS.petrol);
  const transit = t.public_transit_km_per_week * WEEKS_PER_YEAR * PUBLIC_TRANSIT_PER_KM;
  const flights = t.short_haul_flights_per_year * SHORT_HAUL_KM * FLIGHT_SHORT_PER_KM
    + t.long_haul_flights_per_year * LONG_HAUL_KM * FLIGHT_LONG_PER_KM;
  return car + transit + flights;
}

/**
 * Calculate home energy emissions (annual kg CO₂e, per person)
 */
function calcHome(h) {
  const elec = h.electricity_kwh_per_month * MONTHS_PER_YEAR * ELECTRICITY_PER_KWH;
  const gas = h.natural_gas_kwh_per_month * MONTHS_PER_YEAR * GAS_PER_KWH;
  return (elec + gas) / Math.max(1, h.household_size);
}

/**
 * Calculate consumption/waste emissions (annual kg CO₂e)
 */
function calcConsumption(c) {
  const goods = c.goods_spend_usd_per_month * MONTHS_PER_YEAR * GOODS_PER_USD;
  const waste = c.waste_kg_per_week * WEEKS_PER_YEAR * WASTE_PER_KG;
  return goods + waste;
}

/**
 * Main calculation: returns full footprint result object
 */
function calculateFootprint(input) {
  const breakdown = {
    transport: round2(calcTransport(input.transport)),
    home: round2(calcHome(input.home)),
    diet: round2(DIET_ANNUAL[input.diet] || DIET_ANNUAL.medium_meat),
    consumption: round2(calcConsumption(input.consumption))
  };
  const total = round2(Object.values(breakdown).reduce((a, b) => a + b, 0));
  return {
    breakdown_kg: breakdown,
    total_annual_kg: total,
    total_annual_tonnes: round3(total / 1000),
    comparison: {
      global_average_annual_kg: GLOBAL_AVG,
      sustainable_target_annual_kg: SUSTAINABLE_TARGET,
      ratio_to_global_average: round3(total / GLOBAL_AVG),
      ratio_to_sustainable_target: round3(total / SUSTAINABLE_TARGET)
    }
  };
}

/**
 * Generate rule-based personalized insights
 */
function generateInsights(input, result) {
  const recs = [];
  const ranked = Object.entries(result.breakdown_kg)
    .sort((a, b) => b[1] - a[1]);

  for (const [cat, amount] of ranked) {
    let rec = null;
    switch (cat) {
      case 'transport': rec = transportRec(input, amount); break;
      case 'home': rec = homeRec(amount); break;
      case 'diet': rec = dietRec(input); break;
      case 'consumption': rec = consumptionRec(amount); break;
    }
    if (rec) recs.push(rec);
  }

  const total = result.total_annual_kg;
  let summary;
  if (total <= SUSTAINABLE_TARGET) {
    summary = `Your estimated footprint is ${result.total_annual_tonnes} t CO₂e/yr — at or below the sustainable target of ${(SUSTAINABLE_TARGET / 1000).toFixed(1)} t. Excellent work! Keep reinforcing these habits.`;
  } else {
    const over = round2((total - SUSTAINABLE_TARGET) / 1000);
    summary = `Your estimated footprint is ${result.total_annual_tonnes} t CO₂e/yr, about ${over} t above the sustainable target of ${(SUSTAINABLE_TARGET / 1000).toFixed(1)} t. The actions below target your biggest sources first for the fastest reductions.`;
  }

  return { summary, recommendations: recs.slice(0, 4), source: 'rules' };
}

function transportRec(input, amount) {
  const t = input.transport;
  const flightsKm = t.short_haul_flights_per_year * SHORT_HAUL_KM + t.long_haul_flights_per_year * LONG_HAUL_KM;
  const carKmYear = t.car_km_per_week * WEEKS_PER_YEAR;
  const carEmissions = carKmYear * (CAR_FACTORS[t.car_fuel] || CAR_FACTORS.petrol);
  const flying = t.short_haul_flights_per_year + t.long_haul_flights_per_year > 0;

  if (flying && flightsKm * FLIGHT_LONG_PER_KM > carEmissions) {
    return { category: 'transport', action: 'Replace one or more flights per year with rail or video calls, and combine trips to reduce your aviation emissions.', estimated_annual_savings_kg: round2(0.5 * amount) };
  }
  if (t.car_km_per_week > 0 && t.car_fuel !== 'electric') {
    const saving = round2(carKmYear * (CAR_FACTORS[t.car_fuel] - CAR_FACTORS.electric));
    if (saving > 0) {
      return { category: 'transport', action: 'Shift short car trips to walking, cycling or public transit, and consider an electric vehicle for longer journeys.', estimated_annual_savings_kg: saving };
    }
  }
  if (amount > 0) {
    return { category: 'transport', action: 'Carpool or use public transit for routine journeys to cut transport emissions.', estimated_annual_savings_kg: round2(0.2 * amount) };
  }
  return null;
}

function homeRec(amount) {
  if (amount <= 0) return null;
  return { category: 'home', action: 'Switch to a renewable electricity tariff and improve insulation or thermostat settings to cut roughly a third of home energy emissions.', estimated_annual_savings_kg: round2(0.33 * amount) };
}

function dietRec(input) {
  const idx = DIET_LADDER.indexOf(input.diet);
  if (idx < 0 || idx >= DIET_LADDER.length - 1) return null;
  const target = DIET_LADDER[idx + 1];
  const saving = round2(DIET_ANNUAL[input.diet] - DIET_ANNUAL[target]);
  if (saving <= 0) return null;
  return { category: 'diet', action: `Shift toward a ${DIET_LABELS[target]} diet — even a few plant-based days each week meaningfully lowers food emissions.`, estimated_annual_savings_kg: saving };
}

function consumptionRec(amount) {
  if (amount <= 0) return null;
  return { category: 'consumption', action: 'Buy less and choose durable, second-hand or repairable goods, and reduce landfill waste by recycling and composting.', estimated_annual_savings_kg: round2(0.25 * amount) };
}

function round2(n) { return Math.round(n * 100) / 100; }
function round3(n) { return Math.round(n * 1000) / 1000; }

/**
 * Format kg value for display
 */
function formatKg(kg) {
  if (kg >= 1000) return (kg / 1000).toFixed(2) + ' t';
  return kg.toFixed(0) + ' kg';
}

/**
 * Generate or retrieve anonymous device ID
 */
function getDeviceId() {
  const KEY = 'ecolens_device_id';
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = 'dev_' + crypto.randomUUID().replace(/-/g, '').substring(0, 24);
    localStorage.setItem(KEY, id);
  }
  return id;
}
