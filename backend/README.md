# Webinar Platform - Backend Setup

## Prerequisites
- Node.js (v14 or higher)
- MySQL Server

## Installation

### 1. Create Database
```bash
mysql -u root -p < database.sql
```

Or manually run:
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

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Edit `.env` file with your database credentials:
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=webinar
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

### 4. Start Server
```bash
npm run dev
```

Server will run on `http://localhost:5000`

## API Endpoints

### Authentication

**POST /api/auth/signup**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890"
}
```

**POST /api/auth/login**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**GET /api/auth/profile** (Protected)
Headers: `Authorization: Bearer {token}`

**PUT /api/auth/profile** (Protected)
```json
{
  "name": "Updated Name",
  "phone": "+1987654321"
}
```

**POST /api/auth/logout** (Protected)

**GET /api/health**
