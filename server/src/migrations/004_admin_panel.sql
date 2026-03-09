-- Admin panel: role column + site_settings table

ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(10) NOT NULL DEFAULT 'user';
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('user', 'admin'));

CREATE TABLE IF NOT EXISTS site_settings (
  key VARCHAR(50) PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO site_settings (key, value) VALUES ('min_bet', '1.00') ON CONFLICT (key) DO NOTHING;
INSERT INTO site_settings (key, value) VALUES ('max_bet', '500.00') ON CONFLICT (key) DO NOTHING;
