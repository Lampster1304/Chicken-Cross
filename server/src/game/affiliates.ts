import { Router, Request, Response } from 'express';
import { pool } from '../config/db';
import { authMiddleware } from '../middleware/authMiddleware';
import crypto from 'crypto';

export const affiliateRouter = Router();

const COMMISSION_RATE = 0.005; // 0.5% of referred user's bets

/**
 * Generate a unique referral code for a user.
 */
export function generateReferralCode(): string {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

/**
 * Process affiliate commission for a bet.
 * Called when a referred user places a bet.
 */
export async function processAffiliateCommission(
  userId: number,
  betId: number,
  betAmount: number
): Promise<void> {
  // Check if user was referred
  const userResult = await pool.query(
    'SELECT referred_by FROM users WHERE id = $1',
    [userId]
  );

  if (userResult.rows.length === 0 || !userResult.rows[0].referred_by) return;

  const referrerId = userResult.rows[0].referred_by;
  const commission = Math.floor(betAmount * COMMISSION_RATE * 100) / 100;

  if (commission <= 0) return;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Credit referrer
    await client.query(
      'UPDATE users SET balance = balance + $1, affiliate_earnings = affiliate_earnings + $1 WHERE id = $2',
      [commission, referrerId]
    );

    // Log commission
    await client.query(
      'INSERT INTO affiliate_commissions (referrer_id, referred_id, bet_id, commission) VALUES ($1, $2, $3, $4)',
      [referrerId, userId, betId, commission]
    );

    await client.query('COMMIT');
  } catch {
    await client.query('ROLLBACK');
  } finally {
    client.release();
  }
}

// GET /api/affiliate/stats - Get affiliate stats for logged-in user
affiliateRouter.get('/stats', authMiddleware, async (req: Request, res: Response) => {
  const userId = (req as any).userId;

  try {
    const userResult = await pool.query(
      'SELECT referral_code, affiliate_earnings FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    let { referral_code, affiliate_earnings } = userResult.rows[0];

    // Generate referral code if not exists
    if (!referral_code) {
      referral_code = generateReferralCode();
      await pool.query('UPDATE users SET referral_code = $1 WHERE id = $2', [referral_code, userId]);
    }

    // Count referrals
    const referralCount = await pool.query(
      'SELECT COUNT(*) as count FROM users WHERE referred_by = $1',
      [userId]
    );

    // Recent commissions
    const commissions = await pool.query(
      `SELECT ac.commission, ac.created_at, u.username as referred_username
       FROM affiliate_commissions ac
       JOIN users u ON ac.referred_id = u.id
       WHERE ac.referrer_id = $1
       ORDER BY ac.created_at DESC LIMIT 20`,
      [userId]
    );

    res.json({
      referralCode: referral_code,
      totalEarnings: parseFloat(affiliate_earnings),
      totalReferrals: parseInt(referralCount.rows[0].count),
      commissionRate: COMMISSION_RATE * 100,
      recentCommissions: commissions.rows.map((r: any) => ({
        amount: parseFloat(r.commission),
        referredUser: r.referred_username,
        date: r.created_at,
      })),
    });
  } catch {
    res.status(500).json({ error: 'Error al obtener estadísticas de afiliado' });
  }
});

// POST /api/affiliate/apply-code - Apply referral code during registration
affiliateRouter.post('/apply-code', async (req: Request, res: Response) => {
  const { userId, referralCode } = req.body;

  if (!userId || !referralCode) {
    return res.status(400).json({ error: 'User ID and referral code required' });
  }

  try {
    // Find referrer
    const referrer = await pool.query(
      'SELECT id FROM users WHERE referral_code = $1',
      [referralCode.toUpperCase()]
    );

    if (referrer.rows.length === 0) {
      return res.status(404).json({ error: 'Invalid referral code' });
    }

    const referrerId = referrer.rows[0].id;

    if (referrerId === userId) {
      return res.status(400).json({ error: 'Cannot refer yourself' });
    }

    // Check if user already has a referrer
    const user = await pool.query(
      'SELECT referred_by FROM users WHERE id = $1',
      [userId]
    );

    if (user.rows[0]?.referred_by) {
      return res.status(400).json({ error: 'Referral already applied' });
    }

    await pool.query(
      'UPDATE users SET referred_by = $1 WHERE id = $2',
      [referrerId, userId]
    );

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to apply referral code' });
  }
});
