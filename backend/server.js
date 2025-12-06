const express = require('express');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Email Configuration
// Supports Gmail, SendGrid, Mailgun, and custom SMTP servers
const emailConfig = {
  // Gmail (default)
  service: process.env.EMAIL_SERVICE || 'gmail',
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true' ? true : false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password',
  },
};

const transporter = nodemailer.createTransport(emailConfig);

// Verify email configuration
transporter.verify((error, success) => {
  if (error) {
    console.warn('⚠️  Email configuration issue:', error.message);
    console.warn('Emails will not be sent. Configure EMAIL settings in .env');
    console.warn('Email Config:', {
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.secure,
      user: emailConfig.auth.user,
    });
  } else {
    console.log('✅ Email service is ready');
    console.log('   SMTP Host:', emailConfig.host);
    console.log('   SMTP Port:', emailConfig.port);
    console.log('   User:', emailConfig.auth.user);
  }
});

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

// Email sending function - Payment Confirmation
const sendPaymentConfirmationEmail = async (userEmail, userData) => {
  try {
    const { firstname, amount, planId, txnId } = userData;
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: userEmail,
      subject: '💳 Payment Confirmation - Flipkart Masterclass',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">Payment Successful! ✅</h1>
          </div>
          
          <div style="padding: 30px; background-color: #f9f9f9;">
            <p style="font-size: 16px; color: #333;">Dear <strong>${firstname}</strong>,</p>
            
            <p style="font-size: 14px; color: #666; line-height: 1.6;">
              Thank you for your payment! We've successfully received your payment for the Flipkart Masterclass.
            </p>

            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e0e0e0;">
              <h3 style="color: #667eea; margin-top: 0;">Payment Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; color: #666;"><strong>Plan:</strong></td>
                  <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; color: #333; text-align: right;"><strong>${planId.toUpperCase()}</strong></td>
                </tr>
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; color: #666;"><strong>Amount Paid:</strong></td>
                  <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; color: #333; text-align: right;"><strong>₹${amount}</strong></td>
                </tr>
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; color: #666;"><strong>Transaction ID:</strong></td>
                  <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; color: #333; text-align: right; font-family: monospace;"><strong>${txnId}</strong></td>
                </tr>
                <tr>
                  <td style="padding: 10px; color: #666;"><strong>Date:</strong></td>
                  <td style="padding: 10px; color: #333; text-align: right;"><strong>${new Date().toLocaleDateString()}</strong></td>
                </tr>
              </table>
            </div>

            <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196f3;">
              <p style="margin: 0; color: #1565c0; font-size: 14px;">
                <strong>💡 Next Steps:</strong> You can now access all the masterclasses on your dashboard. Check your email for the class schedule and access details.
              </p>
            </div>

            <p style="font-size: 14px; color: #666; line-height: 1.6;">
              If you have any questions about your registration or the masterclass, feel free to reach out to us.
            </p>

            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              Best regards,<br/>
              <strong>Flipkart Masterclass Team</strong>
            </p>
          </div>

          <div style="background: #f0f0f0; padding: 15px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; color: #999;">
            <p style="margin: 0;">© 2025 Flipkart Masterclass. All rights reserved.</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✓ Payment confirmation email sent to:', userEmail, 'Message ID:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending payment confirmation email:', error.message);
    return false;
  }
};

// Email sending function - Class Details
const sendClassDetailsEmail = async (userEmail, userData) => {
  try {
    const { firstname, planId } = userData;
    
    // Class details based on plan
    const classDetails = {
      pro: {
        title: 'PRO MASTERCLASS',
        classes: [
          { name: 'E-commerce Growth Hacking', instructor: 'Amitabh Kumar', date: '12 Dec, 7:00 PM', duration: '2 hours' },
          { name: 'Packaging Design Secrets', instructor: 'Rahul Sharma', date: '14 Dec, 6:00 PM', duration: '1.5 hours' },
          { name: 'Advanced SEO & Traffic', instructor: 'Priya Singh', date: '16 Dec, 7:00 PM', duration: '2 hours' },
          { name: 'Customer Psychology & Sales', instructor: 'Vikram Patel', date: '18 Dec, 6:30 PM', duration: '1.5 hours' },
          { name: 'Supply Chain Optimization', instructor: 'Neha Gupta', date: '20 Dec, 7:00 PM', duration: '2 hours' },
          { name: 'Building Your Brand Story', instructor: 'Arjun Menon', date: '22 Dec, 6:00 PM', duration: '1.5 hours' },
        ],
        access: 'Lifetime access to all recordings',
        bonus: 'Q&A sessions, Priority support, Exclusive community'
      },
      basic: {
        title: 'BASIC MASTERCLASS',
        classes: [
          { name: 'E-commerce Fundamentals', instructor: 'Amitabh Kumar', date: '12 Dec, 7:00 PM', duration: '2 hours' },
          { name: 'Product Photography 101', instructor: 'Rahul Sharma', date: '14 Dec, 6:00 PM', duration: '1.5 hours' },
        ],
        access: '30 days access to recordings',
        bonus: 'Community access'
      },
      free: {
        title: 'FREE MASTERCLASS',
        classes: [
          { name: 'Introduction to E-commerce', instructor: 'Amitabh Kumar', date: '12 Dec, 7:00 PM', duration: '1 hour' },
        ],
        access: '7 days access to recording',
        bonus: 'Basic community access'
      }
    };

    const details = classDetails[planId] || classDetails.free;
    const classRows = details.classes.map(cls => `
      <tr style="border-bottom: 1px solid #f0f0f0;">
        <td style="padding: 12px; color: #333;"><strong>${cls.name}</strong><br/><span style="font-size: 12px; color: #999;">Instructor: ${cls.instructor}</span></td>
        <td style="padding: 12px; color: #666; text-align: right;"><strong>${cls.date}</strong><br/><span style="font-size: 12px; color: #999;">${cls.duration}</span></td>
      </tr>
    `).join('');

    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: userEmail,
      subject: `🎓 Your Class Schedule - ${details.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">🎓 Class Details</h1>
            <p style="color: #e0e0ff; margin: 5px 0 0 0;">${details.title}</p>
          </div>
          
          <div style="padding: 30px; background-color: #f9f9f9;">
            <p style="font-size: 16px; color: #333;">Hi <strong>${firstname}</strong>,</p>
            
            <p style="font-size: 14px; color: #666; line-height: 1.6;">
              Welcome to Flipkart Masterclass! Here are all the sessions you'll be attending:
            </p>

            <div style="background: white; padding: 0; border-radius: 8px; margin: 20px 0; border: 1px solid #e0e0e0; overflow: hidden;">
              <table style="width: 100%; border-collapse: collapse;">
                ${classRows}
              </table>
            </div>

            <div style="background: #fff3e0; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff9800;">
              <p style="margin: 0; color: #e65100; font-size: 14px;">
                <strong>📌 Important Notes:</strong>
              </p>
              <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #e65100; font-size: 13px;">
                <li>Classes are held live on the scheduled dates and times (IST)</li>
                <li>Recordings will be available within 24 hours after each session</li>
                <li>Join 15 minutes early for Q&A and networking</li>
                <li>Access: ${details.access}</li>
              </ul>
            </div>

            <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50;">
              <p style="margin: 0; color: #1b5e20; font-size: 14px;">
                <strong>🎁 What's Included:</strong><br/>
                ${details.bonus}
              </p>
            </div>

            <div style="background: #f3e5f5; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #9c27b0;">
              <p style="margin: 0; color: #6a1b9a; font-size: 14px;">
                <strong>🔗 Quick Links:</strong>
              </p>
              <p style="margin: 10px 0 0 0; font-size: 13px; color: #6a1b9a;">
                <a href="http://localhost:3000/dashboard" style="color: #9c27b0; text-decoration: none;">👉 Go to Dashboard</a> | 
                <a href="http://localhost:3000/videos" style="color: #9c27b0; text-decoration: none;">📹 View Videos</a>
              </p>
            </div>

            <p style="font-size: 14px; color: #666; line-height: 1.6; margin-top: 20px;">
              If you have any questions or need technical support, please reply to this email or contact our support team.
            </p>

            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              See you in the class!<br/>
              <strong>Flipkart Masterclass Team</strong>
            </p>
          </div>

          <div style="background: #f0f0f0; padding: 15px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; color: #999;">
            <p style="margin: 0;">© 2025 Flipkart Masterclass. All rights reserved.</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✓ Class details email sent to:', userEmail, 'Message ID:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending class details email:', error.message);
    return false;
  }
};

// Initiate Payment Route
app.post('/api/payment/initiate', verifyToken, async (req, res) => {
  try {
    const { firstname, email, phone, amount, planId } = req.body;
    const userId = req.user.id;

    console.log('=== Payment Initiate ===');
    console.log('User ID:', userId);
    console.log('Amount:', amount);
    console.log('Plan ID:', planId);

    // Validate input
    if (!firstname || !email || !phone || amount === undefined) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Generate transaction ID
    const txnid = 'TXN' + Math.random().toString(9).substr(2, 9) + Date.now();
    
    console.log('Generated Transaction ID:', txnid);

    // Create payment record in database
    const connection = await pool.getConnection();
    const insertResult = await connection.query(
      'INSERT INTO payments (user_id, txn_id, amount, plan_id, status, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [userId, txnid, amount, planId, 'pending']
    );
    
    console.log('Payment record inserted:', insertResult);
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

    console.log('=== Payment Success Endpoint (Frontend Callback) ===');
    console.log('Received txnid:', txnid);
    console.log('Full body:', req.body);

    if (!txnid) {
      console.warn('⚠️  WARNING: No txnid provided in request body!');
      console.warn('This means PayU might not have sent the txnid in the redirect URL');
      return res.status(400).json({ success: false, message: 'txnid is required' });
    }

    const connection = await pool.getConnection();
    
    // First, check if the transaction exists in database
    const [existingPayment] = await connection.query(
      'SELECT * FROM payments WHERE txn_id = ?',
      [txnid]
    );
    
    console.log('Existing payment record:', existingPayment);

    if (!existingPayment || existingPayment.length === 0) {
      console.log('❌ No matching payment found for txnid:', txnid);
      connection.release();
      return res.status(404).json({ success: false, message: 'Payment record not found', txnid: txnid });
    }

    const payment = existingPayment[0];
    const userId = payment.user_id;

    // Get user details for email
    const [userData] = await connection.query(
      'SELECT name, email, phone FROM user WHERE id = ?',
      [userId]
    );

    const result = await connection.query(
      'UPDATE payments SET status = ?, updated_at = NOW() WHERE txn_id = ?',
      ['success', txnid]
    );
    
    console.log('Update result:', result);
    console.log('✓ Payment marked as SUCCESS for txnid:', txnid);
    
    connection.release();

    // Send emails after successful payment update
    if (userData && userData.length > 0) {
      const user = userData[0];
      const emailData = {
        firstname: user.name,
        email: user.email,
        phone: user.phone,
        amount: payment.amount,
        planId: payment.plan_id,
        txnId: txnid,
      };

      console.log('📧 Sending confirmation emails to:', user.email);
      
      // Send both emails in parallel
      Promise.all([
        sendPaymentConfirmationEmail(user.email, emailData),
        sendClassDetailsEmail(user.email, emailData),
      ]).then(results => {
        console.log('✓ Payment confirmation email sent:', results[0]);
        console.log('✓ Class details email sent:', results[1]);
      }).catch(error => {
        console.error('Error sending emails:', error);
      });
    }

    res.json({ success: true, message: 'Payment recorded', txnid: txnid });
  } catch (error) {
    console.error('Payment success error:', error);
    res.status(500).json({ success: false, message: 'Error recording payment', error: error.message });
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

// PayU Webhook - Server-to-Server notification
// PayU sends this when payment is completed
app.post('/api/payment/webhook', async (req, res) => {
  try {
    console.log('\n========== PayU Webhook Received ==========');
    console.log('Full Body:', JSON.stringify(req.body, null, 2));
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    
    const { txnid, status, paymentRelatedDetail } = req.body;
    
    console.log('Extracted from webhook:');
    console.log('  txnid:', txnid);
    console.log('  status:', status);
    console.log('  paymentRelatedDetail:', paymentRelatedDetail);

    if (!txnid) {
      console.warn('No txnid in webhook');
      return res.json({ success: true }); // PayU expects 200 OK
    }

    // Update payment status based on PayU webhook
    const connection = await pool.getConnection();
    const paymentStatus = status === 'success' ? 'success' : 'failed';
    
    await connection.query(
      'UPDATE payments SET status = ?, updated_at = NOW() WHERE txn_id = ?',
      [paymentStatus, txnid]
    );
    
    console.log(`✓ Payment status updated to '${paymentStatus}' for txnid: ${txnid}`);
    connection.release();

    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.json({ success: true }); // Always return 200 to acknowledge receipt
  }
});

// Manual payment confirmation endpoint (for testing)
app.post('/api/payment/confirm/:txnid', async (req, res) => {
  try {
    const { txnid } = req.params;
    
    console.log(`\nManually confirming payment for txnid: ${txnid}`);
    
    const connection = await pool.getConnection();
    const [payment] = await connection.query(
      'SELECT * FROM payments WHERE txn_id = ?',
      [txnid]
    );

    if (!payment || payment.length === 0) {
      connection.release();
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    await connection.query(
      'UPDATE payments SET status = ?, updated_at = NOW() WHERE txn_id = ?',
      ['success', txnid]
    );
    
    console.log(`✓ Payment confirmed for txnid: ${txnid}`);
    connection.release();

    res.json({ success: true, message: 'Payment confirmed', txnid });
  } catch (error) {
    console.error('Manual confirm error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Test Email Endpoint (for development/testing)
app.get('/api/test-email/:email/:plan', async (req, res) => {
  try {
    const { email, plan } = req.params;
    
    if (!email || !plan) {
      return res.status(400).json({ success: false, message: 'Email and plan required' });
    }

    const testData = {
      firstname: 'Test User',
      email: email,
      amount: plan === 'pro' ? 2999 : plan === 'basic' ? 1 : 0,
      planId: plan,
      txnId: 'TXN-TEST-' + Date.now(),
    };

    console.log(`\n📧 Sending test emails to: ${email}`);
    
    const results = await Promise.all([
      sendPaymentConfirmationEmail(email, testData),
      sendClassDetailsEmail(email, testData),
    ]);

    res.json({ 
      success: true, 
      message: 'Test emails sent successfully',
      paymentConfirmation: results[0],
      classDetails: results[1]
    });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ success: false, message: error.message });
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
