const { Pool } = require('pg');

// Test different connection strings
const connections = [
  'postgresql://postgres:jkIip9hPr4vdAWBg@db.wbmkcwkfcwquyhvcpupi.supabase.co:5432/postgres?sslmode=require',
  'postgres://postgres:jkIip9hPr4vdAWBg@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require',
  'postgresql://postgres:jkIip9hPr4vdAWBg@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require'
];

async function testConnection(connectionString, name) {
  console.log(`\n🔍 Testing ${name}...`);
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log(`✅ ${name}: SUCCESS - ${result.rows[0].now}`);
    client.release();
  } catch (error) {
    console.log(`❌ ${name}: FAILED - ${error.message}`);
  } finally {
    await pool.end();
  }
}

async function runTests() {
  console.log('🧪 Testing Database Connections...\n');
  
  for (let i = 0; i < connections.length; i++) {
    await testConnection(connections[i], `Connection ${i + 1}`);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between tests
  }
  
  console.log('\n🎯 Use the successful connection string in Render DATABASE_URL');
}

runTests().catch(console.error);
