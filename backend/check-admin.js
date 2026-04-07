const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.wbmkcwkfcwquyhvcpupi:jkIip9hPr4vdAWBg@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function checkAdmin() {
  try {
    const result = await pool.query('SELECT id, email, role, is_active FROM users WHERE email = $1', ['admin@nailhouse.com']);
    console.log('Admin user found:', result.rows[0]);
    
    if (result.rows.length > 0) {
      console.log('✅ Admin exists and is active');
      console.log('📧 Email:', result.rows[0].email);
      console.log('🔑 Role:', result.rows[0].role);
      console.log('🆔 ID:', result.rows[0].id);
    } else {
      console.log('❌ Admin user not found');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkAdmin();
