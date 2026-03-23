const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function fixCompletedWorkImage() {
  try {
    // Copy test image to uploads with the correct filename
    const sourcePath = path.join(__dirname, 'uploads', 'test-image.png');
    const targetPath = path.join(__dirname, 'uploads', '1774286972658_image00007.jpeg');

    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, targetPath);
      console.log('✅ Test image copied to:', targetPath);
    } else {
      console.log('❌ Source image not found');
      return;
    }

    const pool = new Pool({
      connectionString: 'postgresql://postgres.wbmkcwkfcwquyhvcpupi:jkIip9hPr4vdAWBg@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres',
      ssl: { rejectUnauthorized: false }
    });

    const result = await pool.query(
      'UPDATE completed_works SET image_url = $1 WHERE image_url IS NOT NULL RETURNING id, customer_name, image_url',
      ['/uploads/1774286972658_image00007.jpeg']
    );
    
    if (result.rows.length > 0) {
      console.log('✅ Updated completed work:');
      console.log(`   ID: ${result.rows[0].id}`);
      console.log(`   Customer: ${result.rows[0].customer_name}`);
      console.log(`   Image URL: ${result.rows[0].image_url}`);
    } else {
      console.log('ℹ️  No completed works with images found');
    }

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixCompletedWorkImage();
