import { useState, useCallback } from 'react';
import { emptyInput, DIET_ANNUAL } from '../engine';
import './Calculator.css';

const STEPS = [
  { key: 'transport', icon: '🚗', title: 'Transport & Travel', desc: 'Your weekly commute and annual flights' },
  { key: 'home', icon: '🏠', title: 'Home Energy', desc: 'Monthly electricity and gas usage' },
  { key: 'diet', icon: '🥗', title: 'Diet & Food', desc: 'Your diet profile determines food emissions' },
  { key: 'consumption', icon: '🛍️', title: 'Consumption & Waste', desc: 'Consumer goods and waste generation' },
];

const DIETS = [
  { value: 'heavy_meat', emoji: '🥩', name: 'Heavy Meat', kg: 3300 },
  { value: 'medium_meat', emoji: '🍖', name: 'Medium Meat', kg: 2500 },
  { value: 'low_meat', emoji: '🍗', name: 'Low Meat', kg: 1900 },
  { value: 'pescatarian', emoji: '🐟', name: 'Pescatarian', kg: 1700 },
  { value: 'vegetarian', emoji: '🥬', name: 'Vegetarian', kg: 1500 },
  { value: 'vegan', emoji: '🌱', name: 'Vegan', kg: 1050 },
];

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

export default function Calculator({ onCalculate, loading }) {
  const [step, setStep] = useState(0);
  const [input, setInput] = useState(emptyInput);

  const updateTransport = useCallback((field, value) => {
    setInput(prev => ({ ...prev, transport: { ...prev.transport, [field]: value } }));
  }, []);

  const updateHome = useCallback((field, value) => {
    setInput(prev => ({ ...prev, home: { ...prev.home, [field]: value } }));
  }, []);

  const updateConsumption = useCallback((field, value) => {
    setInput(prev => ({ ...prev, consumption: { ...prev.consumption, [field]: value } }));
  }, []);

  const setDiet = useCallback((d) => {
    setInput(prev => ({ ...prev, diet: d }));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const validated = {
      transport: {
        car_km_per_week: clamp(input.transport.car_km_per_week, 0, 20000),
        car_fuel: input.transport.car_fuel || 'petrol',
        public_transit_km_per_week: clamp(input.transport.public_transit_km_per_week, 0, 20000),
        short_haul_flights_per_year: Math.floor(clamp(input.transport.short_haul_flights_per_year, 0, 200)),
        long_haul_flights_per_year: Math.floor(clamp(input.transport.long_haul_flights_per_year, 0, 200)),
      },
      home: {
        electricity_kwh_per_month: clamp(input.home.electricity_kwh_per_month, 0, 100000),
        natural_gas_kwh_per_month: clamp(input.home.natural_gas_kwh_per_month, 0, 100000),
        household_size: Math.max(1, Math.floor(input.home.household_size)),
      },
      diet: input.diet,
      consumption: {
        goods_spend_usd_per_month: clamp(input.consumption.goods_spend_usd_per_month, 0, 1000000),
        waste_kg_per_week: clamp(input.consumption.waste_kg_per_week, 0, 1000),
      }
    };
    onCalculate(validated);
  };

  const numField = (label, value, onChange, id, hint, suffix, min = 0, max = 99999, s = 1) => (
    <div className="field" key={id}>
      <label htmlFor={id}>{label}</label>
      <div className="input-wrap">
        {suffix === 'USD' && <span className="input-prefix">$</span>}
        <input type="number" id={id} value={value} min={min} max={max} step={s}
          onChange={e => onChange(parseFloat(e.target.value) || 0)} aria-describedby={`${id}-hint`} />
        <span className="input-suffix">{suffix}</span>
      </div>
      <span className="hint" id={`${id}-hint`}>{hint}</span>
    </div>
  );

  const stepInfo = STEPS[step];
  const pct = ((step + 1) / STEPS.length) * 100;

  return (
    <section className="section" id="calculator">
      <div className="section-header">
        <h2>Carbon Footprint Calculator</h2>
        <p className="section-desc">Fill in your lifestyle details. All data stays on your device.</p>
      </div>

      {/* Stepper */}
      <div className="stepper" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={4} aria-label="Calculator progress">
        <div className="stepper-track"><div className="stepper-fill" style={{ width: `${pct}%` }} /></div>
        <div className="stepper-steps">
          {STEPS.map((s, i) => (
            <button key={s.key} type="button" className={`step ${i === step ? 'active' : ''} ${i < step ? 'completed' : ''}`}
              onClick={() => setStep(i)} aria-label={`Step ${i + 1}: ${s.title}`}>
              <span className="step-icon">{s.icon}</span>
              <span className="step-label">{s.key === 'consumption' ? 'Lifestyle' : s.title.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {/* Transport */}
        {step === 0 && (
          <div className="panel-card fade-in">
            <div className="panel-header">
              <span className="panel-icon" aria-hidden="true">{stepInfo.icon}</span>
              <div><h3>{stepInfo.title}</h3><p>{stepInfo.desc}</p></div>
            </div>
            <div className="form-grid">
              {numField('Car km per week', input.transport.car_km_per_week, v => updateTransport('car_km_per_week', v), 'car-km', 'Weekly driving distance', 'km', 0, 20000)}
              <div className="field">
                <label htmlFor="car-fuel">Car fuel type</label>
                <select id="car-fuel" value={input.transport.car_fuel} onChange={e => updateTransport('car_fuel', e.target.value)}>
                  <option value="petrol">Petrol / Gasoline</option>
                  <option value="diesel">Diesel</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="electric">Electric</option>
                </select>
              </div>
              {numField('Public transit km/week', input.transport.public_transit_km_per_week, v => updateTransport('public_transit_km_per_week', v), 'transit', 'Bus, rail, metro', 'km', 0, 20000)}
              {numField('Short-haul flights/year', input.transport.short_haul_flights_per_year, v => updateTransport('short_haul_flights_per_year', v), 'short-fl', 'Under ~3 hours', 'flights', 0, 200)}
              {numField('Long-haul flights/year', input.transport.long_haul_flights_per_year, v => updateTransport('long_haul_flights_per_year', v), 'long-fl', 'Over ~3 hours', 'flights', 0, 200)}
            </div>
          </div>
        )}

        {/* Home */}
        {step === 1 && (
          <div className="panel-card fade-in">
            <div className="panel-header">
              <span className="panel-icon" aria-hidden="true">{stepInfo.icon}</span>
              <div><h3>{stepInfo.title}</h3><p>{stepInfo.desc}</p></div>
            </div>
            <div className="form-grid">
              {numField('Electricity per month', input.home.electricity_kwh_per_month, v => updateHome('electricity_kwh_per_month', v), 'elec', 'Check your energy bill', 'kWh', 0, 100000)}
              {numField('Natural gas per month', input.home.natural_gas_kwh_per_month, v => updateHome('natural_gas_kwh_per_month', v), 'gas', 'Heating/cooking gas', 'kWh', 0, 100000)}
              {numField('Household size', input.home.household_size, v => updateHome('household_size', v), 'hh', 'Energy divided among members', 'people', 1, 50)}
            </div>
          </div>
        )}

        {/* Diet */}
        {step === 2 && (
          <div className="panel-card fade-in">
            <div className="panel-header">
              <span className="panel-icon" aria-hidden="true">{stepInfo.icon}</span>
              <div><h3>{stepInfo.title}</h3><p>{stepInfo.desc}</p></div>
            </div>
            <div className="diet-grid">
              {DIETS.map(d => (
                <label className="diet-option" key={d.value}>
                  <input type="radio" name="diet" value={d.value} checked={input.diet === d.value}
                    onChange={() => setDiet(d.value)} />
                  <div className="diet-card">
                    <span className="diet-emoji" aria-hidden="true">{d.emoji}</span>
                    <span className="diet-name">{d.name}</span>
                    <span className="diet-impact">~{d.kg.toLocaleString()} kg CO₂e/yr</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Consumption */}
        {step === 3 && (
          <div className="panel-card fade-in">
            <div className="panel-header">
              <span className="panel-icon" aria-hidden="true">{stepInfo.icon}</span>
              <div><h3>{stepInfo.title}</h3><p>{stepInfo.desc}</p></div>
            </div>
            <div className="form-grid">
              {numField('Goods spending/month', input.consumption.goods_spend_usd_per_month, v => updateConsumption('goods_spend_usd_per_month', v), 'goods', 'Clothing, electronics, etc.', 'USD', 0, 1000000)}
              {numField('Landfill waste/week', input.consumption.waste_kg_per_week, v => updateConsumption('waste_kg_per_week', v), 'waste', 'Non-recycled trash', 'kg', 0, 1000, 0.1)}
            </div>
          </div>
        )}

        {/* Nav buttons */}
        <div className="form-nav">
          <button type="button" className="btn btn-ghost" onClick={() => setStep(s => s - 1)}
            style={{ visibility: step === 0 ? 'hidden' : 'visible' }}>
            ← Previous
          </button>
          {step < STEPS.length - 1 ? (
            <button type="button" className="btn btn-primary" onClick={() => setStep(s => s + 1)}>
              Next →
            </button>
          ) : (
            <button type="submit" className="btn btn-accent" disabled={loading}>
              {loading ? 'Calculating...' : '🔍 Calculate Footprint'}
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
