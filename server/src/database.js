/**
 * EcoLens Backend — Database Layer (SQLite, ESM)
 */
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = process.env.DB_PATH || path.join(DB_DIR, 'ecolens.db');

if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, username TEXT UNIQUE NOT NULL, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, avatar_url TEXT DEFAULT '', created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now')));
  CREATE TABLE IF NOT EXISTS carbon_entries (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, input_json TEXT NOT NULL, result_json TEXT NOT NULL, total_annual_kg REAL NOT NULL, total_annual_tonnes REAL NOT NULL, transport_kg REAL DEFAULT 0, home_kg REAL DEFAULT 0, diet_kg REAL DEFAULT 0, consumption_kg REAL DEFAULT 0, created_at TEXT DEFAULT (datetime('now')), FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE);
  CREATE TABLE IF NOT EXISTS goals (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, baseline REAL NOT NULL, target REAL NOT NULL, target_date TEXT, type TEXT DEFAULT 'sustainable', achieved INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now')), FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE);
  CREATE TABLE IF NOT EXISTS achievements (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, achievement_id TEXT NOT NULL, earned_at TEXT DEFAULT (datetime('now')), FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE, UNIQUE(user_id, achievement_id));
  CREATE TABLE IF NOT EXISTS challenges (id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL, duration_days INTEGER NOT NULL, category TEXT NOT NULL, icon TEXT DEFAULT '🌱', target_reduction_kg REAL DEFAULT 0, start_date TEXT NOT NULL, end_date TEXT NOT NULL, created_at TEXT DEFAULT (datetime('now')));
  CREATE TABLE IF NOT EXISTS challenge_participants (id TEXT PRIMARY KEY, challenge_id TEXT NOT NULL, user_id TEXT NOT NULL, joined_at TEXT DEFAULT (datetime('now')), progress REAL DEFAULT 0, completed INTEGER DEFAULT 0, FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE, UNIQUE(challenge_id, user_id));
  CREATE TABLE IF NOT EXISTS reports (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, title TEXT NOT NULL, period TEXT NOT NULL, report_data TEXT NOT NULL, generated_at TEXT DEFAULT (datetime('now')), FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE);
  CREATE INDEX IF NOT EXISTS idx_entries_user ON carbon_entries(user_id);
  CREATE INDEX IF NOT EXISTS idx_entries_created ON carbon_entries(created_at);
  CREATE INDEX IF NOT EXISTS idx_goals_user ON goals(user_id);
  CREATE INDEX IF NOT EXISTS idx_achievements_user ON achievements(user_id);
  CREATE INDEX IF NOT EXISTS idx_challenge_parts ON challenge_participants(challenge_id, user_id);
`);

// Seed challenges
const challengeCount = db.prepare('SELECT COUNT(*) as count FROM challenges').get();
if (challengeCount.count === 0) {
  const ins = db.prepare('INSERT INTO challenges (id, title, description, duration_days, category, icon, target_reduction_kg, start_date, end_date) VALUES (?,?,?,?,?,?,?,?,?)');
  const now = new Date();
  const w = new Date(now.getTime() + 7*86400000);
  const m = new Date(now.getTime() + 30*86400000);
  const q = new Date(now.getTime() + 90*86400000);
  const challenges = [
    ['ch_7day_green','7-Day Green Challenge','Go car-free for a week.',7,'transport','🚲',25,now.toISOString(),w.toISOString()],
    ['ch_meatless_month','Meatless Month','Try vegetarian diet for 30 days.',30,'diet','🥬',150,now.toISOString(),m.toISOString()],
    ['ch_energy_saver','Energy Saver Sprint','Reduce electricity by 20% this month.',30,'home','💡',100,now.toISOString(),m.toISOString()],
    ['ch_zero_waste','Zero Waste Week','Minimize landfill waste to under 1kg.',7,'consumption','♻️',15,now.toISOString(),w.toISOString()],
    ['ch_carbon_30','30-Day Carbon Reduction','Reduce footprint by 10% in 30 days.',30,'all','🌍',200,now.toISOString(),m.toISOString()],
    ['ch_flight_free','Flight-Free Quarter','Avoid air travel for 90 days.',90,'transport','✈️',500,now.toISOString(),q.toISOString()],
  ];
  const insertMany = db.transaction((rows) => { for (const r of rows) ins.run(...r); });
  insertMany(challenges);
}

export default db;
