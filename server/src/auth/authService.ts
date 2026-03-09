import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { pool } from '../config/db';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret-change-me';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-me';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 7;
const SALT_ROUNDS = 12;
const INITIAL_BALANCE = 1000.00;

export interface UserPayload {
  id: number;
  username: string;
  email: string;
  role: string;
}

export async function registerUser(username: string, email: string, password: string) {
  // Check if user already exists
  const existing = await pool.query(
    'SELECT id FROM users WHERE email = $1 OR username = $2',
    [email, username]
  );

  if (existing.rows.length > 0) {
    throw new Error('Ya existe un usuario con ese email o nombre de usuario');
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // Create user
  const result = await pool.query(
    `INSERT INTO users (username, email, password_hash, balance)
     VALUES ($1, $2, $3, $4)
     RETURNING id, username, email, balance, total_wagered, vip_level, role`,
    [username, email, passwordHash, INITIAL_BALANCE]
  );

  const user = result.rows[0];

  // Generate tokens
  const tokens = await generateTokens(user);

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      balance: parseFloat(user.balance),
      totalWagered: parseFloat(user.total_wagered || '0'),
      vipLevel: user.vip_level || 'bronze',
      role: user.role || 'user',
    },
    ...tokens,
  };
}

export async function loginUser(email: string, password: string) {
  const result = await pool.query(
    'SELECT id, username, email, password_hash, balance, total_wagered, vip_level, role FROM users WHERE email = $1',
    [email]
  );

  if (result.rows.length === 0) {
    throw new Error('Email o contraseña inválidos');
  }

  const user = result.rows[0];

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    throw new Error('Email o contraseña inválidos');
  }

  const tokens = await generateTokens(user);

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      balance: parseFloat(user.balance),
      totalWagered: parseFloat(user.total_wagered || '0'),
      vipLevel: user.vip_level || 'bronze',
      role: user.role || 'user',
    },
    ...tokens,
  };
}

export async function refreshAccessToken(refreshToken: string) {
  // Verify refresh token
  let payload: UserPayload;
  try {
    payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as UserPayload;
  } catch {
    throw new Error('Token de actualización inválido');
  }

  // Check if token exists in DB
  const tokenResult = await pool.query(
    'SELECT id FROM refresh_tokens WHERE token = $1 AND user_id = $2 AND expires_at > NOW()',
    [refreshToken, payload.id]
  );

  if (tokenResult.rows.length === 0) {
    throw new Error('Token de actualización no encontrado o expirado');
  }

  // Delete old refresh token
  await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);

  // Get fresh user data
  const userResult = await pool.query(
    'SELECT id, username, email, balance, total_wagered, vip_level, role FROM users WHERE id = $1',
    [payload.id]
  );

  if (userResult.rows.length === 0) {
    throw new Error('Usuario no encontrado');
  }

  const user = userResult.rows[0];
  const tokens = await generateTokens(user);

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      balance: parseFloat(user.balance),
      totalWagered: parseFloat(user.total_wagered || '0'),
      vipLevel: user.vip_level || 'bronze',
      role: user.role || 'user',
    },
    ...tokens,
  };
}

export async function getUserById(userId: number) {
  const result = await pool.query(
    'SELECT id, username, email, balance, total_wagered, vip_level, role FROM users WHERE id = $1',
    [userId]
  );

  if (result.rows.length === 0) {
    throw new Error('Usuario no encontrado');
  }

  const user = result.rows[0];
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    balance: parseFloat(user.balance),
    totalWagered: parseFloat(user.total_wagered || '0'),
    vipLevel: user.vip_level || 'bronze',
    role: user.role || 'user',
  };
}

export function verifyAccessToken(token: string): UserPayload {
  return jwt.verify(token, JWT_SECRET) as UserPayload;
}

async function generateTokens(user: { id: number; username: string; email: string; role: string }) {
  const payload: UserPayload = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role || 'user',
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: `${REFRESH_TOKEN_EXPIRY_DAYS}d` });

  // Store refresh token in DB
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

  await pool.query(
    'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
    [user.id, refreshToken, expiresAt]
  );

  return { accessToken, refreshToken };
}
