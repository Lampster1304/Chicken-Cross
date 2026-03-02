import { Router, Request, Response } from 'express';
import { pool } from '../config/db';

export const leaderboardRouter = Router();

type Period = 'daily' | 'weekly' | 'monthly' | 'alltime';
type Category = 'biggest_win' | 'most_won' | 'most_wagered';

function getPeriodFilter(period: Period): string {
  switch (period) {
    case 'daily': return "AND g.created_at >= NOW() - INTERVAL '1 day'";
    case 'weekly': return "AND g.created_at >= NOW() - INTERVAL '7 days'";
    case 'monthly': return "AND g.created_at >= NOW() - INTERVAL '30 days'";
    case 'alltime': return '';
  }
}

// GET /api/leaderboard?period=daily&category=biggest_win
leaderboardRouter.get('/', async (req: Request, res: Response) => {
  const period = (req.query.period as Period) || 'alltime';
  const category = (req.query.category as Category) || 'biggest_win';

  if (!['daily', 'weekly', 'monthly', 'alltime'].includes(period)) {
    return res.status(400).json({ error: 'Invalid period' });
  }
  if (!['biggest_win', 'most_won', 'most_wagered'].includes(category)) {
    return res.status(400).json({ error: 'Invalid category' });
  }

  try {
    let query: string;
    const periodFilter = getPeriodFilter(period);

    switch (category) {
      case 'biggest_win':
        query = `
          SELECT u.id, u.username, g.final_multiplier as value, g.profit, g.bet_amount as amount
          FROM games g
          JOIN users u ON g.user_id = u.id
          WHERE g.status = 'cashed_out' AND g.final_multiplier IS NOT NULL
          ${periodFilter}
          ORDER BY g.final_multiplier DESC
          LIMIT 20
        `;
        break;

      case 'most_won':
        query = `
          SELECT u.id, u.username, COALESCE(SUM(g.profit), 0) as value
          FROM games g
          JOIN users u ON g.user_id = u.id
          WHERE g.status IN ('cashed_out', 'completed') AND g.profit > 0
          ${periodFilter}
          GROUP BY u.id, u.username
          ORDER BY value DESC
          LIMIT 20
        `;
        break;

      case 'most_wagered':
        if (period === 'alltime') {
          query = `
            SELECT id, username, total_wagered as value
            FROM users
            WHERE total_wagered > 0
            ORDER BY total_wagered DESC
            LIMIT 20
          `;
        } else {
          query = `
            SELECT u.id, u.username, COALESCE(SUM(g.bet_amount), 0) as value
            FROM games g
            JOIN users u ON g.user_id = u.id
            WHERE 1=1 ${periodFilter}
            GROUP BY u.id, u.username
            ORDER BY value DESC
            LIMIT 20
          `;
        }
        break;
    }

    const result = await pool.query(query);
    res.json({
      period,
      category,
      entries: result.rows.map((row: any, i: number) => ({
        rank: i + 1,
        userId: row.id,
        username: row.username,
        value: parseFloat(row.value),
        ...(row.profit !== undefined ? { profit: parseFloat(row.profit) } : {}),
        ...(row.amount !== undefined ? { amount: parseFloat(row.amount) } : {}),
      })),
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});
