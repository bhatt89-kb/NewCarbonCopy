/**
 * EcoLens — Reports Routes (ESM)
 */
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../database.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', requireAuth, (req, res) => {
  try { res.json({ reports: db.prepare('SELECT id,user_id,title,period,generated_at FROM reports WHERE user_id = ? ORDER BY generated_at DESC').all(req.user.id) }); }
  catch (err) { res.status(500).json({ error: 'Internal server error' }); }
});

router.post('/generate', requireAuth, (req, res) => {
  try {
    const { period } = req.body;
    const entries = db.prepare('SELECT * FROM carbon_entries WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
    if (entries.length === 0) return res.status(400).json({ error: 'No entries' });
    const goals = db.prepare('SELECT * FROM goals WHERE user_id = ?').all(req.user.id);
    const achievements = db.prepare('SELECT * FROM achievements WHERE user_id = ?').all(req.user.id);
    const latest = JSON.parse(entries[0].result_json);
    const first = entries.length > 1 ? JSON.parse(entries[entries.length-1].result_json) : latest;
    const reduction = ((first.total_annual_tonnes - latest.total_annual_tonnes) / first.total_annual_tonnes * 100);
    const reportData = { total_entries: entries.length, latest_footprint: latest.total_annual_tonnes, baseline_footprint: first.total_annual_tonnes, reduction_percent: Math.round(reduction*10)/10, breakdown: latest.breakdown_kg, goals_achieved: goals.filter(g=>g.achieved).length, total_goals: goals.length, achievements_earned: achievements.length };
    const id = 'rpt_' + uuidv4().replace(/-/g,'').substring(0,16);
    const title = `Carbon Report — ${period||'All Time'}`;
    db.prepare('INSERT INTO reports (id,user_id,title,period,report_data,generated_at) VALUES (?,?,?,?,?,?)').run(id, req.user.id, title, period||'all', JSON.stringify(reportData), new Date().toISOString());
    res.status(201).json({ id, title, period: period||'all', data: reportData });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

router.get('/:id', requireAuth, (req, res) => {
  try {
    const r = db.prepare('SELECT * FROM reports WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!r) return res.status(404).json({ error: 'Not found' });
    res.json({ ...r, report_data: JSON.parse(r.report_data) });
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
});

export default router;
