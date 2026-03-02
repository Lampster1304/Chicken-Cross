import { pool } from '../config/db';
import { MAX_WIN_CAP } from './constants';
import { updateVipLevel } from './vip';
import { processAffiliateCommission } from './affiliates';

/**
 * Deduct balance for a new game. Returns the new balance.
 * Uses atomic DB transaction with row locking.
 */
export async function deductBetAmount(
  userId: number,
  amount: number
): Promise<number> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Lock user row and check balance
    const userResult = await client.query(
      'SELECT balance FROM users WHERE id = $1 FOR UPDATE',
      [userId]
    );

    if (userResult.rows.length === 0) {
      throw new Error('User not found');
    }

    const balance = parseFloat(userResult.rows[0].balance);

    if (balance < amount) {
      throw new Error('Insufficient balance');
    }

    if (amount <= 0) {
      throw new Error('Bet amount must be positive');
    }

    // Deduct balance and track wagered
    await client.query(
      'UPDATE users SET balance = balance - $1, total_wagered = total_wagered + $1, updated_at = NOW() WHERE id = $2',
      [amount, userId]
    );

    const newBalance = balance - amount;

    // Create transaction record
    await client.query(
      `INSERT INTO transactions (user_id, type, amount, balance_after)
       VALUES ($1, 'bet', $2, $3)`,
      [userId, -amount, newBalance]
    );

    await client.query('COMMIT');

    // Post-bet async operations (non-blocking)
    updateVipLevel(userId).catch(() => {});

    return newBalance;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Credit winnings to a user when they cash out.
 * Returns the new balance.
 */
export async function resolveBetWin(
  userId: number,
  gameId: number,
  betAmount: number,
  multiplier: number
): Promise<number> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const rawPayout = Math.floor(betAmount * multiplier * 100) / 100;
    const payout = Math.min(rawPayout, MAX_WIN_CAP);
    const profit = payout - betAmount;

    // Update game record
    await client.query(
      `UPDATE games SET status = 'cashed_out', final_multiplier = $1, profit = $2, ended_at = NOW()
       WHERE id = $3 AND status = 'active'`,
      [multiplier, profit, gameId]
    );

    // Credit user balance
    const userResult = await client.query(
      `UPDATE users SET balance = balance + $1, total_won = total_won + $2, updated_at = NOW()
       WHERE id = $3 RETURNING balance`,
      [payout, profit > 0 ? profit : 0, userId]
    );

    const newBalance = parseFloat(userResult.rows[0].balance);

    // Create transaction record
    await client.query(
      `INSERT INTO transactions (user_id, type, amount, reference_id, balance_after)
       VALUES ($1, 'win', $2, $3, $4)`,
      [userId, payout, gameId, newBalance]
    );

    await client.query('COMMIT');

    return newBalance;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Mark a game as lost (player hit a car).
 * Updates the game record - balance was already deducted on game start.
 */
export async function resolveBetLoss(
  gameId: number,
  laneCrossed: number
): Promise<void> {
  await pool.query(
    `UPDATE games SET status = 'hit', current_lane = $1, profit = -bet_amount, ended_at = NOW()
     WHERE id = $2 AND status = 'active'`,
    [laneCrossed, gameId]
  );
}

/**
 * Mark a game as completed (player crossed all safe lanes).
 */
export async function resolveBetCompleted(
  userId: number,
  gameId: number,
  betAmount: number,
  multiplier: number
): Promise<number> {
  // Same as win - player gets the final multiplier
  return resolveBetWin(userId, gameId, betAmount, multiplier);
}
