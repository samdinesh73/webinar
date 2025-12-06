#!/usr/bin/env node

/**
 * Quick Payment Flow Tester
 * Helps verify the entire payment flow without manually testing PayU
 */

const readline = require('readline');
const mysql = require('mysql2/promise');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
  console.log('\n========== PayU Payment Flow Tester ==========\n');

  try {
    // Database connection
    const pool = mysql.createPool({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'webinar',
    });

    const connection = await pool.getConnection();

    console.log('✓ Connected to database\n');

    // 1. Check if there are any pending payments
    console.log('📋 Checking for pending payments...\n');
    const [pendingPayments] = await connection.query(
      "SELECT * FROM payments WHERE status = 'pending' ORDER BY created_at DESC LIMIT 5"
    );

    if (pendingPayments.length === 0) {
      console.log('❌ No pending payments found');
      console.log('You need to complete a payment first!\n');
      connection.release();
      pool.end();
      rl.close();
      return;
    }

    console.log(`✓ Found ${pendingPayments.length} pending payment(s):\n`);
    pendingPayments.forEach((p, i) => {
      console.log(`${i + 1}. ID: ${p.id} | User: ${p.user_id} | Amount: ₹${p.amount} | TXN: ${p.txn_id}`);
    });
    console.log('');

    // 2. Ask which payment to confirm
    const choice = await question('Which payment to confirm as SUCCESS? (Enter number): ');
    const selectedPayment = pendingPayments[parseInt(choice) - 1];

    if (!selectedPayment) {
      console.log('❌ Invalid choice');
      connection.release();
      pool.end();
      rl.close();
      return;
    }

    console.log(`\nConfirming payment for txnid: ${selectedPayment.txn_id}...\n`);

    // 3. Update the payment status
    const result = await connection.query(
      "UPDATE payments SET status = 'success', updated_at = NOW() WHERE txn_id = ?",
      [selectedPayment.txn_id]
    );

    console.log('✓ Payment status updated to SUCCESS\n');

    // 4. Show updated record
    const [updated] = await connection.query(
      'SELECT * FROM payments WHERE txn_id = ?',
      [selectedPayment.txn_id]
    );

    console.log('Updated Payment Record:');
    console.log(`  ID: ${updated[0].id}`);
    console.log(`  User ID: ${updated[0].user_id}`);
    console.log(`  Transaction ID: ${updated[0].txn_id}`);
    console.log(`  Amount: ₹${updated[0].amount}`);
    console.log(`  Plan: ${updated[0].plan_id}`);
    console.log(`  Status: ${updated[0].status} ✅`);
    console.log(`  Created: ${new Date(updated[0].created_at).toLocaleString()}`);
    console.log(`  Updated: ${new Date(updated[0].updated_at).toLocaleString()}`);
    console.log('');

    // 5. Verify Videos will be accessible
    console.log('📹 Checking if videos will be accessible...');
    const [userPayments] = await connection.query(
      "SELECT * FROM payments WHERE user_id = ? AND status = 'success' ORDER BY created_at DESC LIMIT 1",
      [updated[0].user_id]
    );

    if (userPayments.length > 0) {
      console.log(`✓ User ${updated[0].user_id} can now access videos (successful payment found)\n`);
    }

    connection.release();
    pool.end();

    console.log('========================================');
    console.log('✅ Payment Flow Test Complete!');
    console.log('========================================\n');

    rl.close();

  } catch (error) {
    console.error('❌ Error:', error.message);
    rl.close();
  }
}

main();
