-- Check existing staff profiles
SELECT id, name, email, phone, role, is_active, created_at 
FROM staff_profiles 
ORDER BY created_at DESC;

-- Check for duplicate emails
SELECT email, COUNT(*) as count 
FROM staff_profiles 
GROUP BY email 
HAVING COUNT(*) > 1;

-- Clear all staff profiles (if needed to start fresh)
-- DELETE FROM staff_profiles;

-- Clear current staff references (if needed)
-- UPDATE users SET current_staff_id = NULL WHERE current_staff_id IS NOT NULL;
