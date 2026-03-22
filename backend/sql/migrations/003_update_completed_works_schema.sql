-- Migration: Update completed_works table for new pricing structure
-- Add amount, discount_percentage, discount_amount, total, and description fields

-- Add new columns
ALTER TABLE completed_works 
ADD COLUMN IF NOT EXISTS amount DECIMAL(10,2) NULL,
ADD COLUMN IF NOT EXISTS discount_percentage DECIMAL(5,2) NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS total DECIMAL(10,2) NULL,
ADD COLUMN IF NOT EXISTS description TEXT NULL;

-- Drop old columns (optional - keep for data migration)
-- ALTER TABLE completed_works DROP COLUMN IF EXISTS products_used;
-- ALTER TABLE completed_works DROP COLUMN IF EXISTS cost;

-- Add indexes for new fields
CREATE INDEX IF NOT EXISTS idx_completed_works_total ON completed_works(total);
CREATE INDEX IF NOT EXISTS idx_completed_works_amount ON completed_works(amount);

-- Add check constraints
ALTER TABLE completed_works 
ADD CONSTRAINT chk_total_non_negative 
CHECK (total >= 0),
ADD CONSTRAINT chk_discount_percentage_range 
CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
ADD CONSTRAINT chk_discount_amount_non_negative 
CHECK (discount_amount >= 0);
