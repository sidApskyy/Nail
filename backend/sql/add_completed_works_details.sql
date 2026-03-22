-- Add name, number, cost columns to completed_works if they do not exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'completed_works' AND column_name = 'name'
  ) THEN
    ALTER TABLE completed_works ADD COLUMN name TEXT NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'completed_works' AND column_name = 'number'
  ) THEN
    ALTER TABLE completed_works ADD COLUMN number TEXT NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'completed_works' AND column_name = 'cost'
  ) THEN
    ALTER TABLE completed_works ADD COLUMN cost TEXT NULL;
  END IF;
END $$;
