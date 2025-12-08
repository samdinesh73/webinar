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
const allowedOrigins = [
  'https://webinar-three.vercel.app',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
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
      { id: user.id, email: user.email, name: user.name, role: user.role || 'user' },
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
        role: user.role || 'user',
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
    const [users] = await connection.query('SELECT id, name, email, phone, role, created_at FROM user WHERE id = ?', [
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
    
    // Fetch classes from database based on plan
    const connection = await pool.getConnection();
    let query = 'SELECT * FROM classes WHERE (plan_id = ? OR plan_id = "all") ORDER BY class_date ASC';
    const [dbClasses] = await connection.query(query, [planId]);
    connection.release();

    console.log(`📧 Fetched ${dbClasses.length} classes for plan: ${planId}`);

    // Format classes for email
    const classRows = (dbClasses && dbClasses.length > 0) ? 
      dbClasses.map(cls => {
        // Format date and time
        const classDate = new Date(cls.class_date);
        const formattedDate = classDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const [hours, minutes] = cls.class_time.split(':');
        const formattedTime = new Date(0, 0, 0, hours, minutes).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true
        });
        
        return `
          <tr style="border-bottom: 1px solid #f0f0f0;">
            <td style="padding: 12px; color: #333;"><strong>${cls.title}</strong><br/><span style="font-size: 12px; color: #999;">Instructor: ${cls.instructor}</span></td>
            <td style="padding: 12px; color: #666; text-align: right;"><strong>${formattedDate} at ${formattedTime}</strong><br/><span style="font-size: 12px; color: #999;">${cls.duration_minutes} minutes</span></td>
          </tr>
        `;
      }).join('')
      : '<tr><td colspan="2" style="padding: 12px; text-align: center; color: #999;">No classes scheduled yet</td></tr>';

    // Determine plan title and benefits
    const planTitles = {
      pro: 'PRO MASTERCLASS',
      basic: 'BASIC MASTERCLASS',
      free: 'FREE MASTERCLASS'
    };

    const planBenefits = {
      pro: {
        access: 'Lifetime access to all recordings',
        bonus: 'Q&A sessions, Priority support, Exclusive community'
      },
      basic: {
        access: '30 days access to recordings',
        bonus: 'Community access'
      },
      free: {
        access: '7 days access to recording',
        bonus: 'Basic community access'
      }
    };

    const planTitle = planTitles[planId] || 'MASTERCLASS';
    const benefits = planBenefits[planId] || planBenefits.free;

    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: userEmail,
      subject: `🎓 Your Class Schedule - ${planTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">🎓 Class Details</h1>
            <p style="color: #e0e0ff; margin: 5px 0 0 0;">${planTitle}</p>
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
                <li>Access: ${benefits.access}</li>
              </ul>
            </div>

            <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50;">
              <p style="margin: 0; color: #1b5e20; font-size: 14px;">
                <strong>🎁 What's Included:</strong><br/>
                ${benefits.bonus}
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
    const { firstname, email, phone, amount, planId, classId } = req.body;
    const userId = req.user.id;

    console.log('=== Payment Initiate ===');
    console.log('User ID:', userId);
    console.log('Amount:', amount);
    console.log('Plan ID:', planId);
    console.log('Class ID:', classId);

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
      'INSERT INTO payments (user_id, txn_id, amount, plan_id, class_id, status, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [userId, txnid, amount, planId, classId || null, 'pending']
    );
    
    console.log('Payment record inserted:', insertResult);
    connection.release();

    // Create hash for PayU - CORRECT FORMULA
    // Hash = SHA512(key|txnid|amount|productinfo|firstname|email|||||||||||||salt)
    const productinfo = classId ? `Flipkart Masterclass - Class Registration` : `Flipkart Masterclass - ${planId}`;
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
  let connection;
  try {
    const { txnid } = req.body;

    console.log('\n========== PAYMENT SUCCESS ENDPOINT ==========');
    console.log('Received txnid:', txnid);
    console.log('Request body:', req.body);

    // Validate txnid
    if (!txnid) {
      console.warn('❌ No txnid provided');
      return res.status(400).json({ 
        success: false, 
        message: 'txnid is required' 
      });
    }

    // Get database connection
    connection = await pool.getConnection();
    
    // Check if payment record exists
    console.log('Checking for payment with txnid:', txnid);
    const [payments] = await connection.query(
      'SELECT * FROM payments WHERE txn_id = ? LIMIT 1',
      [txnid]
    );

    if (!payments || payments.length === 0) {
      console.warn('❌ Payment record not found for txnid:', txnid);
      await connection.release();
      return res.json({ 
        success: false, 
        message: 'Payment not found',
        txnid: txnid
      });
    }

    const payment = payments[0];
    console.log('✓ Payment found:', {
      id: payment.id,
      user_id: payment.user_id,
      amount: payment.amount,
      current_status: payment.status
    });

    // Update payment status
    console.log('Updating payment status to success...');
    await connection.query(
      'UPDATE payments SET status = ?, updated_at = NOW() WHERE id = ?',
      ['success', payment.id]
    );

    console.log('✓ Payment status updated successfully');

    // Get user details
    const [users] = await connection.query(
      'SELECT id, name, email, phone FROM user WHERE id = ?',
      [payment.user_id]
    );

    await connection.release();
    connection = null;

    // Send emails (non-blocking)
    if (users && users.length > 0) {
      const user = users[0];
      console.log('📧 Sending confirmation emails to:', user.email);
      
      const emailData = {
        firstname: user.name,
        email: user.email,
        phone: user.phone,
        amount: payment.amount,
        planId: payment.plan_id,
        txnId: txnid,
      };

      // Fire emails in background
      sendPaymentConfirmationEmail(user.email, emailData).catch(err => {
        console.error('Email error (non-blocking):', err.message);
      });

      sendClassDetailsEmail(user.email, emailData).catch(err => {
        console.error('Email error (non-blocking):', err.message);
      });
    }

    // Return success
    console.log('✓ Payment success endpoint completed successfully\n');
    res.json({ 
      success: true, 
      message: 'Payment recorded successfully',
      txnid: txnid 
    });

  } catch (error) {
    console.error('❌ ERROR in payment success:', error.message);
    console.error('Stack:', error.stack);
    
    if (connection) {
      try {
        await connection.release();
      } catch (e) {
        console.error('Error releasing connection:', e.message);
      }
    }

    res.status(500).json({ 
      success: false, 
      message: 'Error recording payment',
      error: error.message 
    });
  }
});

// Payment Failure Callback
app.post('/api/payment/failure', async (req, res) => {
  let connection;
  try {
    const { txnid } = req.body;

    console.log('\n========== PAYMENT FAILURE ENDPOINT ==========');
    console.log('Received txnid:', txnid);

    if (!txnid) {
      console.warn('No txnid provided in failure callback');
      return res.json({ success: true }); // Still return 200 OK
    }

    connection = await pool.getConnection();
    
    await connection.query(
      'UPDATE payments SET status = ?, updated_at = NOW() WHERE txn_id = ?',
      ['failed', txnid]
    );

    console.log('✓ Payment marked as FAILED for txnid:', txnid);
    await connection.release();
    connection = null;

    res.json({ success: true, message: 'Payment failure recorded' });

  } catch (error) {
    console.error('❌ Payment failure error:', error.message);
    
    if (connection) {
      try {
        await connection.release();
      } catch (e) {
        console.error('Error releasing connection:', e.message);
      }
    }

    res.json({ success: true }); // Still return OK to PayU
  }
});

// Check Payment Status (Protected Route)
app.get('/api/payment/check-status', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('=== Check Payment Status ===');
    console.log('User ID:', userId);

    const connection = await pool.getConnection();
    
    // Get all successful payments for this user
    const [payments] = await connection.query(
      'SELECT id, txn_id, amount, plan_id, class_id, status, created_at FROM payments WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    console.log('All payments for user:', payments);
    connection.release();

    if (payments.length === 0) {
      return res.json({ success: true, status: 'no_payment', registrations: [] });
    }

    // Get latest payment status
    const latestPayment = payments[0];
    
    // Get all class registrations (successful payments with class_id)
    const classRegistrations = payments
      .filter(p => p.status === 'success' && p.class_id)
      .map(p => ({
        paymentId: p.id,
        classId: p.class_id,
        registeredAt: p.created_at,
      }));

    console.log('Class registrations:', classRegistrations);

    res.json({ 
      success: true, 
      status: latestPayment.status,
      latestPayment: {
        id: latestPayment.id,
        txnId: latestPayment.txn_id,
        amount: latestPayment.amount,
        planId: latestPayment.plan_id,
        classId: latestPayment.class_id,
        status: latestPayment.status,
      },
      registrations: classRegistrations, // All class registrations by user
    });
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

// ============= CLASSES ENDPOINTS =============

// Get all upcoming classes
app.get('/api/classes/upcoming', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [classes] = await connection.query(
      'SELECT * FROM classes WHERE class_date >= NOW() ORDER BY class_date ASC'
    );
    connection.release();

    res.json({ success: true, classes });
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({ success: false, message: 'Error fetching classes' });
  }
});

// Get all classes
app.get('/api/classes', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [classes] = await connection.query(
      'SELECT * FROM classes ORDER BY class_date DESC'
    );
    connection.release();

    res.json({ success: true, classes });
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({ success: false, message: 'Error fetching classes' });
  }
});

// Create a new class (Admin only)
app.post('/api/classes', verifyToken, async (req, res) => {
  try {
    const { title, description, instructor, class_date, class_time, duration_minutes, price, plan_id, meeting_link } = req.body;

    // Validate input
    if (!title || !instructor || !class_date || !class_time) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const connection = await pool.getConnection();
    
    const result = await connection.query(
      'INSERT INTO classes (title, description, instructor, class_date, class_time, duration_minutes, price, plan_id, meeting_link, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
      [title, description || null, instructor, class_date, class_time, duration_minutes || 60, price || 999, plan_id || 'all', meeting_link || null]
    );

    connection.release();

    res.status(201).json({ 
      success: true, 
      message: 'Class created successfully',
      classId: result[0].insertId 
    });
  } catch (error) {
    console.error('Error creating class:', error);
    res.status(500).json({ success: false, message: 'Error creating class', error: error.message });
  }
});

// Update a class (Admin only)
app.put('/api/classes/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, instructor, class_date, class_time, duration_minutes, price, plan_id, meeting_link } = req.body;

    const connection = await pool.getConnection();
    
    await connection.query(
      'UPDATE classes SET title = ?, description = ?, instructor = ?, class_date = ?, class_time = ?, duration_minutes = ?, price = ?, plan_id = ?, meeting_link = ? WHERE id = ?',
      [title, description, instructor, class_date, class_time, duration_minutes, price, plan_id, meeting_link, id]
    );

    connection.release();

    res.json({ success: true, message: 'Class updated successfully' });
  } catch (error) {
    console.error('Error updating class:', error);
    res.status(500).json({ success: false, message: 'Error updating class' });
  }
});

// Delete a class (Admin only)
app.delete('/api/classes/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const connection = await pool.getConnection();
    
    await connection.query('DELETE FROM classes WHERE id = ?', [id]);

    connection.release();

    res.json({ success: true, message: 'Class deleted successfully' });
  } catch (error) {
    console.error('Error deleting class:', error);
    res.status(500).json({ success: false, message: 'Error deleting class' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📊 Database: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
  console.log(`🔐 JWT Secret configured`);
});
