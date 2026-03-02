import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import { pool } from './db';

async function migrate() {
  const client = await pool.connect();

  try {
    // Ensure migrations table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Read migration files
    const migrationsDir = path.join(__dirname, '..', 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      // Check if already executed
      const { rows } = await client.query(
        'SELECT id FROM migrations WHERE name = $1',
        [file]
      );

      if (rows.length > 0) {
        console.log(`Skipping ${file} (already executed)`);
        continue;
      }

      // Execute migration
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
      console.log(`Executing ${file}...`);

      await client.query('BEGIN');
      await client.query(sql);
      await client.query(
        'INSERT INTO migrations (name) VALUES ($1)',
        [file]
      );
      await client.query('COMMIT');

      console.log(`Completed ${file}`);
    }

    console.log('All migrations completed successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
