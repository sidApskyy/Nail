-- Check if new columns exist in tables
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('appointments', 'completed_works') 
    AND column_name IN ('created_by_name', 'uploaded_by_name')
ORDER BY table_name, column_name;

-- Check for existing data
SELECT 
    'appointments' as table_name,
    COUNT(*) as total_rows,
    COUNT(created_by_name) as rows_with_name,
    COUNT(*) - COUNT(created_by_name) as rows_without_name
FROM appointments

UNION ALL

SELECT 
    'completed_works' as table_name,
    COUNT(*) as total_rows,
    COUNT(uploaded_by_name) as rows_with_name,
    COUNT(*) - COUNT(uploaded_by_name) as rows_without_name
FROM completed_works;
