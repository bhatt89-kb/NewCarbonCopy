/**
 * Shared TypeScript Types — EcoLens Platform
 * Used by both client and server
 */

// ──────────────────────────── Auth ────────────────────────────
export interface UserSignup {
  username: string;
  email: string;
  password: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  created_at: string;
  total_entries: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// ──────────────────────────── Carbon ────────────────────────────
export interface TransportInput {
  car_km_per_week: number;
  car_fuel: 'petrol' | 'diesel' | 'hybrid' | 'electric';
  public_transit_km_per_week: number;
  short_haul_flights_per_year: number;
  long_haul_flights_per_year: number;
}

export interface HomeInput {
  electricity_kwh_per_month: number;
  natural_gas_kwh_per_month: number;
  household_size: number;
}

export interface ConsumptionInput {
  goods_spend_usd_per_month: number;
  waste_kg_per_week: number;
}

export type DietType = 'heavy_meat' | 'medium_meat' | 'low_meat' | 'pescatarian' | 'vegetarian' | 'vegan';

export interface FootprintInput {
  transport: TransportInput;
  home: HomeInput;
  diet: DietType;
  consumption: ConsumptionInput;
}

export interface BreakdownKg {
  transport: number;
  home: number;
  diet: number;
  consumption: number;
}

export interface Comparison {
  global_average_annual_kg: number;
  sustainable_target_annual_kg: number;
  ratio_to_global_average: number;
  ratio_to_sustainable_target: number;
}

export interface FootprintResult {
  breakdown_kg: BreakdownKg;
  total_annual_kg: number;
  total_annual_tonnes: number;
  comparison: Comparison;
}

export interface CarbonEntry {
  id: string;
  user_id?: string;
  created_at: string;
  device_id?: string;
  input: FootprintInput;
  result: FootprintResult;
}

// ──────────────────────────── Goals ────────────────────────────
export interface Goal {
  id?: string;
  user_id?: string;
  baseline: number;
  target: number;
  target_date: string | null;
  created_at: string;
  type: 'sustainable' | 'custom';
  achieved?: boolean;
}

// ──────────────────────────── Achievements ────────────────────────────
export interface Achievement {
  id: string;
  icon: string;
  title: string;
  description: string;
  earned: boolean;
  earned_at?: string;
}

// ──────────────────────────── Insights ────────────────────────────
export interface Recommendation {
  category: string;
  action: string;
  estimated_annual_savings_kg: number;
}

export interface AdvancedRecommendation {
  category: string;
  title: string;
  description: string;
  actions: string[];
  impact: 'high' | 'medium' | 'low';
  difficulty: 'easy' | 'medium' | 'hard';
  savings: number;
}

export interface Insights {
  summary: string;
  recommendations: Recommendation[];
  source: 'rules' | 'ai';
}

// ──────────────────────────── Community ────────────────────────────
export interface LeaderboardEntry {
  rank: number;
  username: string;
  footprint_tonnes: number;
  reduction_percent: number;
  badges: string[];
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  duration_days: number;
  category: string;
  icon: string;
  participants: number;
  target_reduction_kg: number;
  start_date: string;
  end_date: string;
  joined?: boolean;
  progress?: number;
}

export interface ChallengeParticipation {
  challenge_id: string;
  user_id: string;
  joined_at: string;
  progress: number;
  completed: boolean;
}

// ──────────────────────────── Reports ────────────────────────────
export interface Report {
  id: string;
  user_id: string;
  title: string;
  period: string;
  generated_at: string;
  total_footprint: number;
  reduction_from_baseline: number;
  goals_achieved: number;
  download_url?: string;
}

// ──────────────────────────── Offset Marketplace ────────────────────────────
export interface OffsetProject {
  id: string;
  title: string;
  description: string;
  category: 'trees' | 'renewable' | 'community' | 'conservation';
  icon: string;
  impact_per_unit: string;
  cost_estimate: string;
  link: string;
  provider: string;
  verified: boolean;
}

// ──────────────────────────── Analytics ────────────────────────────
export interface TrendData {
  slope: number;
  direction: 'increasing' | 'decreasing' | 'stable';
  prediction: number | null;
  changePerPeriod: number;
}

export interface Statistics {
  min: number;
  max: number;
  average: number;
  latest: number;
  oldest: number;
  totalChange: number;
  percentChange: string;
  totalCalculations: number;
  daysTracking: number;
  trend: TrendData;
}

export interface PercentileInfo {
  percentile: number;
  category: string;
  betterThan: number;
}
