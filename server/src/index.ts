import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import { authRouter } from './auth/authController';
import { initGameEngine } from './game/gameEngine';
import { leaderboardRouter } from './game/leaderboard';
import { affiliateRouter } from './game/affiliates';
import { tournamentRouter } from './game/tournaments';
import { adminRouter } from './admin/adminController';
import { getBetLimits, refreshBetLimitsCache } from './admin/settingsService';
import { apiLimiter } from './middleware/rateLimiter';
import { logger } from './config/logger';
import { pool } from './config/db';

const app = express();
const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));
app.use('/api', apiLimiter);

// Routes
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRouter);
app.use('/api/leaderboard', leaderboardRouter);
app.use('/api/affiliate', affiliateRouter);
app.use('/api/tournaments', tournamentRouter);
app.use('/api/admin', adminRouter);

// Public endpoint for bet limits
app.get('/api/settings/bet-limits', async (_req, res) => {
  try {
    const limits = await getBetLimits();
    res.json(limits);
  } catch {
    res.status(500).json({ error: 'Error al obtener los límites de apuesta' });
  }
});

// Game history endpoint (public - for provably fair verification)
app.get('/api/games/history', async (req, res) => {
  const userId = req.query.userId ? parseInt(req.query.userId as string) : null;

  try {
    let result;
    if (userId) {
      result = await pool.query(
        `SELECT id, user_id, server_seed, hashed_server_seed, client_seed, nonce,
                difficulty, car_positions, bet_amount, current_lane, final_multiplier,
                profit, status, started_at, ended_at
         FROM games WHERE user_id = $1 AND status != 'active'
         ORDER BY id DESC LIMIT 50`,
        [userId]
      );
    } else {
      result = await pool.query(
        `SELECT id, user_id, server_seed, hashed_server_seed, client_seed, nonce,
                difficulty, car_positions, bet_amount, current_lane, final_multiplier,
                profit, status, started_at, ended_at
         FROM games WHERE status != 'active'
         ORDER BY id DESC LIMIT 50`
      );
    }
    res.json({ games: result.rows });
  } catch (error: any) {
    res.status(500).json({ error: 'Error al obtener el historial' });
  }
});

// DEV: Reset balance endpoint
import { authMiddleware } from './middleware/authMiddleware';
app.post('/api/dev/reset-balance', authMiddleware, async (req, res) => {
  const userId = (req as any).userId;
  try {
    const result = await pool.query(
      'UPDATE users SET balance = 1000.00 WHERE id = $1 RETURNING balance',
      [userId]
    );
    res.json({ balance: parseFloat(result.rows[0].balance) });
  } catch {
    res.status(500).json({ error: 'Error al reiniciar el saldo' });
  }
});

// Export for other modules
export { io, server };

// Start server
const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  logger.info({ port: PORT }, 'Server running');

  // Initialize the game engine after server starts
  initGameEngine(io);
  logger.info('Game engine initialized');

  // Warm bet limits cache
  refreshBetLimitsCache().then(() => {
    logger.info('Bet limits cache warmed');
  }).catch((err) => {
    logger.error({ err }, 'Failed to warm bet limits cache');
  });
});

// Graceful shutdown
function shutdown(signal: string) {
  logger.info({ signal }, 'Shutting down gracefully...');
  server.close(() => {
    logger.info('HTTP server closed');
    io.close(() => {
      logger.info('Socket.io closed');
      process.exit(0);
    });
  });
  // Force exit after 10 seconds
  setTimeout(() => process.exit(1), 10000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
