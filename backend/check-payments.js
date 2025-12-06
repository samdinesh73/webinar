const mysql = require('mysql2/promise');

// Database connection config
const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'webinar',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function checkPayments() {
  try {
    const connection = await pool.getConnection();
    
    console.log('\n========== PAYMENT RECORDS ==========\n');
    
    // Get all payments
    const [payments] = await connection.query(`
      SELECT 
        id,
        user_id,
        txn_id,
        amount,
        plan_id,
        status,
        created_at,
        updated_at
      FROM payments 
      ORDER BY created_at DESC 
      LIMIT 10
    `);
    
    if (payments.length === 0) {
      console.log('❌ No payment records found');
    } else {
      console.log(`✓ Found ${payments.length} payment record(s):\n`);
      
      payments.forEach((payment, index) => {
        console.log(`[${index + 1}] ID: ${payment.id}`);
        console.log(`    User ID: ${payment.user_id}`);
        console.log(`    Transaction ID: ${payment.txn_id}`);
        console.log(`    Amount: ₹${payment.amount}`);
        console.log(`    Plan: ${payment.plan_id}`);
        console.log(`    Status: ${payment.status} ${payment.status === 'success' ? '✓' : '❌'}`);
        console.log(`    Created: ${new Date(payment.created_at).toLocaleString()}`);
        console.log(`    Updated: ${new Date(payment.updated_at).toLocaleString()}`);
        console.log('');
      });
    }
    
    // Check status distribution
    const [statusCount] = await connection.query(`
      SELECT status, COUNT(*) as count 
      FROM payments 
      GROUP BY status
    `);
    
    console.log('\n========== STATUS SUMMARY ==========\n');
    statusCount.forEach(row => {
      console.log(`${row.status.toUpperCase()}: ${row.count}`);
    });
    
    connection.release();
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkPayments();
