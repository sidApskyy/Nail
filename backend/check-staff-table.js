const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.wbmkcwkfcwquyhvcpupi:jkIip9hPr4vdAWBg@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function checkStaffTable() {
  try {
    console.log('Checking staff_profiles table...');
    
    // Check if table exists
    const tableCheck = await pool.query(`
      SELECT table_name, column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'staff_profiles' 
      ORDER BY ordinal_position
    `);
    
    if (tableCheck.rows.length === 0) {
      console.log('❌ staff_profiles table does not exist');
      
      // Check all tables
      const allTables = await pool.query(`
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `);
      console.log('Available tables:', allTables.rows.map(r => r.table_name));
    } else {
      console.log('✅ staff_profiles table exists');
      console.log('Columns:');
      tableCheck.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable})`);
      });
      
      // Check existing data
      const dataCheck = await pool.query('SELECT COUNT(*) as count FROM staff_profiles');
      console.log(`📊 Current staff profiles count: ${dataCheck.rows[0].count}`);
      
      // Show existing profiles
      const profiles = await pool.query('SELECT * FROM staff_profiles LIMIT 5');
      if (profiles.rows.length > 0) {
        console.log('📋 Existing staff profiles:');
        profiles.rows.forEach(profile => {
          console.log(`  - ${profile.name} (${profile.email}) - ${profile.is_active ? 'Active' : 'Inactive'}`);
        });
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkStaffTable();
