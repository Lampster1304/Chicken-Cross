import crypto from 'crypto';

const HOUSE_EDGE = 0.03; // 3%
const SAFE_ZONE_INTERVAL = 5; // Every 5th lane is a safe zone

/**
 * Hash a server seed with SHA-256 to publish before the game.
 */
export function hashServerSeed(serverSeed: string): string {
  return crypto.createHash('sha256').update(serverSeed).digest('hex');
}

/**
 * Generate a new random server seed.
 */
export function generateServerSeed(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Check if a lane number is a safe zone (every 5th lane: 5, 10, 15, 20...).
 */
export function isSafeZone(lane: number): boolean {
  return lane > 0 && lane % SAFE_ZONE_INTERVAL === 0;
}

/**
 * Determine if a specific lane has a car (is dangerous).
 * Uses per-lane HMAC for deterministic outcome.
 * Safe zones are always safe.
 * Probability of car = difficulty * 20% (difficulty 1=20%, 2=40%, 3=60%, 4=80%)
 */
export function isLaneDangerous(
  serverSeed: string,
  clientSeed: string,
  nonce: number,
  lane: number,
  difficulty: number
): boolean {
  if (isSafeZone(lane)) return false;

  const hmac = crypto
    .createHmac('sha256', serverSeed)
    .update(`${clientSeed}:${nonce}:${lane}`)
    .digest('hex');

  const roll = parseInt(hmac.substring(0, 8), 16) % 100;
  const threshold = difficulty * 20; // 20%, 40%, 60%, 80%

  return roll < threshold;
}

/**
 * Get the multiplier earned per risky lane crossing.
 * Formula: (1 - HOUSE_EDGE) / P(safe)
 */
export function getLaneMultiplier(difficulty: number): number {
  const safeProbability = (100 - difficulty * 20) / 100;
  return Math.floor((1 - HOUSE_EDGE) / safeProbability * 100) / 100;
}

/**
 * Get cumulative multiplier after crossing N risky lanes.
 */
export function getCumulativeMultiplier(
  difficulty: number,
  riskyLanesCrossed: number
): number {
  if (riskyLanesCrossed <= 0) return 1.0;
  const perLane = getLaneMultiplier(difficulty);
  return Math.floor(Math.pow(perLane, riskyLanesCrossed) * 100) / 100;
}

/**
 * Get the multiplier that would result from crossing the next lane.
 */
export function getNextMultiplier(
  difficulty: number,
  currentLane: number,
  riskyLanesCrossed: number
): number {
  const nextLane = currentLane + 1;
  if (isSafeZone(nextLane)) {
    // Safe zone - multiplier stays the same
    return getCumulativeMultiplier(difficulty, riskyLanesCrossed);
  }
  return getCumulativeMultiplier(difficulty, riskyLanesCrossed + 1);
}

/**
 * Verify a sequence of lane outcomes given seeds.
 */
export function verifyLaneOutcomes(
  serverSeed: string,
  clientSeed: string,
  nonce: number,
  difficulty: number,
  lanes: Array<{ lane: number; hasCar: boolean }>
): boolean {
  return lanes.every(l => {
    if (isSafeZone(l.lane)) return !l.hasCar;
    return isLaneDangerous(serverSeed, clientSeed, nonce, l.lane, difficulty) === l.hasCar;
  });
}
