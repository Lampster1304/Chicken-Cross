-- Initialize multipliers for difficulty levels
INSERT INTO site_settings (key, value) VALUES ('mult_1', '1.05') ON CONFLICT (key) DO NOTHING;
INSERT INTO site_settings (key, value) VALUES ('mult_2', '1.10') ON CONFLICT (key) DO NOTHING;
INSERT INTO site_settings (key, value) VALUES ('mult_3', '1.20') ON CONFLICT (key) DO NOTHING;
INSERT INTO site_settings (key, value) VALUES ('mult_4', '1.45') ON CONFLICT (key) DO NOTHING;
