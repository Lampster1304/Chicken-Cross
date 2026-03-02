-- Migration 003: Per-player Chicken Cross (lane-based game)
-- Replaces the shared crash game with individual per-player sessions

-- Rename old crash-style games table
ALTER TABLE games RENAME TO games_old_crash;

-- Drop old indexes that reference the renamed table
DROP INDEX IF EXISTS idx_games_status;

-- Create new per-player games table
CREATE TABLE games (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  server_seed VARCHAR(255) NOT NULL,
  hashed_server_seed VARCHAR(255) NOT NULL,
  client_seed VARCHAR(255) DEFAULT 'chicken-cross-default',
  nonce INTEGER NOT NULL DEFAULT 0,
  difficulty INTEGER NOT NULL CHECK (difficulty BETWEEN 1 AND 4),
  car_positions INTEGER[] NOT NULL,
  bet_amount DECIMAL(18,2) NOT NULL,
  current_lane INTEGER DEFAULT 0,
  final_multiplier DECIMAL(10,4),
  profit DECIMAL(18,2),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'cashed_out', 'hit', 'completed')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_games_user_id ON games(user_id);
CREATE INDEX idx_games_user_active ON games(user_id) WHERE status = 'active';
CREATE INDEX idx_games_status ON games(status);

-- Update bets table: bets are now 1:1 with games for per-player model
-- Old bets still reference games_old_crash, new games don't use bets table
-- We keep the bets table for backward compatibility with leaderboard queries
