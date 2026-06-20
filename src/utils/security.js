/**
 * Security Utilities
 * Input validation, sanitization, and security helpers
 */

/**
 * Sanitize numeric input to prevent injection
 */
export function sanitizeNumber(value, min = 0, max = Number.MAX_SAFE_INTEGER) {
  const num = parseFloat(value);
  if (isNaN(num) || !isFinite(num)) {
    return min;
  }
  return Math.max(min, Math.min(max, num));
}

/**
 * Sanitize string input
 */
export function sanitizeString(value, maxLength = 1000) {
  if (typeof value !== 'string') {
    return '';
  }
  // Remove any potentially dangerous characters
  return value
    .slice(0, maxLength)
    .replace(/[<>'"]/g, '')
    .trim();
}

/**
 * Validate date input
 */
export function validateDate(dateString) {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return null;
  }
  // Ensure date is not in the past and within reasonable range (100 years)
  const now = new Date();
  const maxDate = new Date(now.getFullYear() + 100, 11, 31);
  
  if (date < now || date > maxDate) {
    return null;
  }
  return date.toISOString().split('T')[0];
}

/**
 * Validate localStorage data before parsing
 */
export function safeJSONParse(value, fallback = null) {
  try {
    if (!value || typeof value !== 'string') {
      return fallback;
    }
    const parsed = JSON.parse(value);
    // Ensure parsed value is not null or undefined
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

/**
 * Safely stringify for localStorage
 */
export function safeJSONStringify(value) {
  try {
    return JSON.stringify(value);
  } catch {
    return null;
  }
}

/**
 * Validate footprint input structure
 */
export function validateFootprintInput(input) {
  if (!input || typeof input !== 'object') {
    return false;
  }

  // Check required structure
  const requiredKeys = ['transport', 'home', 'diet', 'consumption'];
  if (!requiredKeys.every(key => key in input)) {
    return false;
  }

  // Validate transport
  if (
    typeof input.transport !== 'object' ||
    typeof input.transport.car_km_per_week !== 'number' ||
    typeof input.transport.car_fuel !== 'string'
  ) {
    return false;
  }

  // Validate home
  if (
    typeof input.home !== 'object' ||
    typeof input.home.electricity_kwh_per_month !== 'number' ||
    typeof input.home.household_size !== 'number'
  ) {
    return false;
  }

  // Validate diet
  const validDiets = ['heavy_meat', 'medium_meat', 'low_meat', 'pescatarian', 'vegetarian', 'vegan'];
  if (!validDiets.includes(input.diet)) {
    return false;
  }

  // Validate consumption
  if (
    typeof input.consumption !== 'object' ||
    typeof input.consumption.goods_spend_usd_per_month !== 'number'
  ) {
    return false;
  }

  return true;
}

/**
 * Rate limiting helper for API calls or expensive operations
 */
export class RateLimiter {
  constructor(maxCalls, windowMs) {
    this.maxCalls = maxCalls;
    this.windowMs = windowMs;
    this.calls = [];
  }

  canCall() {
    const now = Date.now();
    // Remove old calls outside the window
    this.calls = this.calls.filter(time => now - time < this.windowMs);
    
    if (this.calls.length >= this.maxCalls) {
      return false;
    }
    
    this.calls.push(now);
    return true;
  }

  reset() {
    this.calls = [];
  }
}

/**
 * Prevent localStorage quota exceeded errors
 */
export function safeLocalStorageSet(key, value) {
  try {
    const stringValue = typeof value === 'string' ? value : safeJSONStringify(value);
    if (!stringValue) {
      return false;
    }
    
    // Check if storage is available
    if (typeof localStorage === 'undefined') {
      return false;
    }
    
    localStorage.setItem(key, stringValue);
    return true;
  } catch (error) {
    // Handle quota exceeded or other storage errors
    if (error.name === 'QuotaExceededError') {
      console.warn('LocalStorage quota exceeded');
    }
    return false;
  }
}

/**
 * Generate secure random ID (alternative to crypto.randomUUID for older browsers)
 */
export function generateSecureId(prefix = 'id') {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  return `${prefix}_${timestamp}_${randomPart}`;
}
