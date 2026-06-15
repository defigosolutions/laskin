import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import pool from '../db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_ACCESS_SECRET || 'laskin_jwt_secret_token_key_2026';

// Memory store for CAPTCHAs (id -> { answer, expires })
const captchaStore = new Map();

// Periodic cleanup of expired CAPTCHAs
setInterval(() => {
  const now = Date.now();
  for (const [id, value] of captchaStore.entries()) {
    if (value.expires < now) {
      captchaStore.delete(id);
    }
  }
}, 60 * 1000);

// Rate limiter for login endpoint (max 5 requests per 10 minutes)
const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  message: { error: 'Too many login attempts. Please try again after 10 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Middleware to verify JWT token
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ error: 'Authentication token is missing.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token is invalid or expired.' });
    }
    req.user = user;
    next();
  });
}

// GET: Generate Math CAPTCHA
router.get('/captcha', (req, res) => {
  const num1 = Math.floor(Math.random() * 10) + 1; // 1 to 10
  const num2 = Math.floor(Math.random() * 10) + 1;
  const isAddition = Math.random() > 0.5;

  const question = isAddition ? `${num1} + ${num2} = ?` : `${num1} - ${num2} = ?`;
  const answer = isAddition ? num1 + num2 : num1 - num2;
  const captchaId = Math.random().toString(36).substring(2, 15);
  
  // Expire in 3 minutes
  captchaStore.set(captchaId, {
    answer,
    expires: Date.now() + 3 * 60 * 1000
  });

  res.json({ captchaId, question });
});

// POST: Login staff member
router.post('/login', loginLimiter, async (req, res) => {
  const { email, password, captchaId, captchaAnswer } = req.body;

  if (!email || !password || !captchaId || captchaAnswer === undefined) {
    return res.status(400).json({ error: 'All fields including CAPTCHA are required.' });
  }

  // 1. Verify CAPTCHA
  const storedCaptcha = captchaStore.get(captchaId);
  if (!storedCaptcha) {
    return res.status(400).json({ error: 'CAPTCHA has expired. Please refresh and try again.' });
  }

  captchaStore.delete(captchaId); // Use once

  if (storedCaptcha.expires < Date.now()) {
    return res.status(400).json({ error: 'CAPTCHA has expired. Please refresh.' });
  }

  if (parseInt(captchaAnswer) !== storedCaptcha.answer) {
    return res.status(400).json({ error: 'Incorrect CAPTCHA answer.' });
  }

  try {
    // 2. Fetch user from database
    const userRes = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    if (userRes.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = userRes.rows[0];

    if (!user.is_active) {
      return res.status(403).json({ error: 'Your account is deactivated. Contact administrator.' });
    }

    // 3. Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // 4. Sign JWT (Valid for 2 hours)
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.full_name, role: user.role },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.full_name,
        role: user.role
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login processing.' });
  }
});

// GET: Current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userRes = await pool.query('SELECT id, email, full_name, role, is_active FROM users WHERE id = $1', [req.user.id]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json({ user: userRes.rows[0] });
  } catch (err) {
    console.error('Fetch profile error:', err);
    res.status(500).json({ error: 'Server error fetching user profile.' });
  }
});

export default router;
