/**
 * Browser-side crypto utilities using Web Crypto API.
 * Used for Provably Fair verification on the client.
 */

const SAFE_ZONE_INTERVAL = 5;

export async function createHmac(key: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(key);
  const msgData = encoder.encode(message);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, msgData);
  return bufferToHex(signature);
}

export async function createHash(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const hash = await crypto.subtle.digest('SHA-256', encoder.encode(data));
  return bufferToHex(hash);
}

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Check if a lane is a safe zone.
 */
export function isSafeZone(lane: number): boolean {
  return lane > 0 && lane % SAFE_ZONE_INTERVAL === 0;
}

/**
 * Determine if a specific lane has a car (client-side verification).
 * Same algorithm as server: HMAC per lane, roll % 100 < difficulty * 20.
 */
export async function isLaneDangerous(
  serverSeed: string,
  clientSeed: string,
  nonce: number,
  lane: number,
  difficulty: number
): Promise<boolean> {
  if (isSafeZone(lane)) return false;

  const hmac = await createHmac(serverSeed, `${clientSeed}:${nonce}:${lane}`);
  const roll = parseInt(hmac.substring(0, 8), 16) % 100;
  const threshold = difficulty * 20;

  return roll < threshold;
}

/**
 * Get multiplier per risky lane for a given difficulty.
 */
export function getLaneMultiplier(difficulty: number): number {
  const safeProbability = (100 - difficulty * 20) / 100;
  return Math.floor(0.97 / safeProbability * 100) / 100;
}

/**
 * Verify a sequence of lane outcomes.
 */
export async function verifyLaneOutcomes(
  serverSeed: string,
  clientSeed: string,
  nonce: number,
  difficulty: number,
  lanes: Array<{ lane: number; hasCar: boolean }>
): Promise<boolean> {
  for (const l of lanes) {
    if (isSafeZone(l.lane)) {
      if (l.hasCar) return false;
      continue;
    }
    const dangerous = await isLaneDangerous(serverSeed, clientSeed, nonce, l.lane, difficulty);
    if (dangerous !== l.hasCar) return false;
  }
  return true;
}
