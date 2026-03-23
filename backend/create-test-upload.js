const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Create a test image file in uploads directory
const createTestImage = () => {
  const uploadsDir = path.join(process.cwd(), 'uploads');
  
  // Ensure directory exists
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  // Create a simple test image (1x1 pixel PNG in base64)
  const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  const testImageBuffer = Buffer.from(testImageBase64, 'base64');
  
  const testImagePath = path.join(uploadsDir, 'test-image.png');
  fs.writeFileSync(testImagePath, testImageBuffer);
  
  console.log('✅ Test image created at:', testImagePath);
  return testImagePath;
};

// Update database to reference this test image
const updateDatabaseWithTestImage = async () => {
  const pool = new Pool({
    connectionString: 'postgresql://postgres.wbmkcwkfcwquyhvcpupi:jkIip9hPr4vdAWBg@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    // Find a completed work without an image and update it
    const result = await pool.query(
      `UPDATE completed_works 
       SET image_url = '/uploads/test-image.png' 
       WHERE id = (
         SELECT id FROM completed_works 
         WHERE image_url IS NULL 
         LIMIT 1
       )
       RETURNING id, customer_name, image_url`
    );
    
    if (result.rows.length > 0) {
      console.log('✅ Database updated with test image:');
      console.log(`   ID: ${result.rows[0].id}`);
      console.log(`   Customer: ${result.rows[0].customer_name}`);
      console.log(`   Image URL: ${result.rows[0].image_url}`);
    } else {
      console.log('ℹ️  No completed works found to update');
    }
  } catch (error) {
    console.error('❌ Error updating database:', error.message);
  } finally {
    await pool.end();
  }
};

// Main function
const main = async () => {
  console.log('🔧 Creating test upload setup...');
  
  try {
    // Create test image
    const imagePath = createTestImage();
    
    // Update database
    await updateDatabaseWithTestImage();
    
    console.log('🎉 Test upload setup completed!');
    console.log('📷 Test image URL: https://nail-backend-8eda.onrender.com/uploads/test-image.png');
    console.log('🔍 Debug endpoint: https://nail-backend-8eda.onrender.com/debug/uploads');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

main();
