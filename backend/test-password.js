const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  connectionString: 'postgresql://postgres.wbmkcwkfcwquyhvcpupi:jkIip9hPr4vdAWBg@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function testPassword() {
  try {
    const result = await pool.query('SELECT password FROM users WHERE email = $1', ['admin@nailhouse.com']);
    
    if (result.rows.length > 0) {
      const hashedPassword = result.rows[0].password;
      console.log('Hashed password from DB:', hashedPassword);
      
      // Test password comparison
      const testPassword = 'Admin123!';
      const isMatch = await bcrypt.compare(testPassword, hashedPassword);
      console.log('Password match:', isMatch);
      
      // Test with different variations
      const variations = ['Admin123!', 'admin@nailhouse.com', 'Admin123', 'admin123!'];
      for (const variation of variations) {
        const match = await bcrypt.compare(variation, hashedPassword);
        console.log(`'${variation}' match:`, match);
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

testPassword();
