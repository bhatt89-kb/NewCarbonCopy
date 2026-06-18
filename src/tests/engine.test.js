import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  calculateFootprint,
  generateInsights,
  formatKg,
  emptyInput,
  getDeviceId,
  getHistory,
  saveEntry,
  clearHistory,
  CAR_FACTORS,
  SUSTAINABLE_TARGET,
  GLOBAL_AVG,
  DIET_ANNUAL,
} from '../engine';

describe('Carbon Calculation Engine', () => {
  describe('calculateFootprint', () => {
    it('calculates transport emissions for petrol car', () => {
      const input = {
        transport: {
          car_km_per_week: 100,
          car_fuel: 'petrol',
          public_transit_km_per_week: 0,
          short_haul_flights_per_year: 0,
          long_haul_flights_per_year: 0,
        },
        home: {
          electricity_kwh_per_month: 0,
          natural_gas_kwh_per_month: 0,
          household_size: 1,
        },
        diet: 'vegan',
        consumption: {
          goods_spend_usd_per_month: 0,
          waste_kg_per_week: 0,
        },
      };

      const result = calculateFootprint(input);
      
      // 100 km/week * 52 weeks * 0.170 kg/km = 884 kg
      expect(result.breakdown_kg.transport).toBe(884);
      expect(result.total_annual_kg).toBeGreaterThan(0);
    });

    it('calculates home energy emissions', () => {
      const input = {
        transport: {
          car_km_per_week: 0,
          car_fuel: 'petrol',
          public_transit_km_per_week: 0,
          short_haul_flights_per_year: 0,
          long_haul_flights_per_year: 0,
        },
        home: {
          electricity_kwh_per_month: 300,
          natural_gas_kwh_per_month: 200,
          household_size: 2,
        },
        diet: 'vegan',
        consumption: {
          goods_spend_usd_per_month: 0,
          waste_kg_per_week: 0,
        },
      };

      const result = calculateFootprint(input);
      
      // (300 * 12 * 0.450 + 200 * 12 * 0.183) / 2 = (1620 + 439.2) / 2 = 1029.6 kg
      expect(result.breakdown_kg.home).toBeCloseTo(1029.6, 0);
    });

    it('calculates flight emissions correctly', () => {
      const input = {
        transport: {
          car_km_per_week: 0,
          car_fuel: 'petrol',
          public_transit_km_per_week: 0,
          short_haul_flights_per_year: 2,
          long_haul_flights_per_year: 1,
        },
        home: {
          electricity_kwh_per_month: 0,
          natural_gas_kwh_per_month: 0,
          household_size: 1,
        },
        diet: 'vegan',
        consumption: {
          goods_spend_usd_per_month: 0,
          waste_kg_per_week: 0,
        },
      };

      const result = calculateFootprint(input);
      
      // Short: 2 * 1100 * 0.158 = 347.6
      // Long: 1 * 6500 * 0.150 = 975
      // Total: 1322.6
      expect(result.breakdown_kg.transport).toBeCloseTo(1322.6, 0);
    });

    it('includes all diet types correctly', () => {
      const diets = ['heavy_meat', 'medium_meat', 'low_meat', 'pescatarian', 'vegetarian', 'vegan'];
      
      diets.forEach(diet => {
        const input = emptyInput();
        input.diet = diet;
        const result = calculateFootprint(input);
        
        expect(result.breakdown_kg.diet).toBe(DIET_ANNUAL[diet]);
      });
    });

    it('calculates consumption emissions', () => {
      const input = {
        transport: {
          car_km_per_week: 0,
          car_fuel: 'petrol',
          public_transit_km_per_week: 0,
          short_haul_flights_per_year: 0,
          long_haul_flights_per_year: 0,
        },
        home: {
          electricity_kwh_per_month: 0,
          natural_gas_kwh_per_month: 0,
          household_size: 1,
        },
        diet: 'vegan',
        consumption: {
          goods_spend_usd_per_month: 200,
          waste_kg_per_week: 10,
        },
      };

      const result = calculateFootprint(input);
      
      // Goods: 200 * 12 * 0.40 = 960
      // Waste: 10 * 52 * 0.580 = 301.6
      // Total: 1261.6
      expect(result.breakdown_kg.consumption).toBeCloseTo(1261.6, 0);
    });

    it('provides correct comparison ratios', () => {
      const input = emptyInput();
      input.transport.car_km_per_week = 200;
      
      const result = calculateFootprint(input);
      
      expect(result.comparison.global_average_annual_kg).toBe(GLOBAL_AVG);
      expect(result.comparison.sustainable_target_annual_kg).toBe(SUSTAINABLE_TARGET);
      expect(result.comparison.ratio_to_global_average).toBeGreaterThan(0);
      expect(result.comparison.ratio_to_sustainable_target).toBeGreaterThan(0);
    });

    it('converts to tonnes correctly', () => {
      const input = emptyInput();
      input.transport.car_km_per_week = 100;
      
      const result = calculateFootprint(input);
      
      expect(result.total_annual_tonnes).toBe(result.total_annual_kg / 1000);
    });
  });

  describe('generateInsights', () => {
    it('generates insights for high emissions', () => {
      const input = emptyInput();
      input.transport.car_km_per_week = 200;
      input.transport.car_fuel = 'petrol';
      
      const result = calculateFootprint(input);
      const insights = generateInsights(input, result);
      
      expect(insights.summary).toBeTruthy();
      expect(insights.recommendations).toBeInstanceOf(Array);
      expect(insights.recommendations.length).toBeGreaterThan(0);
      expect(insights.source).toBe('rules');
    });

    it('provides positive feedback for low emissions', () => {
      const input = emptyInput();
      input.diet = 'vegan';
      
      const result = calculateFootprint(input);
      const insights = generateInsights(input, result);
      
      expect(insights.summary).toContain('sustainable target');
    });

    it('prioritizes recommendations by highest emissions', () => {
      const input = emptyInput();
      input.transport.car_km_per_week = 200;
      input.home.electricity_kwh_per_month = 500;
      input.diet = 'heavy_meat';
      
      const result = calculateFootprint(input);
      const insights = generateInsights(input, result);
      
      expect(insights.recommendations.length).toBeGreaterThan(0);
      expect(insights.recommendations.length).toBeLessThanOrEqual(4);
    });

    it('suggests flight reduction when applicable', () => {
      const input = emptyInput();
      input.transport.short_haul_flights_per_year = 5;
      input.transport.long_haul_flights_per_year = 2;
      
      const result = calculateFootprint(input);
      const insights = generateInsights(input, result);
      
      const transportRec = insights.recommendations.find(r => r.category === 'transport');
      expect(transportRec).toBeTruthy();
      expect(transportRec.action).toContain('flight');
    });

    it('suggests diet improvements', () => {
      const input = emptyInput();
      input.diet = 'heavy_meat';
      input.home.electricity_kwh_per_month = 0;
      
      const result = calculateFootprint(input);
      const insights = generateInsights(input, result);
      
      const dietRec = insights.recommendations.find(r => r.category === 'diet');
      expect(dietRec).toBeTruthy();
      expect(dietRec.estimated_annual_savings_kg).toBeGreaterThan(0);
    });
  });

  describe('formatKg', () => {
    it('formats values under 1000 as kg', () => {
      expect(formatKg(500)).toBe('500 kg');
      expect(formatKg(999)).toBe('999 kg');
    });

    it('formats values 1000+ as tonnes', () => {
      expect(formatKg(1000)).toBe('1.00 t');
      expect(formatKg(2500)).toBe('2.50 t');
      expect(formatKg(10000)).toBe('10.00 t');
    });

    it('rounds appropriately', () => {
      expect(formatKg(1234.567)).toBe('1.23 t');
      expect(formatKg(123.456)).toBe('123 kg');
    });
  });

  describe('emptyInput', () => {
    it('returns valid empty input structure', () => {
      const input = emptyInput();
      
      expect(input.transport).toBeDefined();
      expect(input.home).toBeDefined();
      expect(input.diet).toBeDefined();
      expect(input.consumption).toBeDefined();
      
      expect(input.transport.car_km_per_week).toBe(0);
      expect(input.home.household_size).toBe(1);
      expect(input.diet).toBe('medium_meat');
    });
  });

  describe('LocalStorage Functions', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    afterEach(() => {
      localStorage.clear();
    });

    it('generates and persists device ID', () => {
      const id1 = getDeviceId();
      const id2 = getDeviceId();
      
      expect(id1).toBeTruthy();
      expect(id1).toBe(id2);
      expect(id1).toMatch(/^dev_/);
    });

    it('saves and retrieves history', () => {
      const input = emptyInput();
      const result = calculateFootprint(input);
      
      const entry = saveEntry(input, result);
      
      expect(entry.id).toBeTruthy();
      expect(entry.created_at).toBeTruthy();
      expect(entry.input).toEqual(input);
      expect(entry.result).toEqual(result);
      
      const history = getHistory();
      expect(history.length).toBe(1);
      expect(history[0].id).toBe(entry.id);
    });

    it('limits history to 50 entries', () => {
      const input = emptyInput();
      const result = calculateFootprint(input);
      
      // Save 55 entries
      for (let i = 0; i < 55; i++) {
        saveEntry(input, result);
      }
      
      const history = getHistory();
      expect(history.length).toBe(50);
    });

    it('clears history', () => {
      const input = emptyInput();
      const result = calculateFootprint(input);
      
      saveEntry(input, result);
      expect(getHistory().length).toBe(1);
      
      clearHistory();
      expect(getHistory().length).toBe(0);
    });

    it('handles corrupted localStorage gracefully', () => {
      localStorage.setItem('ecolens_history', 'invalid json');
      
      const history = getHistory();
      expect(history).toEqual([]);
    });
  });

  describe('Constants', () => {
    it('has all required car fuel types', () => {
      expect(CAR_FACTORS.petrol).toBeDefined();
      expect(CAR_FACTORS.diesel).toBeDefined();
      expect(CAR_FACTORS.hybrid).toBeDefined();
      expect(CAR_FACTORS.electric).toBeDefined();
    });

    it('has diet emission factors', () => {
      expect(DIET_ANNUAL.heavy_meat).toBeGreaterThan(DIET_ANNUAL.vegan);
      expect(DIET_ANNUAL.vegetarian).toBeGreaterThan(DIET_ANNUAL.vegan);
    });

    it('has global benchmarks', () => {
      expect(GLOBAL_AVG).toBe(4800);
      expect(SUSTAINABLE_TARGET).toBe(2000);
    });
  });
});
