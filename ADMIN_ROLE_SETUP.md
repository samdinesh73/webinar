# 👨‍💼 Admin Role Setup Guide

## Step 1: Add Role Column to Database

Run this SQL command to add the role column to the users table:

```sql
ALTER TABLE user ADD COLUMN role VARCHAR(50) DEFAULT 'user' COMMENT 'user, admin' AFTER password;
```

Or use the provided SQL file:
```bash
mysql -h localhost -u root -p webinar < backend/add_role_column.sql
```

## Step 2: Set Admin User

Run this command to make a user an admin:

```sql
UPDATE user SET role = 'admin' WHERE email = 'dineshsellerrocket@gmail.com';
```

### To make another user admin:
```sql
UPDATE user SET role = 'admin' WHERE email = 'user@example.com';
```

### To remove admin privileges:
```sql
UPDATE user SET role = 'user' WHERE email = 'user@example.com';
```

## Step 3: Verify Setup

Check if the role was set correctly:

```sql
SELECT id, email, name, role FROM user;
```

You should see output like:
```
+----+------------------------------+---------------------+-------+
| id | email                        | name                | role  |
+----+------------------------------+---------------------+-------+
| 1  | dineshsellerrocket@gmail.com | Dinesh Sellerrocket | admin |
| 2  | user@example.com             | John Doe            | user  |
+----+------------------------------+---------------------+-------+
```

## Step 4: Test Admin Access

1. **Login as Admin:**
   - Go to `http://localhost:3000/login`
   - Enter email: `dineshsellerrocket@gmail.com`
   - Enter password: (your password)
   - Click Login

2. **Access Admin Panel:**
   - Go to `http://localhost:3000/admin/classes`
   - You should see the classes management page

3. **Test Non-Admin Access:**
   - Login with a non-admin user
   - Try to access `http://localhost:3000/admin/classes`
   - You should see "Access Denied" message

## 🔍 How It Works

### Role Flow:
```
User Login
    ↓
Backend checks user role from database
    ↓
JWT token includes role
    ↓
Frontend stores user data with role
    ↓
Access control check
    ↓
If role === 'admin' → Allow access
Otherwise → Redirect to home
```

### Protected Pages:
- `/admin/classes` - Only admins can access

### Public Pages:
- `/classes` - Everyone can view
- `/dashboard` - Authenticated users
- `/register` - Authenticated users

## 🛠️ Managing Admins

### View all admins:
```sql
SELECT email, name, role FROM user WHERE role = 'admin';
```

### Count admins:
```sql
SELECT COUNT(*) as admin_count FROM user WHERE role = 'admin';
```

### Remove admin access:
```sql
UPDATE user SET role = 'user' WHERE email = 'admin@example.com';
```

### Make all users admins (NOT recommended):
```sql
UPDATE user SET role = 'admin';
```

## 📋 Role-Based Features

### Admin Features:
✅ Create classes
✅ Edit classes
✅ Delete classes
✅ View all classes
✅ Access admin dashboard

### User Features:
✅ View upcoming classes
✅ Join class meetings
✅ View dashboard
✅ View personal profile

## 🔐 Security Notes

1. **Multiple Admins:** You can have multiple admins
   ```sql
   UPDATE user SET role = 'admin' WHERE email IN (
     'admin1@example.com',
     'admin2@example.com'
   );
   ```

2. **Backup Admin:** Keep at least one admin account
   - Store credentials securely
   - Don't delete your admin account

3. **Access Control:** Admin pages check role on:
   - Page load (frontend)
   - API endpoints (backend)

## 🚀 Deployment Checklist

- [ ] Run `add_role_column.sql` on production database
- [ ] Set admin users in production
- [ ] Verify admin can access `/admin/classes`
- [ ] Test access denied for non-admins
- [ ] Restart backend server
- [ ] Clear browser cache
- [ ] Test with incognito window

## 📊 Database Changes

### Before:
```sql
SELECT * FROM user;
-- No 'role' column
```

### After:
```sql
ALTER TABLE user ADD COLUMN role VARCHAR(50) DEFAULT 'user';

SELECT * FROM user;
-- Now shows 'role' column with default value 'user'
```

## 🔧 Troubleshooting

### Admin can't access admin page:
1. Check role is 'admin': `SELECT role FROM user WHERE email = 'email@example.com';`
2. Re-login after role change
3. Clear browser cache
4. Check browser console for errors

### Role column already exists:
```bash
# Check if column exists
SHOW COLUMNS FROM user;
# If 'role' exists, skip the ALTER TABLE step
```

### Wrong email set as admin:
```sql
-- Remove admin from wrong user
UPDATE user SET role = 'user' WHERE email = 'wrong@example.com';

-- Set correct user as admin
UPDATE user SET role = 'admin' WHERE email = 'correct@example.com';
```

## 📱 Frontend Changes

The following files were updated:

1. **AuthContext.js**
   - Now includes `role` in JWT token
   - Role available in `user.role`

2. **admin/classes/page.js**
   - Checks `user?.role === 'admin'`
   - Shows "Access Denied" for non-admins
   - Redirects to home if not admin

3. **backend/server.js**
   - Includes role in login response
   - Includes role in profile endpoint

## ✅ Verification Commands

```bash
# Check if role column exists
mysql -h localhost -u root -p webinar -e "DESCRIBE user;"

# Check admin users
mysql -h localhost -u root -p webinar -e "SELECT email, role FROM user WHERE role = 'admin';"

# Check all users and roles
mysql -h localhost -u root -p webinar -e "SELECT id, email, name, role FROM user;"
```

---

**Last Updated:** December 6, 2025
**Status:** ✅ Complete
