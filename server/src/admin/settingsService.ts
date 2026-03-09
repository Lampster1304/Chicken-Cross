import { pool } from '../config/db';

interface BetLimits {
  minBet: number;
  maxBet: number;
  difficulty: number;
}

let cachedLimits: BetLimits | null = null;

export async function getBetLimits(): Promise<BetLimits> {
  if (cachedLimits) return cachedLimits;

  const result = await pool.query(
    "SELECT key, value FROM site_settings WHERE key IN ('min_bet', 'max_bet', 'difficulty')"
  );

  let minBet = 1;
  let maxBet = 500;
  let difficulty = 1;

  for (const row of result.rows) {
    if (row.key === 'min_bet') minBet = parseFloat(row.value);
    if (row.key === 'max_bet') maxBet = parseFloat(row.value);
    if (row.key === 'difficulty') difficulty = parseInt(row.value);
  }

  cachedLimits = { minBet, maxBet, difficulty };
  return cachedLimits;
}

export async function refreshBetLimitsCache(): Promise<BetLimits> {
  cachedLimits = null;
  return getBetLimits();
}

export async function updateSetting(key: string, value: string): Promise<void> {
  await pool.query(
    'UPDATE site_settings SET value = $1, updated_at = NOW() WHERE key = $2',
    [value, key]
  );
  cachedLimits = null;
}

export async function getAllSettings(): Promise<Record<string, string>> {
  const result = await pool.query('SELECT key, value FROM site_settings ORDER BY key');
  const settings: Record<string, string> = {};
  for (const row of result.rows) {
    settings[row.key] = row.value;
  }
  return settings;
}

export async function getSiteStats() {
  const result = await pool.query(`
    SELECT 
      SUM(CASE WHEN type = 'bet' THEN ABS(amount) ELSE 0 END) as total_wagered,
      SUM(CASE WHEN type = 'win' THEN amount ELSE 0 END) as total_won
    FROM transactions
  `);

  const totalWagered = parseFloat(result.rows[0].total_wagered || '0');
  const totalWon = parseFloat(result.rows[0].total_won || '0');
  const totalProfit = totalWagered - totalWon;

  return {
    totalWagered,
    totalWon,
    totalProfit
  };
}
