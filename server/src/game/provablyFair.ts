import crypto from 'crypto';

const HOUSE_EDGE = 0.03; // 3%

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
 * Determine if a specific lane has a car (is dangerous).
 * Uses per-lane HMAC for deterministic outcome.
 * Probability of car = difficulty * 20% (difficulty 1=20%, 2=40%, 3=60%, 4=80%)
 */
export function isLaneDangerous(
  serverSeed: string,
  clientSeed: string,
  nonce: number,
  lane: number,
  difficulty: number
): boolean {
  const hmac = crypto
    .createHmac('sha256', serverSeed)
    .update(`${clientSeed}:${nonce}:${lane}`)
    .digest('hex');

  const roll = parseInt(hmac.substring(0, 8), 16) % 100;
  const thresholds: Record<number, number> = { 1: 15, 2: 40, 3: 60, 4: 80 };
  const threshold = thresholds[difficulty] ?? difficulty * 20;

  return roll < threshold;
}

/**
 * Get the multiplier earned per lane crossing.
 * Formula: (1 - HOUSE_EDGE) / P(safe)
 */
export function getLaneMultiplier(difficulty: number, customMultiplier?: number): number {
  if (customMultiplier) return customMultiplier;

  if (difficulty === 1) return 1.05;
  if (difficulty === 2) return 1.10;
  if (difficulty === 3) return 1.20;
  if (difficulty === 4) return 1.45;

  // Fallback
  const safeProbability = (100 - difficulty * 20) / 100;
  return Math.floor((1 - HOUSE_EDGE) / safeProbability * 100) / 100;
}

/**
 * Get cumulative multiplier after crossing N lanes.
 */
export function getCumulativeMultiplier(
  difficulty: number,
  lanesCrossed: number,
  customMultiplier?: number
): number {
  if (lanesCrossed <= 0) return 1.0;
  const perLane = getLaneMultiplier(difficulty, customMultiplier);
  return Math.floor(Math.pow(perLane, lanesCrossed) * 100) / 100;
}

/**
 * Get the multiplier that would result from crossing the next lane.
 */
export function getNextMultiplier(
  difficulty: number,
  currentLane: number,
  lanesCrossed: number,
  customMultiplier?: number
): number {
  return getCumulativeMultiplier(difficulty, lanesCrossed + 1, customMultiplier);
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
    return isLaneDangerous(serverSeed, clientSeed, nonce, l.lane, difficulty) === l.hasCar;
  });
}
