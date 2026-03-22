-- ROOT CAUSE ANALYSIS: Debug completed works data

-- 1. Check if columns exist
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'completed_works' 
    AND column_name IN ('uploaded_by_name', 'uploaded_by')
ORDER BY column_name;

-- 2. Check actual data in completed_works
SELECT 
    id,
    uploaded_by,
    uploaded_by_name,
    customer_name,
    created_at
FROM completed_works 
ORDER BY created_at DESC
LIMIT 5;

-- 3. Check if staff_profiles table has data
SELECT 
    id,
    name,
    email,
    is_active
FROM staff_profiles 
ORDER BY created_at DESC;

-- 4. Check users table for staff
SELECT 
    id,
    name,
    email,
    current_staff_id
FROM users 
WHERE role = 'staff'
ORDER BY created_at DESC;

-- 5. Check current staff mapping
SELECT 
    u.id as user_id,
    u.name as user_name,
    u.current_staff_id,
    sp.name as staff_profile_name,
    sp.email as staff_profile_email
FROM users u
LEFT JOIN staff_profiles sp ON u.current_staff_id = sp.id
WHERE u.role = 'staff';
