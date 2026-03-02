import { Pool } from 'pg';

let _pool: Pool | null = null;

export function getPool(): Pool {
  if (!_pool) {
    _pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/chicken_cross',
    });

    _pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
      process.exit(-1);
    });
  }
  return _pool;
}

// Keep backward compat: `pool` is a getter that lazily creates the pool
export const pool = new Proxy({} as Pool, {
  get(_target, prop) {
    const realPool = getPool();
    const value = (realPool as any)[prop];
    if (typeof value === 'function') {
      return value.bind(realPool);
    }
    return value;
  },
});
