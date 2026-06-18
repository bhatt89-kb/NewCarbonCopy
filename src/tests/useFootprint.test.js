import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFootprint } from '../hooks/useFootprint';

describe('useFootprint Hook', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes with null result and insights', () => {
    const { result } = renderHook(() => useFootprint());
    
    expect(result.current.result).toBeNull();
    expect(result.current.insights).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('calculates footprint correctly', () => {
    const { result } = renderHook(() => useFootprint());
    
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

    act(() => {
      result.current.calculate(input);
    });

    expect(result.current.result).toBeTruthy();
    expect(result.current.insights).toBeTruthy();
    expect(result.current.result.total_annual_kg).toBeGreaterThan(0);
  });

  it('resets state correctly', () => {
    const { result } = renderHook(() => useFootprint());
    
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

    // Calculate first
    act(() => {
      result.current.calculate(input);
    });

    expect(result.current.result).toBeTruthy();

    // Reset
    act(() => {
      result.current.reset();
    });

    expect(result.current.result).toBeNull();
    expect(result.current.insights).toBeNull();
    expect(result.current.status).toBe('');
  });

  it('saves entry and updates state', () => {
    const { result } = renderHook(() => useFootprint());
    
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

    // Calculate first
    act(() => {
      result.current.calculate(input);
    });

    const initialEntriesLength = result.current.entries.length;

    // Save
    let saveResult;
    act(() => {
      saveResult = result.current.save();
    });

    expect(saveResult).toBe(true);
    expect(result.current.entries.length).toBe(initialEntriesLength + 1);
  });

  it('handles save without calculation', () => {
    const { result } = renderHook(() => useFootprint());
    
    let saveResult;
    act(() => {
      saveResult = result.current.save();
    });

    expect(saveResult).toBe(false);
  });

  it('clears history', () => {
    const { result } = renderHook(() => useFootprint());
    
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

    // Calculate and save
    act(() => {
      result.current.calculate(input);
    });
    
    act(() => {
      result.current.save();
    });

    expect(result.current.entries.length).toBeGreaterThan(0);

    // Clear
    act(() => {
      result.current.clearAll();
    });

    expect(result.current.entries.length).toBe(0);
  });

  it('sets loading state during calculation', () => {
    const { result } = renderHook(() => useFootprint());
    
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

    expect(result.current.loading).toBe(false);

    act(() => {
      result.current.calculate(input);
    });

    // After calculation completes, loading should be false
    expect(result.current.loading).toBe(false);
  });

  it('updates status message after calculation', () => {
    const { result } = renderHook(() => useFootprint());
    
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

    act(() => {
      result.current.calculate(input);
    });

    expect(result.current.status).toContain('ready');
  });

  it('refreshes history from localStorage', () => {
    const { result } = renderHook(() => useFootprint());
    
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

    // Calculate and save
    act(() => {
      result.current.calculate(input);
      result.current.save();
    });

    const entriesCount = result.current.entries.length;

    // Refresh
    act(() => {
      result.current.refreshHistory();
    });

    expect(result.current.entries.length).toBe(entriesCount);
  });
});
