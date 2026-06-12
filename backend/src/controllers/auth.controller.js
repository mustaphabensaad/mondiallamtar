const bcrypt = require('bcryptjs');
const Joi    = require('joi');
const db     = require('../config/db');
const { signToken } = require('../utils/helpers');

// ─── Validation schemas ──────────────────────────────────────────────────────

const registerSchema = Joi.object({
  email:     Joi.string().email().required(),
  password:  Joi.string().min(6).required(),
  phone:     Joi.string().allow('').optional(),
  team_role: Joi.string().valid('captain', 'coach').default('captain'),
});

const loginSchema = Joi.object({
  email:    Joi.string().email().required(),
  password: Joi.string().required(),
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sanitizeUser(user) {
  const { password_hash, ...safe } = user;
  return safe;
}

// ─── Controllers ─────────────────────────────────────────────────────────────

async function register(req, res, next) {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password, phone, team_role } = value;

    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const password_hash = await bcrypt.hash(password, 12);
    const [result] = await db.query(
      'INSERT INTO users (email, password_hash, role, team_role, phone) VALUES (?, ?, "captain", ?, ?)',
      [email, password_hash, team_role, phone || null]
    );

    const userId = result.insertId;
    const token  = signToken({ id: userId, email, role: 'captain' });

    res.status(201).json({
      token,
      user: { id: userId, email, role: 'captain', team_role, phone: phone || null },
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password } = value;

    const [rows] = await db.query('SELECT * FROM users WHERE email = ? AND is_active = TRUE', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role });

    res.json({ token, user: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user: sanitizeUser(rows[0]) });
  } catch (err) {
    next(err);
  }
}

function logout(req, res) {
  // JWT is stateless — client drops the token
  res.json({ message: 'Logged out' });
}

module.exports = { register, login, me, logout };
