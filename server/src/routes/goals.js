/**
 * EcoLens — Goals Routes (ESM)
 */
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../database.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', requireAuth, (req, res) => {
  try {
    res.json({ goals: db.prepare('SELECT * FROM goals WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id) });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

router.post('/', requireAuth, (req, res) => {
  try {
    const { baseline, target, target_date, type } = req.body;
    if (!baseline || !target) return res.status(400).json({ error: 'Baseline and target required' });
    const id = 'goal_' + uuidv4().replace(/-/g,'').substring(0,16);
    const now = new Date().toISOString();
    db.prepare('INSERT INTO goals (id,user_id,baseline,target,target_date,type,created_at) VALUES (?,?,?,?,?,?,?)').run(id, req.user.id, baseline, target, target_date||null, type||'sustainable', now);
    res.status(201).json({ id, baseline, target, target_date, type, created_at: now });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

router.put('/:id', requireAuth, (req, res) => {
  try {
    const g = db.prepare('SELECT * FROM goals WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!g) return res.status(404).json({ error: 'Not found' });
    db.prepare('UPDATE goals SET achieved = ? WHERE id = ?').run(req.body.achieved ? 1 : 0, req.params.id);
    res.json({ ...g, achieved: !!req.body.achieved });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

router.delete('/:id', requireAuth, (req, res) => {
  try {
    db.prepare('DELETE FROM goals WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
    res.json({ success: true });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

export default router;
