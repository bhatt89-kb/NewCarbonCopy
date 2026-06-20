/**
 * EcoLens — Auth Middleware (ESM)
 */
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'ecolens_super_secret_jwt_key_change_in_production';

export function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

export function requireAuth(req, res, next) {
  const h = req.headers.authorization;
  if (!h || !h.startsWith('Bearer ')) return res.status(401).json({ error: 'Authentication required' });
  try { req.user = verifyToken(h.split(' ')[1]); next(); }
  catch { return res.status(401).json({ error: 'Invalid or expired token' }); }
}

export function optionalAuth(req, res, next) {
  const h = req.headers.authorization;
  if (h && h.startsWith('Bearer ')) {
    try { req.user = verifyToken(h.split(' ')[1]); } catch {}
  }
  next();
}
