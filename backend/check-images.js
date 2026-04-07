const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.wbmkcwkfcwquyhvcpupi:jkIip9hPr4vdAWBg@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function checkImages() {
  try {
    const result = await pool.query('SELECT image_url FROM completed_works WHERE image_url IS NOT NULL LIMIT 3');
    console.log('Sample image URLs from database:');
    result.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.image_url}`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkImages();
