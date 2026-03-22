-- Add cancellation_reason column to appointments if it does not exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appointments' AND column_name = 'cancellation_reason'
  ) THEN
    ALTER TABLE appointments ADD COLUMN cancellation_reason TEXT NULL;
  END IF;
END $$;
