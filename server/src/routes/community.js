/**
 * EcoLens — Community Routes (ESM)
 */
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../database.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/leaderboard', optionalAuth, (req, res) => {
  try {
    const leaders = db.prepare(`SELECT u.username, u.id as user_id, e.total_annual_tonnes as footprint_tonnes FROM users u JOIN carbon_entries e ON e.user_id = u.id WHERE e.created_at = (SELECT MAX(e2.created_at) FROM carbon_entries e2 WHERE e2.user_id = u.id) ORDER BY e.total_annual_tonnes ASC LIMIT 20`).all();
    const badgeMap = { first_calculation:'🌱', five_calculations:'📊', below_global:'🌍', sustainable:'🌳', reduction_10:'📉', reduction_25:'💚', consistent_tracker:'📅', super_green:'🌟' };
    const leaderboard = leaders.map((l, i) => {
      const first = db.prepare('SELECT total_annual_tonnes FROM carbon_entries WHERE user_id = ? ORDER BY created_at ASC LIMIT 1').get(l.user_id);
      const reduction = first ? ((first.total_annual_tonnes - l.footprint_tonnes) / first.total_annual_tonnes * 100) : 0;
      const achs = db.prepare('SELECT achievement_id FROM achievements WHERE user_id = ?').all(l.user_id);
      return { rank: i+1, username: l.username, footprint_tonnes: Math.round(l.footprint_tonnes*100)/100, reduction_percent: Math.round(reduction*10)/10, badges: achs.map(a=>badgeMap[a.achievement_id]||'🏅').slice(0,5), is_you: req.user?.id === l.user_id };
    });
    res.json({ leaderboard });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

router.get('/challenges', optionalAuth, (req, res) => {
  try {
    const challenges = db.prepare('SELECT c.*, (SELECT COUNT(*) FROM challenge_participants WHERE challenge_id = c.id) as participants FROM challenges c ORDER BY c.start_date DESC').all();
    const result = challenges.map(c => {
      let joined = false, progress = 0;
      if (req.user) { const p = db.prepare('SELECT * FROM challenge_participants WHERE challenge_id = ? AND user_id = ?').get(c.id, req.user.id); if (p) { joined = true; progress = p.progress; } }
      return { ...c, joined, progress };
    });
    res.json({ challenges: result });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

router.post('/challenges/:id/join', requireAuth, (req, res) => {
  try {
    const ch = db.prepare('SELECT * FROM challenges WHERE id = ?').get(req.params.id);
    if (!ch) return res.status(404).json({ error: 'Not found' });
    const existing = db.prepare('SELECT * FROM challenge_participants WHERE challenge_id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (existing) return res.status(409).json({ error: 'Already joined' });
    db.prepare('INSERT INTO challenge_participants (id,challenge_id,user_id,joined_at) VALUES (?,?,?,?)').run('cp_'+uuidv4().replace(/-/g,'').substring(0,16), req.params.id, req.user.id, new Date().toISOString());
    res.status(201).json({ success: true });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

router.get('/stats', (req, res) => {
  try {
    const u = db.prepare('SELECT COUNT(*) as c FROM users').get();
    const e = db.prepare('SELECT COUNT(*) as c FROM carbon_entries').get();
    const a = db.prepare('SELECT AVG(total_annual_tonnes) as v FROM carbon_entries').get();
    res.json({ total_users: u.c, total_calculations: e.c, average_footprint: Math.round((a.v||0)*100)/100 });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

export default router;
