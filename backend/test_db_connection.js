const { query } = require('./src/config/db');

async function checkColumns() {
  try {
    console.log('Checking completed_works table columns...');
    
    const result = await query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'completed_works' 
      ORDER BY ordinal_position
    `);
    
    console.log('Table structure:');
    result.rows.forEach(row => {
      console.log(`- ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable}, default: ${row.column_default})`);
    });
    
    // Check for new columns
    const newColumns = ['amount', 'discount', 'total', 'description'];
    const existingColumns = result.rows.map(r => r.column_name);
    const missingColumns = newColumns.filter(col => !existingColumns.includes(col));
    
    if (missingColumns.length === 0) {
      console.log('\n✅ All new pricing columns exist!');
    } else {
      console.log(`\n❌ Missing columns: ${missingColumns.join(', ')}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkColumns();
