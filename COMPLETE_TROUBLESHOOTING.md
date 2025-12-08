# 🔧 Complete Troubleshooting Guide - Payment Still Not Working

## First: Test Locally (To Isolate the Problem)

### Step 1: Make sure backend is running
```bash
cd backend
npm start
# OR
node server.js
```

You should see:
```
✅ Email service is ready
Express server is running on port 5000
```

### Step 2: Make sure frontend is running
```bash
# In another terminal, in project root
npm run dev
# Should see: ▲ Next.js is running on http://localhost:3000
```

### Step 3: Test payment flow locally
1. Open: http://localhost:3000
2. Login
3. Go to Classes
4. Register and pay
5. Complete payment

**Expected Result:**
- ✅ Payment success page shows with NO error
- ✅ Console shows: "✓ Payment marked as SUCCESS"
- ✅ You get confirmation email

---

## If Works Locally but Not on Hosted Site

### Problem 1: Environment Variable Wrong on Vercel

**Check:**
1. Go to vercel.com/dashboard
2. Select project: webinar-three
3. Settings → Environment Variables
4. Look for: `NEXT_PUBLIC_API_URL`

**Should be:**
```
NOT: http://localhost:5000
YES: https://your-cloud-panel-ip:5000
OR: https://your-domain.com:5000
```

**Fix it:**
- Delete the localhost one
- Add new one with actual server address
- Click "Save"
- Wait for redeploy

### Problem 2: Database Missing Columns

**Check:**
```bash
ssh user@your-cloud-panel
mysql -u root -p
USE webinar;
DESCRIBE payments;
```

**Should have columns:**
- ✅ id
- ✅ user_id
- ✅ txn_id
- ✅ amount
- ✅ plan_id
- ✅ class_id ← Check if this exists
- ✅ status
- ✅ verification_status ← Check if this exists
- ✅ created_at
- ✅ updated_at

**If missing:**
```sql
ALTER TABLE payments
ADD COLUMN class_id INT AFTER plan_id,
ADD COLUMN verification_status VARCHAR(50) AFTER status;
```

### Problem 3: Backend Not Updated

**Check:**
```bash
ssh user@your-cloud-panel
cd ~/webinar
git log --oneline | head -3
# Should show your recent commits

git status
# Should show: "On branch main, nothing to commit"
```

**If not updated:**
```bash
git pull
pm2 restart all
```

### Problem 4: Backend Not Running

**Check:**
```bash
pm2 status
# Should show "online"

pm2 logs | tail -30
# Look for errors
```

**If crashed:**
```bash
pm2 restart all
sleep 3
pm2 logs | head -20
```

---

## Diagnostic Test

### Run this test locally first

```bash
cd backend
node test-endpoint.js TEST_TXN_123

# Should output:
# 🧪 Testing Payment Success Endpoint
# ✅ Response Status: 200
# ✅ SUCCESS! Endpoint working correctly
```

If this fails locally:
- Database not connected
- Payment table doesn't exist
- Server crashed

---

## Debug Payment Flow

### Add detailed logging

Open browser on hosted site:
1. Press **F12** (DevTools)
2. Click **Console** tab
3. Try payment
4. Watch console logs
5. Copy any error messages

**Send me the error message from console and I can fix it**

---

## Complete Checklist

### Localhost Working? 
- [ ] Backend running (`npm start` in backend folder)
- [ ] Frontend running (`npm run dev` in root folder)
- [ ] Payment goes through
- [ ] Success page shows (no error)
- [ ] Email received

### Hosted Not Working?
- [ ] Vercel env variable updated (not localhost)
- [ ] Database columns added (class_id, verification_status)
- [ ] Backend restarted (`pm2 restart all`)
- [ ] Code pulled (`git pull`)
- [ ] Vercel redeploy completed

---

## Tell Me These Things

1. **Localhost test result:**
   - Does payment work locally?
   - Any errors in console?

2. **Browser console error (on hosted site):**
   - Open F12 → Console
   - Try to pay
   - Screenshot the exact error

3. **Backend logs (on Cloud Panel):**
   ```bash
   pm2 logs | grep -i "payment\|error" | tail -20
   ```
   - Show me last 20 lines

4. **Environment check:**
   - What's your Cloud Panel IP/domain?
   - What's the `NEXT_PUBLIC_API_URL` on Vercel?

---

## Most Common Issues

### Issue: "Can't reach API"
**Cause:** Vercel env pointing to localhost
**Fix:** Change to actual server address

### Issue: "Payment not found"
**Cause:** Database not connected or txnid not in database
**Fix:** Check backend logs for DB connection error

### Issue: "Error recording payment"
**Cause:** Missing database columns OR connection not released
**Fix:** Add columns + restart backend

### Issue: "Payment success page blank"
**Cause:** Backend endpoint returning 500 error
**Fix:** Check `pm2 logs` for error details

---

## Next Steps

**Right now:**
1. Test payment locally (should work)
2. Check Vercel environment variable
3. Check database columns exist
4. Check backend is running

**Then tell me:**
- What error you see in browser console
- What `pm2 logs` shows
- If localhost works but hosted doesn't

**I'll fix it from there** ✅

---

## You're Not Alone!

This is a common issue when moving from localhost to production. The fixes are simple:
1. Update environment variables
2. Add missing database columns  
3. Restart backend

Let me know the exact error and I'll fix it! 💪
