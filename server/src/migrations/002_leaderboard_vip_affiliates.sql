-- VIP levels for users
ALTER TABLE users ADD COLUMN IF NOT EXISTS vip_level VARCHAR(20) NOT NULL DEFAULT 'bronze';
ALTER TABLE users ADD COLUMN IF NOT EXISTS rakeback_rate DECIMAL(5,4) NOT NULL DEFAULT 0.0000;

-- Affiliate system
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code VARCHAR(20) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by INTEGER REFERENCES users(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS affiliate_earnings DECIMAL(18,2) NOT NULL DEFAULT 0.00;

-- Generate referral codes for existing users
-- (will be done in app logic for new users)

-- Affiliate commissions log
CREATE TABLE IF NOT EXISTS affiliate_commissions (
  id SERIAL PRIMARY KEY,
  referrer_id INTEGER NOT NULL REFERENCES users(id),
  referred_id INTEGER NOT NULL REFERENCES users(id),
  bet_id INTEGER NOT NULL REFERENCES bets(id),
  commission DECIMAL(18,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_referrer ON affiliate_commissions(referrer_id);

-- Tournaments
CREATE TABLE IF NOT EXISTS tournaments (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL DEFAULT 'time',
  status VARCHAR(20) NOT NULL DEFAULT 'upcoming',
  prize_pool DECIMAL(18,2) NOT NULL DEFAULT 0.00,
  entry_fee DECIMAL(18,2) NOT NULL DEFAULT 0.00,
  max_players INTEGER NOT NULL DEFAULT 100,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tournament_entries (
  id SERIAL PRIMARY KEY,
  tournament_id INTEGER NOT NULL REFERENCES tournaments(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  score DECIMAL(18,2) NOT NULL DEFAULT 0.00,
  best_multiplier DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total_profit DECIMAL(18,2) NOT NULL DEFAULT 0.00,
  rounds_played INTEGER NOT NULL DEFAULT 0,
  prize_won DECIMAL(18,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tournament_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_tournament_entries_tournament ON tournament_entries(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_entries_user ON tournament_entries(user_id);

-- Leaderboard materialized view helpers (indexes for fast queries)
CREATE INDEX IF NOT EXISTS idx_bets_cash_out_multiplier ON bets(cash_out_multiplier DESC NULLS LAST) WHERE status = 'cashed_out';
CREATE INDEX IF NOT EXISTS idx_bets_created_at ON bets(created_at);
CREATE INDEX IF NOT EXISTS idx_users_total_wagered ON users(total_wagered DESC);
CREATE INDEX IF NOT EXISTS idx_users_total_won ON users(total_won DESC);
