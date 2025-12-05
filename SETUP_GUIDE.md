# 🚀 Complete Setup Guide

## Step 1: Setup MySQL Database

Open MySQL and run:
```sql
CREATE DATABASE IF NOT EXISTS webinar;
USE webinar;

CREATE TABLE IF NOT EXISTS user (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email)
);
```

## Step 2: Start Backend Server

Open a **new terminal** and run:
```bash
cd backend
npm install
npm run dev
```

You should see:
```
✅ Server running on http://localhost:5000
📊 Database: localhost:3306/webinar
🔐 JWT Secret configured
```

## Step 3: Start Frontend

Open **another terminal** and run:
```bash
npm install
npm run dev
```

Frontend will run on `http://localhost:3000`

## Step 4: Test Authentication

1. Go to `http://localhost:3000/signup`
2. Create an account
3. You'll be redirected to `/dashboard`
4. Click "Logout" to test logout
5. Go to `/login` to login again

## ⚠️ Common Issues

### Error: "Failed to fetch"
- Backend is not running
- Solution: Run `npm run dev` in the backend folder

### Error: "Cannot connect to database"
- MySQL is not running or credentials are wrong
- Check `.env` file in backend folder
- Make sure database exists: `SHOW DATABASES;`

### Error: "Email already registered"
- That email is already in the database
- Use a different email or delete the user from database

## 🔧 Environment Variables

### Backend (.env)
```
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=webinar
JWT_SECRET=your-secret-key
NODE_ENV=development
```

### Frontend (uses backend at http://localhost:5000)
No env file needed - hardcoded in AuthContext

## 📝 Database

View all users:
```sql
SELECT * FROM webinar.user;
```

Delete a user:
```sql
DELETE FROM webinar.user WHERE email = 'email@example.com';
```

Reset database:
```sql
DROP DATABASE webinar;
CREATE DATABASE webinar;
-- Run the CREATE TABLE query above
```
