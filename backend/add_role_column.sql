-- Add role column to users table
ALTER TABLE user ADD COLUMN role VARCHAR(50) DEFAULT 'user' COMMENT 'user, admin' AFTER password;

-- Set admin role for the specific email
UPDATE user SET role = 'admin' WHERE email = 'dineshsellerrocket@gmail.com';

-- Verify the update
SELECT id, email, role FROM user WHERE email = 'dineshsellerrocket@gmail.com';
