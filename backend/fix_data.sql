-- FIX DATA: Update existing completed works with staff profile names

-- Step 1: Update completed_works with staff profile names
UPDATE completed_works cw
SET uploaded_by_name = sp.name
FROM staff_profiles sp
WHERE cw.uploaded_by = sp.created_by 
    AND cw.uploaded_by_name IS NULL;

-- Step 2: For any remaining works, update with user names
UPDATE completed_works cw
SET uploaded_by_name = u.name
FROM users u
WHERE cw.uploaded_by = u.id 
    AND cw.uploaded_by_name IS NULL;

-- Step 3: Update appointments with staff profile names
UPDATE appointments a
SET created_by_name = sp.name
FROM staff_profiles sp
WHERE a.created_by = sp.created_by 
    AND a.created_by_name IS NULL;

-- Step 4: For any remaining appointments, update with user names
UPDATE appointments a
SET created_by_name = u.name
FROM users u
WHERE a.created_by = u.id 
    AND a.created_by_name IS NULL;

-- Step 5: Verify the fixes
SELECT 
    'completed_works' as table_name,
    COUNT(*) as total,
    COUNT(uploaded_by_name) as with_name,
    COUNT(*) - COUNT(uploaded_by_name) as missing_name
FROM completed_works

UNION ALL

SELECT 
    'appointments' as table_name,
    COUNT(*) as total,
    COUNT(created_by_name) as with_name,
    COUNT(*) - COUNT(created_by_name) as missing_name
FROM appointments;
