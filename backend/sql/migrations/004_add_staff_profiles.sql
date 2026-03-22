-- Migration: Add staff_profiles table for staff switching without login
-- This allows admin to create staff profiles that can be switched from UI

CREATE TABLE IF NOT EXISTS staff_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'staff',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_profiles_active ON staff_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_staff_profiles_created_by ON staff_profiles(created_by);

-- Add current_staff_id to users table to track active staff profile
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS current_staff_id UUID REFERENCES staff_profiles(id);

CREATE INDEX IF NOT EXISTS idx_users_current_staff ON users(current_staff_id);

-- Insert sample staff profile (optional - can be removed)
-- INSERT INTO staff_profiles (name, email, phone, created_by) 
-- SELECT 'Default Staff', 'staff@nailhouse.com', '1234567890', id 
-- FROM users WHERE role = 'admin' LIMIT 1;
