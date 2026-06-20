/**
 * Emission Factor Constants
 * Sources: DEFRA 2023, EPA, IPCC / Our World in Data
 * All values in kg CO₂e
 */

// Time periods
export const WEEKS_PER_YEAR = 52;
export const MONTHS_PER_YEAR = 12;

// Transport emission factors (kg CO₂e per km)
export const CAR_FACTORS = {
  petrol: 0.170,
  diesel: 0.171,
  hybrid: 0.120,
  electric: 0.047
};

export const PUBLIC_TRANSIT_PER_KM = 0.060;
export const FLIGHT_SHORT_PER_KM = 0.158;
export const FLIGHT_LONG_PER_KM = 0.150;
export const SHORT_HAUL_KM = 1100;
export const LONG_HAUL_KM = 6500;

// Home energy emission factors (kg CO₂e per kWh)
export const ELECTRICITY_PER_KWH = 0.450;
export const GAS_PER_KWH = 0.183;

// Consumption emission factors
export const GOODS_PER_USD = 0.40;
export const WASTE_PER_KG = 0.580;

// Diet emission factors (annual kg CO₂e)
export const DIET_ANNUAL = {
  heavy_meat: 3300,
  medium_meat: 2500,
  low_meat: 1900,
  pescatarian: 1700,
  vegetarian: 1500,
  vegan: 1050
};

// Global benchmarks (annual kg CO₂e)
export const GLOBAL_AVG = 4800;
export const SUSTAINABLE_TARGET = 2000;

// Diet progression ladder
export const DIET_LADDER = [
  'heavy_meat',
  'medium_meat',
  'low_meat',
  'pescatarian',
  'vegetarian',
  'vegan'
];

// UI Labels and styling
export const DIET_LABELS = {
  heavy_meat: 'heavy meat',
  medium_meat: 'medium meat',
  low_meat: 'low meat',
  pescatarian: 'pescatarian',
  vegetarian: 'vegetarian',
  vegan: 'vegan'
};

export const CATEGORY_LABELS = {
  transport: 'Transport',
  home: 'Home Energy',
  diet: 'Diet & Food',
  consumption: 'Consumption'
};

export const CATEGORY_ICONS = {
  transport: '🚗',
  home: '🏠',
  diet: '🥗',
  consumption: '🛍️'
};

export const CATEGORY_COLORS = {
  transport: '#6366f1',
  home: '#f59e0b',
  diet: '#10b981',
  consumption: '#f43f5e'
};
