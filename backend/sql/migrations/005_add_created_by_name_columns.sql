-- Migration: Add created_by_name columns to track staff profile names
-- This allows us to store the staff profile name used for data creation

-- Add created_by_name to appointments table
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS created_by_name TEXT NULL;

-- Add uploaded_by_name to completed_works table  
ALTER TABLE completed_works 
ADD COLUMN IF NOT EXISTS uploaded_by_name TEXT NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_appointments_created_by_name ON appointments(created_by_name);
CREATE INDEX IF NOT EXISTS idx_completed_works_uploaded_by_name ON completed_works(uploaded_by_name);
