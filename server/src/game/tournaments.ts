import { Router, Request, Response } from 'express';
import { pool } from '../config/db';
import { authMiddleware } from '../middleware/authMiddleware';

export const tournamentRouter = Router();

// GET /api/tournaments - List tournaments
tournamentRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT t.*,
        (SELECT COUNT(*) FROM tournament_entries te WHERE te.tournament_id = t.id) as player_count
       FROM tournaments t
       ORDER BY
         CASE t.status
           WHEN 'active' THEN 0
           WHEN 'upcoming' THEN 1
           WHEN 'finished' THEN 2
         END,
         t.starts_at DESC
       LIMIT 20`
    );

    res.json({
      tournaments: result.rows.map((t: any) => ({
        id: t.id,
        name: t.name,
        type: t.type,
        status: t.status,
        prizePool: parseFloat(t.prize_pool),
        entryFee: parseFloat(t.entry_fee),
        maxPlayers: t.max_players,
        playerCount: parseInt(t.player_count),
        startsAt: t.starts_at,
        endsAt: t.ends_at,
      })),
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch tournaments' });
  }
});

// GET /api/tournaments/:id - Get tournament details with leaderboard
tournamentRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const tourney = await pool.query('SELECT * FROM tournaments WHERE id = $1', [id]);
    if (tourney.rows.length === 0) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    const entries = await pool.query(
      `SELECT te.*, u.username
       FROM tournament_entries te
       JOIN users u ON te.user_id = u.id
       WHERE te.tournament_id = $1
       ORDER BY te.score DESC
       LIMIT 50`,
      [id]
    );

    const t = tourney.rows[0];
    res.json({
      tournament: {
        id: t.id,
        name: t.name,
        type: t.type,
        status: t.status,
        prizePool: parseFloat(t.prize_pool),
        entryFee: parseFloat(t.entry_fee),
        maxPlayers: t.max_players,
        startsAt: t.starts_at,
        endsAt: t.ends_at,
      },
      leaderboard: entries.rows.map((e: any, i: number) => ({
        rank: i + 1,
        username: e.username,
        score: parseFloat(e.score),
        bestMultiplier: parseFloat(e.best_multiplier),
        totalProfit: parseFloat(e.total_profit),
        roundsPlayed: e.rounds_played,
        prizeWon: e.prize_won ? parseFloat(e.prize_won) : null,
      })),
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch tournament' });
  }
});

// POST /api/tournaments/:id/join - Join a tournament
tournamentRouter.post('/:id/join', authMiddleware, async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { id } = req.params;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const tourney = await client.query(
      'SELECT * FROM tournaments WHERE id = $1',
      [id]
    );

    if (tourney.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Tournament not found' });
    }

    const t = tourney.rows[0];

    if (t.status !== 'active' && t.status !== 'upcoming') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Tournament is not open for registration' });
    }

    // Check if already joined
    const existing = await client.query(
      'SELECT id FROM tournament_entries WHERE tournament_id = $1 AND user_id = $2',
      [id, userId]
    );

    if (existing.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Already joined this tournament' });
    }

    // Check entry fee
    const entryFee = parseFloat(t.entry_fee);
    if (entryFee > 0) {
      const user = await client.query(
        'SELECT balance FROM users WHERE id = $1 FOR UPDATE',
        [userId]
      );

      if (parseFloat(user.rows[0].balance) < entryFee) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Insufficient balance for entry fee' });
      }

      await client.query(
        'UPDATE users SET balance = balance - $1 WHERE id = $2',
        [entryFee, userId]
      );
    }

    // Add to prize pool and create entry
    await client.query(
      'UPDATE tournaments SET prize_pool = prize_pool + $1 WHERE id = $2',
      [entryFee, id]
    );

    await client.query(
      'INSERT INTO tournament_entries (tournament_id, user_id) VALUES ($1, $2)',
      [id, userId]
    );

    await client.query('COMMIT');
    res.json({ success: true });
  } catch {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Failed to join tournament' });
  } finally {
    client.release();
  }
});
