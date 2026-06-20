/**
 * EcoLens — API Client
 * Handles all communication with the Express backend
 */
import type { AuthResponse, UserSignup, UserLogin, CarbonEntry, FootprintInput, FootprintResult, Goal, Challenge, LeaderboardEntry, Report } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('ecolens_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) localStorage.setItem('ecolens_token', token);
    else localStorage.removeItem('ecolens_token');
  }

  getToken() { return this.token; }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json', ...options.headers as Record<string, string> };
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;
    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
  }

  // Auth
  async signup(data: UserSignup): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>('/auth/signup', { method: 'POST', body: JSON.stringify(data) });
    this.setToken(res.token);
    return res;
  }

  async login(data: UserLogin): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(data) });
    this.setToken(res.token);
    return res;
  }

  async getProfile() {
    return this.request<any>('/auth/me');
  }

  logout() { this.setToken(null); }

  // Entries
  async getEntries(limit = 50, offset = 0) {
    return this.request<{ entries: CarbonEntry[]; total: number }>(`/entries?limit=${limit}&offset=${offset}`);
  }

  async saveEntry(input: FootprintInput, result: FootprintResult) {
    return this.request<CarbonEntry>('/entries', { method: 'POST', body: JSON.stringify({ input, result }) });
  }

  async deleteEntry(id: string) {
    return this.request<{ success: boolean }>(`/entries/${id}`, { method: 'DELETE' });
  }

  // Goals
  async getGoals() { return this.request<{ goals: Goal[] }>('/goals'); }
  async createGoal(goal: Partial<Goal>) { return this.request<Goal>('/goals', { method: 'POST', body: JSON.stringify(goal) }); }
  async deleteGoal(id: string) { return this.request<{ success: boolean }>(`/goals/${id}`, { method: 'DELETE' }); }

  // Community
  async getLeaderboard() { return this.request<{ leaderboard: LeaderboardEntry[] }>('/community/leaderboard'); }
  async getChallenges() { return this.request<{ challenges: Challenge[] }>('/community/challenges'); }
  async joinChallenge(id: string) { return this.request<{ success: boolean }>(`/community/challenges/${id}/join`, { method: 'POST' }); }
  async getCommunityStats() { return this.request<any>('/community/stats'); }

  // Reports
  async getReports() { return this.request<{ reports: Report[] }>('/reports'); }
  async generateReport(period: string) { return this.request<any>('/reports/generate', { method: 'POST', body: JSON.stringify({ period }) }); }
  async getReport(id: string) { return this.request<any>(`/reports/${id}`); }

  // Health
  async health() { return this.request<any>('/health'); }
}

export const api = new ApiClient();
export default api;
