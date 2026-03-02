import { pool } from '../config/db';

export interface VipTier {
  name: string;
  minWagered: number;
  rakebackRate: number;
  color: string;
}

export const VIP_TIERS: VipTier[] = [
  { name: 'bronze',   minWagered: 0,       rakebackRate: 0.000, color: '#cd7f32' },
  { name: 'silver',   minWagered: 5000,    rakebackRate: 0.005, color: '#c0c0c0' },
  { name: 'gold',     minWagered: 25000,   rakebackRate: 0.010, color: '#ffd700' },
  { name: 'platinum', minWagered: 100000,  rakebackRate: 0.015, color: '#e5e4e2' },
  { name: 'diamond',  minWagered: 500000,  rakebackRate: 0.020, color: '#b9f2ff' },
];

export function calculateVipLevel(totalWagered: number): VipTier {
  let tier = VIP_TIERS[0];
  for (const t of VIP_TIERS) {
    if (totalWagered >= t.minWagered) tier = t;
  }
  return tier;
}

export function getNextTier(currentTier: string): VipTier | null {
  const idx = VIP_TIERS.findIndex(t => t.name === currentTier);
  if (idx < 0 || idx >= VIP_TIERS.length - 1) return null;
  return VIP_TIERS[idx + 1];
}

/**
 * Update a user's VIP level based on total wagered.
 * Returns the rakeback amount if level changed.
 */
export async function updateVipLevel(userId: number): Promise<void> {
  const result = await pool.query(
    'SELECT total_wagered, vip_level FROM users WHERE id = $1',
    [userId]
  );
  if (result.rows.length === 0) return;

  const { total_wagered, vip_level } = result.rows[0];
  const newTier = calculateVipLevel(parseFloat(total_wagered));

  if (newTier.name !== vip_level) {
    await pool.query(
      'UPDATE users SET vip_level = $1, rakeback_rate = $2 WHERE id = $3',
      [newTier.name, newTier.rakebackRate, userId]
    );
  }
}
