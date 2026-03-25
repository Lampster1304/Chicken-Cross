-- Create default admin user if it doesn't exist
-- Admin credentials: admin@admin.com / admin123
-- Password hash for 'admin123' generated with bcrypt
INSERT INTO users (username, email, password_hash, role, balance)
VALUES (
  'admin',
  'admin@admin.com',
  '$2b$10$rM7lZO8zZL8y/AeWqTJVmuH3CXqZv3K1Z5pZ0xN9hK9YXlZK.Z0K2',
  'admin',
  10000.00
)
ON CONFLICT (email) DO NOTHING;
