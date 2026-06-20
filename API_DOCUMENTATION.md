# API Documentation

## Carbon Calculation Engine

### Core Functions

#### `calculateFootprint(input)`

Calculates total annual carbon footprint from user input.

**Parameters:**
```typescript
{
  transport: {
    car_km_per_week: number,
    car_fuel: 'petrol' | 'diesel' | 'hybrid' | 'electric',
    public_transit_km_per_week: number,
    short_haul_flights_per_year: number,
    long_haul_flights_per_year: number
  },
  home: {
    electricity_kwh_per_month: number,
    natural_gas_kwh_per_month: number,
    household_size: number
  },
  diet: 'heavy_meat' | 'medium_meat' | 'low_meat' | 'pescatarian' | 'vegetarian' | 'vegan',
  consumption: {
    goods_spend_usd_per_month: number,
    waste_kg_per_week: number
  }
}
```

**Returns:**
```typescript
{
  breakdown_kg: {
    transport: number,
    home: number,
    diet: number,
    consumption: number
  },
  total_annual_kg: number,
  total_annual_tonnes: number,
  comparison: {
    global_average_annual_kg: number,
    sustainable_target_annual_kg: number,
    ratio_to_global_average: number,
    ratio_to_sustainable_target: number
  }
}
```

**Example:**
```javascript
import { calculateFootprint } from './engine';

const input = {
  transport: {
    car_km_per_week: 100,
    car_fuel: 'petrol',
    public_transit_km_per_week: 20,
    short_haul_flights_per_year: 2,
    long_haul_flights_per_year: 1
  },
  home: {
    electricity_kwh_per_month: 300,
    natural_gas_kwh_per_month: 200,
    household_size: 2
  },
  diet: 'medium_meat',
  consumption: {
    goods_spend_usd_per_month: 200,
    waste_kg_per_week: 10
  }
};

const result = calculateFootprint(input);
// result.total_annual_tonnes = 5.23
```

---

#### `generateInsights(input, result)`

Generates personalized reduction recommendations.

**Parameters:**
- `input` - User input object
- `result` - Calculation result from `calculateFootprint()`

**Returns:**
```typescript
{
  summary: string,
  recommendations: Array<{
    category: 'transport' | 'home' | 'diet' | 'consumption',
    action: string,
    estimated_annual_savings_kg: number
  }>,
  source: 'rules' | 'gemini'
}
```

---

### Advanced Analytics

#### `calculateTrend(entries)`

Performs linear regression on historical data.

**Parameters:**
- `entries` - Array of history entries

**Returns:**
```typescript
{
  slope: number,
  direction: 'increasing' | 'decreasing' | 'stable',
  prediction: number,
  changePerPeriod: number
}
```

---

#### `calculatePercentile(value, globalAvg, sustainableTarget)`

Calculates user's percentile ranking.

**Parameters:**
- `value` - User's footprint in kg
- `globalAvg` - Global average (default: 4800)
- `sustainableTarget` - Target value (default: 2000)

**Returns:**
```typescript
{
  percentile: number,
  category: 'Excellent' | 'Very Good' | 'Good' | 'Average' | 'Needs Improvement',
  betterThan: number
}
```

---

#### `generateAdvancedRecommendations(input, result, history)`

AI-enhanced recommendations with context.

**Parameters:**
- `input` - User input
- `result` - Calculation result
- `history` - User's calculation history (optional)

**Returns:**
```typescript
Array<{
  category: string,
  title: string,
  description: string,
  actions: string[],
  impact: 'high' | 'medium' | 'low',
  difficulty: 'easy' | 'medium' | 'hard',
  savings: number
}>
```

---

### Security Utilities

#### `sanitizeNumber(value, min, max)`

Safely validates and bounds numeric input.

**Example:**
```javascript
import { sanitizeNumber } from './utils/security';

const userInput = '150abc';
const safe = sanitizeNumber(userInput, 0, 1000);
// safe = 150
```

---

#### `validateFootprintInput(input)`

Validates complete input structure.

**Returns:** `boolean`

---

### Export/Import

#### `exportData(history, goal)`

Exports user data as JSON file.

**Parameters:**
- `history` - Calculation history array
- `goal` - Current goal object (optional)

**Returns:** Downloads JSON file

---

#### `exportCSV(history)`

Exports history as CSV for spreadsheets.

**Parameters:**
- `history` - Calculation history array

**Returns:** Downloads CSV file

---

#### `importData(file)`

Imports data from JSON file.

**Parameters:**
- `file` - File object from input

**Returns:** `Promise<Object>`

**Example:**
```javascript
import { importData } from './utils/export';

const fileInput = document.getElementById('import');
fileInput.addEventListener('change', async (e) => {
  try {
    const data = await importData(e.target.files[0]);
    console.log(data.history);
  } catch (error) {
    console.error('Import failed:', error.message);
  }
});
```

---

## Emission Factors

### Transport
```javascript
CAR_FACTORS = {
  petrol: 0.170,  // kg CO₂e per km
  diesel: 0.171,
  hybrid: 0.120,
  electric: 0.047
}

PUBLIC_TRANSIT_PER_KM = 0.060    // kg CO₂e per km
FLIGHT_SHORT_PER_KM = 0.158      // kg CO₂e per km
FLIGHT_LONG_PER_KM = 0.150       // kg CO₂e per km
```

### Home Energy
```javascript
ELECTRICITY_PER_KWH = 0.450      // kg CO₂e per kWh
GAS_PER_KWH = 0.183              // kg CO₂e per kWh
```

### Diet (Annual)
```javascript
DIET_ANNUAL = {
  heavy_meat: 3300,     // kg CO₂e per year
  medium_meat: 2500,
  low_meat: 1900,
  pescatarian: 1700,
  vegetarian: 1500,
  vegan: 1050
}
```

### Consumption
```javascript
GOODS_PER_USD = 0.40             // kg CO₂e per USD
WASTE_PER_KG = 0.580             // kg CO₂e per kg waste
```

---

## Data Storage

### LocalStorage Keys

- `ecolens_device_id` - Anonymous device identifier
- `ecolens_history` - Calculation history (max 50 entries)
- `carbon_goal` - User's reduction goal

### Data Structure

**History Entry:**
```javascript
{
  id: "entry_1234567890123",
  created_at: "2026-06-20T12:00:00.000Z",
  device_id: "dev_abc123...",
  input: { /* user input */ },
  result: { /* calculation result */ }
}
```

**Goal:**
```javascript
{
  baseline: 5.2,           // tonnes CO₂e
  target: 2.0,             // tonnes CO₂e
  targetDate: "2027-12-31",
  createdAt: "2026-06-20T12:00:00.000Z",
  type: "sustainable"      // or "custom"
}
```

---

## Error Handling

All functions include comprehensive error handling:

```javascript
try {
  const result = calculateFootprint(input);
} catch (error) {
  console.error('Calculation failed:', error);
  // Fallback behavior
}
```

### Common Errors

- `Invalid input structure` - Input validation failed
- `Failed to parse JSON` - Import data corrupted
- `QuotaExceededError` - LocalStorage full
- `Invalid file type` - Wrong file format

---

## Performance Tips

### Memoization
```javascript
import { useMemo } from 'react';

const statistics = useMemo(() => 
  calculateStatistics(entries),
  [entries]
);
```

### Component Optimization
```javascript
import { memo } from 'react';

export const CarbonChart = memo(function CarbonChart({ data }) {
  // Component code
});
```

---

## Testing

### Run Tests
```bash
npm test                  # Watch mode
npm test -- --run         # Single run
npm run test:coverage     # Coverage report
```

### Example Test
```javascript
import { calculateFootprint } from './engine';

test('calculates transport emissions', () => {
  const input = {
    transport: { car_km_per_week: 100, car_fuel: 'petrol', /* ... */ },
    home: { /* ... */ },
    diet: 'vegan',
    consumption: { /* ... */ }
  };
  
  const result = calculateFootprint(input);
  expect(result.breakdown_kg.transport).toBe(884);
});
```

---

## Browser Support

- Chrome/Edge: 90+
- Firefox: 88+
- Safari: 14+
- Opera: 76+

### Required APIs
- LocalStorage
- crypto.randomUUID (with fallback)
- Clipboard API (with fallback)
- File API

---

## Security

### Input Validation
All inputs are validated and sanitized:
- Numeric bounds checking
- Enum whitelisting
- String length limits
- XSS prevention

### Storage Security
- Client-side only (no server transmission)
- Quota management
- Error handling
- Safe JSON parsing

---

## Accessibility

### WCAG 2.1 AA Compliance
- Keyboard navigation
- Screen reader support
- ARIA labels
- Focus management
- Contrast ratios

---

## License

MIT License - See LICENSE file for details

---

## Support

For questions or issues:
1. Check this documentation
2. Review SECURITY.md for security concerns
3. Open an issue on GitHub
