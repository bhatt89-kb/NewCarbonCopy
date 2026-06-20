/**
 * EcoLens — Auth Routes (ESM)
 */
import express from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import db from '../database.js';
import { generateToken, requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ error: 'All fields required' });
    if (username.length < 3) return res.status(400).json({ error: 'Username must be 3+ characters' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be 6+ characters' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Invalid email' });

    const existing = db.prepare('SELECT id FROM users WHERE email = ? OR username = ?').get(email, username);
    if (existing) return res.status(409).json({ error: 'Email or username already taken' });

    const hash = await bcrypt.hash(password, 12);
    const id = 'usr_' + uuidv4().replace(/-/g, '').substring(0, 20);
    const now = new Date().toISOString();
    db.prepare('INSERT INTO users (id,username,email,password_hash,created_at,updated_at) VALUES (?,?,?,?,?,?)').run(id, username, email.toLowerCase(), hash, now, now);

    const user = { id, username, email: email.toLowerCase(), created_at: now, total_entries: 0 };
    res.status(201).json({ token: generateToken(user), user });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
    if (!row || !(await bcrypt.compare(password, row.password_hash))) return res.status(401).json({ error: 'Invalid credentials' });

    const count = db.prepare('SELECT COUNT(*) as c FROM carbon_entries WHERE user_id = ?').get(row.id);
    const user = { id: row.id, username: row.username, email: row.email, avatar_url: row.avatar_url, created_at: row.created_at, total_entries: count.c };
    res.json({ token: generateToken(user), user });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

router.get('/me', requireAuth, (req, res) => {
  try {
    const row = db.prepare('SELECT id,username,email,avatar_url,created_at FROM users WHERE id = ?').get(req.user.id);
    if (!row) return res.status(404).json({ error: 'User not found' });
    const entries = db.prepare('SELECT COUNT(*) as c FROM carbon_entries WHERE user_id = ?').get(row.id);
    res.json({ ...row, total_entries: entries.c });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

export default router;
