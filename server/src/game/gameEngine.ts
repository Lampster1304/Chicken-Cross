import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyAccessToken } from '../auth/authService';
import {
  generateServerSeed,
  hashServerSeed,
  isLaneDangerous,
  isSafeZone,
  getLaneMultiplier,
  getCumulativeMultiplier,
  getNextMultiplier,
} from './provablyFair';
import { deductBetAmount, resolveBetWin, resolveBetLoss } from './betManager';
import { MAX_WIN_CAP } from './constants';
import { pool } from '../config/db';
import { logger } from '../config/logger';
import { gameStartSchema, chatSchema } from '../middleware/validate';

const CHAT_COOLDOWN = 3000;

interface RevealedLane {
  lane: number;
  hasCar: boolean;
  isSafeZone: boolean;
}

interface PlayerSession {
  gameId: number;
  userId: number;
  username: string;
  difficulty: number;
  betAmount: number;
  currentLane: number;
  riskyLanesCrossed: number;
  currentMultiplier: number;
  serverSeed: string;
  hashedServerSeed: string;
  clientSeed: string;
  nonce: number;
  revealedLanes: RevealedLane[];
  autoCashOutAt: number | null;
  status: 'active' | 'cashed_out' | 'hit';
  processing: boolean;
}

// Active sessions in memory (backed by DB)
const activeSessions = new Map<number, PlayerSession>();

// Connected sockets mapped by userId
const userSockets = new Map<number, Socket>();

// Chat cooldown tracking
const chatCooldowns = new Map<number, number>();
let chatMessageId = 0;

// Nonce tracking per user
const userNonces = new Map<number, number>();

async function getUserNonce(userId: number): Promise<number> {
  if (userNonces.has(userId)) {
    return userNonces.get(userId)!;
  }
  const result = await pool.query(
    'SELECT COUNT(*) as count FROM games WHERE user_id = $1',
    [userId]
  );
  const nonce = parseInt(result.rows[0].count) || 0;
  userNonces.set(userId, nonce);
  return nonce;
}

export function initGameEngine(io: SocketIOServer) {
  // Socket.io authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const payload = verifyAccessToken(token);
      (socket as any).userId = payload.id;
      (socket as any).username = payload.username;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  // Handle connections
  io.on('connection', (socket) => {
    const userId = (socket as any).userId as number;
    const username = (socket as any).username as string;

    logger.info({ userId, username }, 'Player connected');
    userSockets.set(userId, socket);

    // Send current state on connect (reconnect support)
    const activeGame = activeSessions.get(userId);
    socket.emit('game:state', {
      activeGame: activeGame
        ? {
            gameId: activeGame.gameId,
            difficulty: activeGame.difficulty,
            currentLane: activeGame.currentLane,
            riskyLanesCrossed: activeGame.riskyLanesCrossed,
            currentMultiplier: activeGame.currentMultiplier,
            nextMultiplier: getNextMultiplier(
              activeGame.difficulty,
              activeGame.currentLane,
              activeGame.riskyLanesCrossed
            ),
            hashedServerSeed: activeGame.hashedServerSeed,
            betAmount: activeGame.betAmount,
            laneMultiplier: getLaneMultiplier(activeGame.difficulty),
            status: activeGame.status,
            revealedLanes: activeGame.revealedLanes,
            autoCashOutAt: activeGame.autoCashOutAt,
          }
        : null,
    });

    // Handle game start
    socket.on('game:start', async (data: { amount: number; difficulty: number; autoCashOutAt?: number }) => {
      const parsed = gameStartSchema.safeParse(data);
      if (!parsed.success) {
        const issues = parsed.error.issues || [];
        socket.emit('game:error', { error: issues[0]?.message || 'Invalid input' });
        return;
      }

      if (activeSessions.has(userId)) {
        socket.emit('game:error', { error: 'You already have an active game' });
        return;
      }

      const { amount, difficulty } = parsed.data;
      let autoCashOutAt = parsed.data.autoCashOutAt ?? null;

      // Clamp auto-cashout so payout never exceeds MAX_WIN_CAP
      if (autoCashOutAt !== null && autoCashOutAt * amount > MAX_WIN_CAP) {
        autoCashOutAt = Math.floor((MAX_WIN_CAP / amount) * 100) / 100;
      }

      try {
        const newBalance = await deductBetAmount(userId, amount);

        const serverSeed = generateServerSeed();
        const hashedServerSeed = hashServerSeed(serverSeed);
        const nonce = await getUserNonce(userId);
        const clientSeed = 'chicken-cross-default';

        // Create game record (car_positions = empty, determined per-lane)
        const gameResult = await pool.query(
          `INSERT INTO games (user_id, server_seed, hashed_server_seed, client_seed, nonce, difficulty, car_positions, bet_amount, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active')
           RETURNING id`,
          [userId, serverSeed, hashedServerSeed, clientSeed, nonce, difficulty, '{}', amount]
        );

        const gameId = gameResult.rows[0].id;
        userNonces.set(userId, nonce + 1);

        const session: PlayerSession = {
          gameId,
          userId,
          username,
          difficulty,
          betAmount: amount,
          currentLane: 0,
          riskyLanesCrossed: 0,
          currentMultiplier: 1.0,
          serverSeed,
          hashedServerSeed,
          clientSeed,
          nonce,
          revealedLanes: [],
          autoCashOutAt,
          status: 'active',
          processing: false,
        };

        activeSessions.set(userId, session);

        const nextMult = getNextMultiplier(difficulty, 0, 0);

        socket.emit('game:started', {
          gameId,
          difficulty,
          nextMultiplier: nextMult,
          hashedServerSeed,
          betAmount: amount,
          balance: newBalance,
          laneMultiplier: getLaneMultiplier(difficulty),
          autoCashOutAt,
        });

        logger.info({ userId, gameId, difficulty, amount }, 'Game started');
      } catch (error: any) {
        socket.emit('game:error', { error: error.message });
      }
    });

    // Handle lane crossing
    socket.on('game:cross', async () => {
      const session = activeSessions.get(userId);
      if (!session || session.status !== 'active') {
        socket.emit('game:error', { error: 'No active game' });
        return;
      }

      // Prevent concurrent processing
      if (session.processing) {
        // Don't silently drop - tell client to retry
        socket.emit('game:error', { error: 'Processing previous action' });
        return;
      }
      session.processing = true;

      try {

      const nextLane = session.currentLane + 1;
      const safeZone = isSafeZone(nextLane);

      if (safeZone) {
        // Safe zone - always safe, no multiplier change
        session.currentLane = nextLane;
        session.revealedLanes.push({ lane: nextLane, hasCar: false, isSafeZone: true });

        await pool.query(
          'UPDATE games SET current_lane = $1 WHERE id = $2',
          [nextLane, session.gameId]
        );

        const nextMult = getNextMultiplier(
          session.difficulty,
          nextLane,
          session.riskyLanesCrossed
        );

        socket.emit('game:crossed', {
          lane: nextLane,
          safe: true,
          isSafeZone: true,
          multiplier: session.currentMultiplier,
          nextMultiplier: nextMult,
          revealedLane: { lane: nextLane, hasCar: false, isSafeZone: true },
        });

        return;
      }

      // Risky lane - check if it has a car
      const hasCar = isLaneDangerous(
        session.serverSeed,
        session.clientSeed,
        session.nonce,
        nextLane,
        session.difficulty
      );

      if (hasCar) {
        // Player hit a car!
        session.status = 'hit';
        session.currentLane = nextLane;
        session.revealedLanes.push({ lane: nextLane, hasCar: true, isSafeZone: false });

        await resolveBetLoss(session.gameId, nextLane);

        socket.emit('game:crossed', {
          lane: nextLane,
          safe: false,
          isSafeZone: false,
          multiplier: 0,
          nextMultiplier: null,
          revealedLane: { lane: nextLane, hasCar: true, isSafeZone: false },
        });

        socket.emit('game:over', {
          result: 'hit',
          multiplier: 0,
          profit: -session.betAmount,
          balance: await getUserBalance(userId),
          serverSeed: session.serverSeed,
          revealedLanes: session.revealedLanes,
        });

        io.emit('feed:hit', {
          username: session.username,
          difficulty: session.difficulty,
          lane: nextLane,
        });

        activeSessions.delete(userId);
        logger.info({ userId, gameId: session.gameId, lane: nextLane }, 'Player hit a car');
      } else {
        // Safe crossing on risky lane
        session.currentLane = nextLane;
        session.riskyLanesCrossed++;
        const newMultiplier = getCumulativeMultiplier(session.difficulty, session.riskyLanesCrossed);
        session.currentMultiplier = newMultiplier;
        session.revealedLanes.push({ lane: nextLane, hasCar: false, isSafeZone: false });

        await pool.query(
          'UPDATE games SET current_lane = $1 WHERE id = $2',
          [nextLane, session.gameId]
        );

        // Check auto cash-out
        if (session.autoCashOutAt && newMultiplier >= session.autoCashOutAt) {
          const cappedMultiplier = Math.min(newMultiplier, MAX_WIN_CAP / session.betAmount);
          const balance = await resolveBetWin(userId, session.gameId, session.betAmount, cappedMultiplier);
          const payout = Math.floor(session.betAmount * cappedMultiplier * 100) / 100;
          const profit = payout - session.betAmount;

          session.status = 'cashed_out';

          socket.emit('game:crossed', {
            lane: nextLane, safe: true, isSafeZone: false,
            multiplier: cappedMultiplier, nextMultiplier: null,
            revealedLane: { lane: nextLane, hasCar: false, isSafeZone: false },
          });

          socket.emit('game:over', {
            result: 'cashed_out',
            multiplier: cappedMultiplier,
            profit,
            balance,
            serverSeed: session.serverSeed,
            revealedLanes: session.revealedLanes,
            autoCashedOut: true,
          });

          io.emit('feed:win', { username: session.username, multiplier: cappedMultiplier, profit, difficulty: session.difficulty });
          activeSessions.delete(userId);
          logger.info({ userId, gameId: session.gameId, multiplier: cappedMultiplier, profit }, 'Auto cash-out triggered');
          return;
        }

        const nextMult = getNextMultiplier(
          session.difficulty,
          nextLane,
          session.riskyLanesCrossed
        );

        socket.emit('game:crossed', {
          lane: nextLane,
          safe: true,
          isSafeZone: false,
          multiplier: newMultiplier,
          nextMultiplier: nextMult,
          revealedLane: { lane: nextLane, hasCar: false, isSafeZone: false },
        });
      }

      } finally {
        // Release the processing lock (only if session still exists)
        const s = activeSessions.get(userId);
        if (s) s.processing = false;
      }
    });

    // Handle cash out
    socket.on('game:cashout', async () => {
      const session = activeSessions.get(userId);
      if (!session || session.status !== 'active') {
        socket.emit('game:error', { error: 'No active game' });
        return;
      }

      if (session.processing) return;
      session.processing = true;

      if (session.currentLane === 0) {
        session.processing = false;
        socket.emit('game:error', { error: 'Must cross at least one lane before cashing out' });
        return;
      }

      try {
        const multiplier = session.currentMultiplier;
        const balance = await resolveBetWin(userId, session.gameId, session.betAmount, multiplier);
        const profit = Math.floor(session.betAmount * multiplier * 100) / 100 - session.betAmount;

        session.status = 'cashed_out';

        socket.emit('game:over', {
          result: 'cashed_out',
          multiplier,
          profit,
          balance,
          serverSeed: session.serverSeed,
          revealedLanes: session.revealedLanes,
        });

        io.emit('feed:win', {
          username: session.username,
          multiplier,
          profit,
          difficulty: session.difficulty,
        });

        activeSessions.delete(userId);
        logger.info({ userId, gameId: session.gameId, multiplier, profit }, 'Player cashed out');
      } catch (error: any) {
        socket.emit('game:error', { error: error.message });
      }
    });

    // Handle chat messages
    socket.on('chat:send', (data: { message: string }) => {
      const parsed = chatSchema.safeParse(data);
      if (!parsed.success) return;

      const message = parsed.data.message;

      const lastMsg = chatCooldowns.get(userId) || 0;
      if (Date.now() - lastMsg < CHAT_COOLDOWN) return;

      chatCooldowns.set(userId, Date.now());
      chatMessageId++;

      io.emit('chat:message', {
        id: chatMessageId,
        username,
        message,
        timestamp: Date.now(),
        type: 'message',
      });
    });

    socket.on('disconnect', () => {
      logger.info({ userId, username }, 'Player disconnected');
      userSockets.delete(userId);
      chatCooldowns.delete(userId);
    });
  });
}

async function getUserBalance(userId: number): Promise<number> {
  const result = await pool.query('SELECT balance FROM users WHERE id = $1', [userId]);
  return parseFloat(result.rows[0].balance);
}
