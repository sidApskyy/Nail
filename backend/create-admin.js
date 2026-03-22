const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:jkIip9hPr4vdAWBg@db.wbmkcwkfcwquyhvcpupi.supabase.co:5432/postgres',
  ssl: false
});

async function createAdmin() {
  try {
    const email = 'admin@nailhouse.com';
    const password = 'Admin123!';
    const name = 'Admin';
    
    console.log('Creating admin user...');
    
    // Check if admin exists
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length) {
      console.log('Admin already exists:', existing.rows[0].id);
      return;
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);
    
    // Insert admin
    const insert = await pool.query(
      `INSERT INTO users (name, email, password, role, created_by, is_active)
       VALUES ($1, $2, $3, 'admin', NULL, TRUE)
       RETURNING id, email, role`,
      [name, email, passwordHash]
    );
    
    console.log('✅ Admin created successfully:', insert.rows[0]);
    console.log('📧 Login with:', email);
    console.log('🔑 Password:', password);
    
  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

createAdmin();
