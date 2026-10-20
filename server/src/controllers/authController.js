// src/controllers/authController.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';

function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN ?? '7d' },
  );
}

function toPublicUser(user) {
  return { id: user.id, email: user.email, fullName: user.full_name, role: user.role };
}

export async function register(req, res) {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({ error: 'fullName, email et password sont obligatoires' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 8 caractères' });
  }

  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    return res.status(409).json({ error: 'Cet email est déjà utilisé' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `INSERT INTO users (email, password_hash, full_name, role)
     VALUES ($1, $2, $3, 'analyst')
     RETURNING id, email, full_name, role`,
    [email, passwordHash, fullName],
  );

  const user = result.rows[0];
  res.status(201).json({ token: signToken(user), user: toPublicUser(user) });
}

export async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'email et password sont obligatoires' });
  }

  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = result.rows[0];
  if (!user) {
    return res.status(401).json({ error: 'Identifiants invalides' });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Identifiants invalides' });
  }

  res.json({ token: signToken(user), user: toPublicUser(user) });
}

export async function me(req, res) {
  const result = await pool.query('SELECT id, email, full_name, role FROM users WHERE id = $1', [req.user.id]);
  const user = result.rows[0];
  if (!user) {
    return res.status(404).json({ error: 'Utilisateur introuvable' });
  }
  res.json(toPublicUser(user));
}
