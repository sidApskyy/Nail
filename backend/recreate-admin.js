const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.wbmkcwkfcwquyhvcpupi:jkIip9hPr4vdAWBg@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function recreateAdmin() {
  try {
    const email = 'admin@nailhouse.com';
    const password = 'Admin123!';
    const name = 'Admin';
    
    console.log('Recreating admin user...');
    
    // Delete existing admin
    await pool.query('DELETE FROM users WHERE email = $1', [email]);
    console.log('Deleted existing admin user');
    
    // Hash password with correct bcrypt
    const passwordHash = await bcrypt.hash(password, 12);
    console.log('Generated new hash:', passwordHash);
    
    // Insert admin
    const insert = await pool.query(
      `INSERT INTO users (name, email, password, role, created_by, is_active)
       VALUES ($1, $2, $3, 'admin', NULL, TRUE)
       RETURNING id, email, role`,
      [name, email, passwordHash]
    );
    
    console.log('✅ Admin recreated successfully:', insert.rows[0]);
    console.log('📧 Login with:', email);
    console.log('🔑 Password:', password);
    
    // Test the password
    const testResult = await pool.query('SELECT password FROM users WHERE email = $1', [email]);
    const isMatch = await bcrypt.compare(password, testResult.rows[0].password);
    console.log('✅ Password verification test:', isMatch);
    
  } catch (error) {
    console.error('❌ Error recreating admin:', error);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

recreateAdmin();
