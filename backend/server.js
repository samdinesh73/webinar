const express = require('express');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
}));
app.use(express.json());

// MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'webinar',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Verify JWT Token Middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    req.user = decoded;
    next();
  });
};

// Signup Route
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const connection = await pool.getConnection();

    // Check if email already exists
    const [existing] = await connection.query('SELECT id FROM user WHERE email = ?', [email]);
    if (existing.length > 0) {
      connection.release();
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    await connection.query(
      'INSERT INTO user (name, email, password, phone, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
      [name, email, hashedPassword, phone || null]
    );

    connection.release();

    res.status(201).json({ success: true, message: 'User registered successfully' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Login Route
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const connection = await pool.getConnection();

    // Find user by email
    const [users] = await connection.query('SELECT * FROM user WHERE email = ?', [email]);
    connection.release();

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const user = users[0];

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get User Profile (Protected Route)
app.get('/api/auth/profile', verifyToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [users] = await connection.query('SELECT id, name, email, phone, created_at FROM user WHERE id = ?', [
      req.user.id,
    ]);
    connection.release();

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user: users[0] });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Update User Profile (Protected Route)
app.put('/api/auth/profile', verifyToken, async (req, res) => {
  try {
    const { name, phone } = req.body;
    const userId = req.user.id;

    const connection = await pool.getConnection();
    await connection.query('UPDATE user SET name = ?, phone = ?, updated_at = NOW() WHERE id = ?', [
      name,
      phone,
      userId,
    ]);
    connection.release();

    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Logout Route (Frontend will handle token removal)
app.post('/api/auth/logout', verifyToken, (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// PayU Payment Integration

// PayU Configuration
const PAYU_CONFIG = {
  merchantKey: process.env.PAYU_MERCHANT_KEY || 'OlXDnV',
  salt: process.env.PAYU_SALT || 'qZn66aGAOHXG0GvqtQWBXYRJJSI9IDjH',
  baseUrl: process.env.PAYU_BASE_URL || 'https://secure.payu.in', // Use https://test.payu.in for sandbox
};

// CRM Integration function
const sendToCRM = async (userData) => {
  try {
    const crmData = {
      Name: userData.firstname,
      Phone: userData.phone,
      Email: userData.email,
      Amount: userData.amount,
      date: new Date().toISOString().split('T')[0],
      Plan: userData.planId,
    };

    const response = await fetch('https://apps.cratiocrm.com/Customize/Webhooks/webhook.php?id=852354', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(crmData),
    });

    console.log('CRM Webhook sent successfully');
  } catch (error) {
    console.error('CRM integration error:', error.message);
    // Don't fail the payment process if CRM fails
  }
};

// Initiate Payment Route
app.post('/api/payment/initiate', verifyToken, async (req, res) => {
  try {
    const { firstname, email, phone, amount, planId } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!firstname || !email || !phone || amount === undefined) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Generate transaction ID
    const txnid = 'TXN' + Math.random().toString(9).substr(2, 9) + Date.now();

    // Create payment record in database
    const connection = await pool.getConnection();
    await connection.query(
      'INSERT INTO payments (user_id, txn_id, amount, plan_id, status, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [userId, txnid, amount, planId, 'pending']
    );
    connection.release();

    // Create hash for PayU - CORRECT FORMULA
    // Hash = SHA512(key|txnid|amount|productinfo|firstname|email|||||||||||||salt)
    const productinfo = `Flipkart Masterclass - ${planId}`;
    const hashString = `${PAYU_CONFIG.merchantKey}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${PAYU_CONFIG.salt}`;
    
    console.log('Hash String:', hashString);
    
    const hash = crypto
      .createHash('sha512')
      .update(hashString)
      .digest('hex');

    console.log('Generated Hash:', hash);

    // Send to CRM
    await sendToCRM({ firstname, email, phone, amount, planId });

    // Return PayU form data
    res.json({
      success: true,
      payuBaseUrl: PAYU_CONFIG.baseUrl,
      payuData: {
        key: PAYU_CONFIG.merchantKey,
        txnid: txnid,
        amount: amount.toString(),
        productinfo: productinfo,
        firstname: firstname,
        email: email,
        phone: phone,
        surl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success`,
        furl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/failure`,
        hash: hash,
      },
    });
  } catch (error) {
    console.error('Payment initiate error:', error);
    res.status(500).json({ success: false, message: 'Payment initiation failed', error: error.message });
  }
});

// Payment Success Callback
app.post('/api/payment/success', async (req, res) => {
  try {
    const { txnid } = req.body;

    const connection = await pool.getConnection();
    await connection.query(
      'UPDATE payments SET status = ?, updated_at = NOW() WHERE txn_id = ?',
      ['success', txnid]
    );
    connection.release();

    res.json({ success: true, message: 'Payment recorded' });
  } catch (error) {
    console.error('Payment success error:', error);
    res.status(500).json({ success: false, message: 'Error recording payment' });
  }
});

// Payment Failure Callback
app.post('/api/payment/failure', async (req, res) => {
  try {
    const { txnid } = req.body;

    const connection = await pool.getConnection();
    await connection.query(
      'UPDATE payments SET status = ?, updated_at = NOW() WHERE txn_id = ?',
      ['failed', txnid]
    );
    connection.release();

    res.json({ success: true, message: 'Payment failure recorded' });
  } catch (error) {
    console.error('Payment failure error:', error);
    res.status(500).json({ success: false, message: 'Error recording payment failure' });
  }
});

// Check Payment Status (Protected Route)
app.get('/api/payment/check-status', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const connection = await pool.getConnection();
    const [payments] = await connection.query(
      'SELECT status FROM payments WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      [userId]
    );
    connection.release();

    if (payments.length === 0) {
      return res.json({ success: true, status: 'no_payment' });
    }

    const latestPayment = payments[0];
    res.json({ success: true, status: latestPayment.status });
  } catch (error) {
    console.error('Payment status check error:', error);
    res.status(500).json({ success: false, message: 'Error checking payment status' });
  }
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📊 Database: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
  console.log(`🔐 JWT Secret configured`);
});
