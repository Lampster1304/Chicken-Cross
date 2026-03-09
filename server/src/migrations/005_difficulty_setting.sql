-- Initialize difficulty setting
INSERT INTO site_settings (key, value) VALUES ('difficulty', '1') ON CONFLICT (key) DO NOTHING;
