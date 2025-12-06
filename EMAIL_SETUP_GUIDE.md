# 📧 Email Configuration Guide

## Overview
After a successful payment, the system now sends **2 automated emails**:
1. **Payment Confirmation Email** - Contains payment details and transaction ID
2. **Class Details Email** - Contains the masterclass schedule and access information

---

## SMTP Configuration

### Gmail (Default)
```env
EMAIL_SERVICE=gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
```

### SendGrid
```env
EMAIL_SERVICE=sendgrid
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_USER=apikey
EMAIL_PASSWORD=SG.xxxxxxxxxxxx
```

### AWS SES
```env
EMAIL_SERVICE=ses
SMTP_HOST=email-smtp.region.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_USER=your-ses-username
EMAIL_PASSWORD=your-ses-password
```

### Mailgun
```env
EMAIL_SERVICE=mailgun
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_USER=postmaster@your-domain.com
EMAIL_PASSWORD=your-mailgun-password
```

### For Port 465 (SSL)
```env
SMTP_PORT=465
SMTP_SECURE=true
```

---

## Setup Instructions

### Step 1: Enable Gmail App Password

1. Go to your Google Account: https://myaccount.google.com
2. Click on **"Security"** in the left sidebar
3. Enable **"2-Step Verification"** if not already enabled
   - Follow the on-screen instructions
4. After enabling 2FA, go back to Security settings
5. Find **"App passwords"** near the bottom
6. Select **Mail** and **Windows** 
7. Google will generate a **16-character password**
   - Example: `abcd efgh ijkl mnop` (without spaces)

### Step 2: Update .env File

In `backend/.env`, add:

```env
EMAIL_USER=your-actual-email@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop
```

**Do NOT use your regular Gmail password!** Use the 16-character app password instead.

### Step 3: Test Email Configuration

The backend will verify email on startup. You should see:

```
✅ Email service is ready
```

If you see an error:
```
⚠️  Email configuration issue
```

Then check your EMAIL_USER and EMAIL_PASSWORD in .env

---

## What Users Will Receive

### Email 1: Payment Confirmation
- **Subject:** 💳 Payment Confirmation - Flipkart Masterclass
- **Contains:**
  - Payment status (✅ Successful)
  - Plan purchased (Pro/Basic/Free)
  - Amount paid
  - Transaction ID
  - Date of payment
  - Next steps link

### Email 2: Class Details
- **Subject:** 🎓 Your Class Schedule - [PLAN NAME]
- **Contains:**
  - Personalized greeting
  - Complete class schedule with:
    - Class name
    - Instructor name
    - Date and time
    - Duration
  - Access details (how long they can access)
  - Bonus features included
  - Important notes and tips
  - Quick action links to dashboard/videos

---

## Email Templates

### For Different Plans:

**PRO PLAN:**
- 6 masterclasses included
- Lifetime access to recordings
- Bonus: Q&A sessions, Priority support, Exclusive community

**BASIC PLAN:**
- 2 masterclasses included
- 30 days access to recordings
- Bonus: Community access

**FREE PLAN:**
- 1 masterclass included
- 7 days access to recording
- Bonus: Basic community access

---

## Troubleshooting

### Emails Not Being Sent

**Check 1: Email Configuration**
```
Backend console should show: "✅ Email service is ready"
```

**Check 2: Correct Credentials**
```
- EMAIL_USER should be your Gmail address
- EMAIL_PASSWORD should be the 16-character app password (NOT your regular password)
```

**Check 3: Enable "Less secure app access" (Optional fallback)
```
If app passwords don't work:
1. Go to https://myaccount.google.com/lesssecureapps
2. Turn ON "Less secure app access"
(Not recommended for security reasons)
```

**Check 4: Backend Logs**
```
Look for these messages in backend console:

✓ Payment confirmation email sent to: user@gmail.com
✓ Class details email sent to: user@gmail.com

Or errors like:
✗ Error sending payment confirmation email: [error message]
```

---

## Email Flow in Code

### When Payment Succeeds:

```
1. Frontend calls: POST /api/payment/success { txnid }
   ↓
2. Backend updates: status = 'success' in database
   ↓
3. Backend queries: Get user details (name, email)
   ↓
4. Backend calls: sendPaymentConfirmationEmail()
   ↓
5. Backend calls: sendClassDetailsEmail()
   ↓
6. Both emails sent in parallel ⚡
   ↓
7. Frontend shows: "Payment Successful!"
   ↓
8. User receives: 2 emails in inbox ✉️
```

---

## File Locations

- **Email Setup:** `backend/server.js` (Lines 8-33)
- **Payment Confirmation:** `backend/server.js` (Lines 309-380)
- **Class Details:** `backend/server.js` (Lines 382-500)
- **Send Trigger:** `backend/server.js` (Lines 574-586)
- **Configuration:** `backend/.env`

---

## Production Considerations

### Using Different Email Provider (Optional)

Instead of Gmail, you can use:

**SendGrid:**
```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  auth: {
    user: 'apikey',
    pass: 'SG.xxxxxxxxxxxx'
  }
});
```

**AWS SES:**
```javascript
const transporter = nodemailer.createTransport({
  host: 'email-smtp.region.amazonaws.com',
  port: 587,
  auth: {
    user: 'AKIAIOSFODNN7EXAMPLE',
    pass: 'XXXXX'
  }
});
```

**Mailgun:**
```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.mailgun.org',
  port: 587,
  auth: {
    user: 'postmaster@example.com',
    pass: 'XXXXX'
  }
});
```

### Security Best Practices

1. ✅ Never commit `.env` to git repository
2. ✅ Use app passwords, not your actual password
3. ✅ Rotate email credentials periodically
4. ✅ Use HTTPS in production
5. ✅ Add email verification for user accounts
6. ✅ Log email delivery for auditing

---

## Testing

### Manual Test (Without Full Payment Flow)

Create a test endpoint in backend:

```javascript
// Add this temporarily for testing
app.get('/api/test-email/:email', async (req, res) => {
  const testData = {
    firstname: 'Test User',
    email: req.params.email,
    amount: 2999,
    planId: 'pro',
    txnId: 'TXN' + Date.now(),
  };
  
  await sendPaymentConfirmationEmail(req.params.email, testData);
  await sendClassDetailsEmail(req.params.email, testData);
  
  res.json({ success: true, message: 'Test emails sent' });
});
```

Then test:
```bash
curl http://localhost:5000/api/test-email/youremail@gmail.com
```

---

## Support

If emails are not working:

1. Check backend console logs
2. Verify .env configuration
3. Check Gmail account settings
4. Test with Gmail app password first
5. Check spam folder
6. Check if Gmail is blocking the connection

Still having issues? Check the error message in backend console and search for solutions based on the error code.
