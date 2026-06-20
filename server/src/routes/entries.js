/**
 * EcoLens — Entry Routes (ESM)
 */
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../database.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', requireAuth, (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const offset = parseInt(req.query.offset) || 0;
    const entries = db.prepare('SELECT * FROM carbon_entries WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?').all(req.user.id, limit, offset);
    const total = db.prepare('SELECT COUNT(*) as c FROM carbon_entries WHERE user_id = ?').get(req.user.id);
    res.json({ entries: entries.map(e => ({ id: e.id, user_id: e.user_id, created_at: e.created_at, input: JSON.parse(e.input_json), result: JSON.parse(e.result_json) })), total: total.c, limit, offset });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

router.post('/', requireAuth, (req, res) => {
  try {
    const { input, result } = req.body;
    if (!input || !result) return res.status(400).json({ error: 'Input and result required' });
    const id = 'entry_' + uuidv4().replace(/-/g, '').substring(0, 20);
    const now = new Date().toISOString();
    db.prepare('INSERT INTO carbon_entries (id,user_id,input_json,result_json,total_annual_kg,total_annual_tonnes,transport_kg,home_kg,diet_kg,consumption_kg,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)').run(id, req.user.id, JSON.stringify(input), JSON.stringify(result), result.total_annual_kg, result.total_annual_tonnes, result.breakdown_kg?.transport||0, result.breakdown_kg?.home||0, result.breakdown_kg?.diet||0, result.breakdown_kg?.consumption||0, now);
    updateAchievements(req.user.id);
    res.status(201).json({ id, user_id: req.user.id, created_at: now, input, result });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

router.delete('/:id', requireAuth, (req, res) => {
  try {
    const e = db.prepare('SELECT id FROM carbon_entries WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!e) return res.status(404).json({ error: 'Not found' });
    db.prepare('DELETE FROM carbon_entries WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
    res.json({ success: true });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

function updateAchievements(userId) {
  try {
    const entries = db.prepare('SELECT * FROM carbon_entries WHERE user_id = ? ORDER BY created_at ASC').all(userId);
    const n = entries.length;
    const checks = [
      { id: 'first_calculation', check: () => n >= 1 },
      { id: 'five_calculations', check: () => n >= 5 },
      { id: 'consistent_tracker', check: () => n >= 10 },
      { id: 'below_global', check: () => n > 0 && entries[n-1].total_annual_kg < 4800 },
      { id: 'sustainable', check: () => n > 0 && entries[n-1].total_annual_kg <= 2000 },
      { id: 'super_green', check: () => n > 0 && entries[n-1].total_annual_kg < 1500 },
      { id: 'reduction_10', check: () => n >= 2 && ((entries[0].total_annual_kg - entries[n-1].total_annual_kg) / entries[0].total_annual_kg * 100) >= 10 },
      { id: 'reduction_25', check: () => n >= 2 && ((entries[0].total_annual_kg - entries[n-1].total_annual_kg) / entries[0].total_annual_kg * 100) >= 25 },
    ];
    const ins = db.prepare('INSERT OR IGNORE INTO achievements (id,user_id,achievement_id,earned_at) VALUES (?,?,?,?)');
    for (const { id, check } of checks) {
      if (check()) ins.run('ach_' + uuidv4().replace(/-/g,'').substring(0,16), userId, id, new Date().toISOString());
    }
  } catch (err) { console.error('Achievement error:', err); }
}

export default router;
