# 📮 SMTP Server Reference

## Gmail
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
```

## SendGrid
```
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
```

## AWS SES (Simple Email Service)
```
SMTP_HOST=email-smtp.{REGION}.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false

Regions: us-east-1, us-west-2, eu-west-1, ap-southeast-1, etc.
```

## Mailgun
```
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
```

## Office 365 / Outlook
```
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
```

## Yahoo Mail
```
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
```

## Zoho Mail
```
SMTP_HOST=smtp.zoho.com
SMTP_PORT=587
SMTP_SECURE=false
```

## Brevo (formerly Sendinblue)
```
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_SECURE=false
```

## Custom Server (with TLS)
```
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
SMTP_SECURE=false
```

## Custom Server (with SSL)
```
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=465
SMTP_SECURE=true
```

---

## Port Reference

- **Port 25**: Standard SMTP (not recommended - often blocked)
- **Port 587**: SMTP with STARTTLS (recommended for TLS) - SMTP_SECURE=false
- **Port 465**: SMTP with SSL/TLS (use for SSL) - SMTP_SECURE=true
- **Port 2525**: Alternative SMTP port

---

## Current Configuration

Your backend automatically reads:

```env
EMAIL_SERVICE=gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_USER=dineshsellerrocket@gmail.com
EMAIL_PASSWORD=psep yzqa lqyy qfhq
```

---

## Testing Your Configuration

Use this command to test SMTP connectivity:

```bash
# Install telnet or use PowerShell
Test-NetConnection -ComputerName smtp.gmail.com -Port 587
```

Expected output:
```
TcpTestSucceeded : True
```

---

## Backend Logs

When backend starts, it will show:

```
✅ Email service is ready
   SMTP Host: smtp.gmail.com
   SMTP Port: 587
   User: dineshsellerrocket@gmail.com
```

Or if there's an issue:

```
⚠️  Email configuration issue: Invalid login credentials
Email Config: {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  user: 'dineshsellerrocket@gmail.com'
}
```

---

## Troubleshooting SMTP Issues

### Error: "Invalid login"
- Check EMAIL_USER and EMAIL_PASSWORD
- For Gmail: Use app password, not regular password
- Make sure 2FA is enabled on Gmail

### Error: "Connection refused on port 587"
- SMTP_PORT might be wrong
- Try 465 with SMTP_SECURE=true
- Check if port is blocked by firewall

### Error: "STARTTLS required"
- Set SMTP_SECURE=false for port 587
- Set SMTP_SECURE=true for port 465

### Error: "Hostname does not match certificate"
- This usually means SMTP_SECURE setting is wrong
- Try toggling SMTP_SECURE between true/false

### Emails not sending but no error
- Check backend logs for silent failures
- Verify email credentials are correct
- Check if recipient email domain blocks the sender
