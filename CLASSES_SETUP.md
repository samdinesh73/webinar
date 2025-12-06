# 📚 Classes Management Setup Guide

This guide will help you set up the classes management system for your webinar platform.

## 📋 Setup Steps

### 1. Create Database Table

Run the SQL migration to create the `classes` table:

```bash
mysql -h localhost -u root -p webinar < backend/create_classes_table.sql
```

Or if you have a GUI (like phpMyAdmin), run the SQL from `backend/create_classes_table.sql`.

**What's created:**
- `classes` table with columns for title, description, instructor, date, time, duration, plan_id, and meeting_link
- Sample data with 7 upcoming classes across different plans

### 2. Backend API Endpoints

The following endpoints are now available:

#### Get all upcoming classes (Public)
```
GET /api/classes/upcoming
```
Returns classes scheduled for today or later, sorted by date.

#### Get all classes (Public)
```
GET /api/classes
```
Returns all classes, sorted by date descending.

#### Create a new class (Protected)
```
POST /api/classes
Headers: Authorization: Bearer {token}
Body: {
  "title": "Class Title",
  "description": "Class description",
  "instructor": "Instructor Name",
  "class_date": "2025-12-10",
  "class_time": "19:00:00",
  "duration_minutes": 120,
  "plan_id": "pro",  // free, basic, pro, or all
  "meeting_link": "https://zoom.us/..."
}
```

#### Update a class (Protected)
```
PUT /api/classes/:id
Headers: Authorization: Bearer {token}
Body: {same as POST}
```

#### Delete a class (Protected)
```
DELETE /api/classes/:id
Headers: Authorization: Bearer {token}
```

### 3. Frontend Pages

#### Admin Classes Management
- **URL:** `/admin/classes`
- **Features:**
  - View all classes
  - Create new classes
  - Edit existing classes
  - Delete classes
  - Requires authentication

#### Public Upcoming Classes
- **URL:** `/classes`
- **Features:**
  - Display all upcoming classes
  - Shows class details (instructor, date, time, duration)
  - Shows plan eligibility
  - "Join Meeting" button for authenticated users
  - Plan-based access control

#### Dashboard Enhancement
- **URL:** `/dashboard`
- **New Feature:**
  - "Upcoming Masterclasses" section showing top 3 classes
  - Quick view of next scheduled classes
  - Link to full classes page

## 🎯 How to Use

### Creating Classes

1. **Admin Access:**
   - Go to `https://yoursite.com/admin/classes`
   - Click "Add Class" button
   - Fill in the form:
     - **Title:** Class name
     - **Description:** Brief description
     - **Instructor:** Instructor name
     - **Date:** Class date
     - **Time:** Class time (24-hour format)
     - **Duration:** Class duration in minutes
     - **Plan:** Which plan(s) can access this
     - **Meeting Link:** Zoom/Google Meet link
   - Click "Create Class"

### Viewing Classes

1. **Public View:**
   - Go to `https://yoursite.com/classes`
   - See all upcoming classes
   - Click "Join Meeting" to join (requires valid meeting link)

2. **Dashboard:**
   - Go to `https://yoursite.com/dashboard`
   - See upcoming classes widget
   - Click "View All Classes" for full list

## 🔐 Plan-Based Access Control

Classes can be restricted to specific plans:

- **free:** Only free plan users
- **basic:** Basic and Pro plan users
- **pro:** Pro plan users only
- **all:** All users can access

The system checks user eligibility and shows appropriate access messages.

## 📱 Sample Classes Included

The migration includes 7 sample classes:

1. **E-commerce Growth Hacking** (Pro) - Amitabh Kumar
2. **Packaging Design Secrets** (Pro) - Rahul Sharma
3. **Advanced SEO & Traffic** (Pro) - Priya Singh
4. **Customer Psychology & Sales** (Pro) - Vikram Patel
5. **E-commerce Fundamentals** (Basic) - Amitabh Kumar
6. **Product Photography 101** (Basic) - Rahul Sharma
7. **Introduction to E-commerce** (Free) - Amitabh Kumar

These are scheduled for upcoming days (relative to today).

## 🛠️ Customization

### Change Class Display Count
In `/app/dashboard/page.js`, line showing:
```javascript
setUpcomingClasses(data.classes.slice(0, 3)); // Change 3 to desired number
```

### Add More Fields
To add more fields to classes:
1. Add column to database table
2. Update API endpoints in `backend/server.js`
3. Update form in `/app/admin/classes/page.js`
4. Update display in `/app/classes/page.js` and dashboard

### Customize Styling
- Admin page: Edit `/app/admin/classes/page.js`
- Classes view: Edit `/app/classes/page.js`
- Dashboard widget: Edit `/app/dashboard/page.js`

## 🐛 Troubleshooting

### Classes not showing
1. Check database table created successfully: `SHOW TABLES;`
2. Check sample data inserted: `SELECT * FROM classes;`
3. Verify API endpoints are working: Visit `/api/classes`
4. Check browser console for errors

### Can't create classes
1. Ensure you're logged in
2. Check that you have valid authentication token
3. Verify all required fields are filled
4. Check server logs for error details

### Meeting link not working
1. Ensure URL starts with `https://`
2. Check Zoom/Meet link is valid and active
3. Test link in new browser tab

## 📞 Support

For issues or questions:
1. Check the backend server logs
2. Check browser developer console (F12)
3. Verify database connection
4. Ensure all migrations ran successfully

---

**Last Updated:** December 6, 2025
