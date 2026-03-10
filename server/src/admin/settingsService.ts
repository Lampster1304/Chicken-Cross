import { pool } from '../config/db';

interface BetLimits {
  minBet: number;
  maxBet: number;
  difficulty: number;
  multipliers: Record<number, number>;
}

let cachedLimits: BetLimits | null = null;

export async function getBetLimits(): Promise<BetLimits> {
  if (cachedLimits) return cachedLimits;

  const result = await pool.query(
    "SELECT key, value FROM site_settings WHERE key IN ('min_bet', 'max_bet', 'difficulty', 'mult_1', 'mult_2', 'mult_3', 'mult_4')"
  );

  let minBet = 1;
  let maxBet = 500;
  let difficulty = 1;
  let multipliers: Record<number, number> = {
    1: 1.05,
    2: 1.10,
    3: 1.20,
    4: 1.45
  };

  for (const row of result.rows) {
    if (row.key === 'min_bet') minBet = parseFloat(row.value);
    if (row.key === 'max_bet') maxBet = parseFloat(row.value);
    if (row.key === 'difficulty') difficulty = parseInt(row.value);
    if (row.key === 'mult_1') multipliers[1] = parseFloat(row.value);
    if (row.key === 'mult_2') multipliers[2] = parseFloat(row.value);
    if (row.key === 'mult_3') multipliers[3] = parseFloat(row.value);
    if (row.key === 'mult_4') multipliers[4] = parseFloat(row.value);
  }

  cachedLimits = { minBet, maxBet, difficulty, multipliers };
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
      SUM(CASE WHEN type = 'win' THEN amount ELSE 0 END) as total_won,
      SUM(CASE WHEN type = 'bet' AND created_at >= CURRENT_DATE THEN ABS(amount) ELSE 0 END) as today_wagered,
      SUM(CASE WHEN type = 'win' AND created_at >= CURRENT_DATE THEN amount ELSE 0 END) as today_won
    FROM transactions
  `);

  const totalWagered = parseFloat(result.rows[0].total_wagered || '0');
  const totalWon = parseFloat(result.rows[0].total_won || '0');
  const todayWagered = parseFloat(result.rows[0].today_wagered || '0');
  const todayWon = parseFloat(result.rows[0].today_won || '0');

  return {
    totalWagered,
    totalWon,
    totalProfit: totalWagered - totalWon,
    todayWagered,
    todayWon,
    todayProfit: todayWagered - todayWon
  };
}
