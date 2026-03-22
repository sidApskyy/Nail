// TEST API: Debug completed works endpoint
const { query } = require('./src/config/db');

async function testCompletedWorks() {
  try {
    console.log('=== TESTING COMPLETED WORKS API ===');
    
    // 1. Test raw database query
    console.log('\n1. Raw database query:');
    const rawResult = await query(`
      SELECT cw.*, 
             COALESCE(cw.uploaded_by_name, u.name, 'Unknown') AS uploaded_by_name,
             u.email AS uploaded_by_email
      FROM completed_works cw
      LEFT JOIN users u ON u.id = cw.uploaded_by
      ORDER BY cw.created_at DESC
      LIMIT 3
    `);
    
    console.log('Raw result:', rawResult.rows);
    
    // 2. Test repository function
    console.log('\n2. Repository function:');
    const completedRepo = require('./src/repositories/completedWork.repository');
    const repoResult = await completedRepo.listAll();
    console.log('Repo result:', repoResult);
    
    // 3. Test service function
    console.log('\n3. Service function:');
    const completedWorkService = require('./src/services/completedWork.service');
    const serviceResult = await completedWorkService.listAllCompletedWorks();
    console.log('Service result:', serviceResult);
    
    // 4. Check completed_works table structure
    console.log('\n4. Table structure:');
    const structure = await query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'completed_works'
      ORDER BY ordinal_position
    `);
    console.log('Table structure:', structure.rows);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testCompletedWorks();
