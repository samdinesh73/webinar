# 🎓 Classes Management - Quick Reference

## 📍 Page URLs

| Page | URL | Purpose |
|------|-----|---------|
| Upcoming Classes | `/classes` | Public view of all upcoming masterclasses |
| Admin Classes | `/admin/classes` | Manage classes (create, edit, delete) |
| Dashboard | `/dashboard` | User dashboard with classes widget |

## 🔗 API Endpoints

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/classes/upcoming` | ❌ | Get upcoming classes |
| GET | `/api/classes` | ❌ | Get all classes |
| POST | `/api/classes` | ✅ | Create class |
| PUT | `/api/classes/:id` | ✅ | Update class |
| DELETE | `/api/classes/:id` | ✅ | Delete class |

## 📋 Class Fields

```json
{
  "id": 1,
  "title": "Class Title",
  "description": "Class description",
  "instructor": "Instructor Name",
  "class_date": "2025-12-10",
  "class_time": "19:00:00",
  "duration_minutes": 120,
  "plan_id": "pro",
  "meeting_link": "https://zoom.us/...",
  "created_at": "2025-12-06T10:00:00Z",
  "updated_at": "2025-12-06T10:00:00Z"
}
```

## 🎯 Plan Types

- **free** - Free plan users
- **basic** - Basic plan users  
- **pro** - Pro plan users
- **all** - All users

## 📂 Database Setup

```bash
# Import SQL file
mysql -h localhost -u root -p webinar < backend/create_classes_table.sql

# Or paste SQL content into phpMyAdmin
```

## 🎨 UI Components Used

- **Button** - Action buttons
- **Card** - Content cards
- **Input** - Form inputs
- **Label** - Form labels
- **Alert** - Error/info messages
- **Badge** - Status badges
- **Separator** - Visual dividers
- **Select** - Dropdown selects

## 📱 Icons Used (Lucide React)

- `Calendar` - Date/classes
- `Clock` - Time/duration
- `User` / `Users` - Instructor/people
- `Edit2` - Edit action
- `Trash2` - Delete action
- `Plus` - Add action
- `Link` - Meeting link
- `Loader2` - Loading state
- `AlertCircle` - Errors
- `CheckCircle2` - Success
- `Trophy` - Achievement
- `Play` - Video/class
- `BookOpen` - Learning

## 🔄 Data Flow

```
User creates class
    ↓
Form validation
    ↓
POST /api/classes
    ↓
Database insert
    ↓
Success response
    ↓
Fetch updated list
    ↓
Display classes
```

## 🛡️ Validation

### Required Fields (Create/Update)
- ✅ title
- ✅ instructor
- ✅ class_date
- ✅ class_time

### Optional Fields
- description
- duration_minutes (default: 60)
- plan_id (default: 'all')
- meeting_link

## 📊 Sample Class Data

```json
{
  "title": "E-commerce Growth Hacking",
  "description": "Learn advanced strategies to scale your e-commerce business rapidly",
  "instructor": "Amitabh Kumar",
  "class_date": "2025-12-09",
  "class_time": "19:00:00",
  "duration_minutes": 120,
  "plan_id": "pro",
  "meeting_link": "https://zoom.us/meeting-pro-1"
}
```

## 🚀 Common Tasks

### Create a Class
1. Go to `/admin/classes`
2. Click "Add Class"
3. Fill form
4. Click "Create Class"

### View Classes
1. Go to `/classes`
2. Browse upcoming classes
3. Click "Join Meeting"

### Edit a Class
1. Go to `/admin/classes`
2. Find class in list
3. Click "Edit" button
4. Update form
5. Click "Update Class"

### Delete a Class
1. Go to `/admin/classes`
2. Find class in list
3. Click "Delete" button
4. Confirm deletion

## 🐛 Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| Classes not showing | Check DB table exists: `SHOW TABLES;` |
| Can't create class | Ensure logged in, all required fields filled |
| Meeting link broken | Use full URL starting with `https://` |
| Classes not sorted | Check database indexes on class_date |
| Auth errors | Verify JWT token valid |

## 💡 Tips

- 📌 Always use `https://` for meeting links
- 📌 Use 24-hour format for time (19:00:00)
- 📌 Set `plan_id` to 'all' for free preview classes
- 📌 Add detailed descriptions for better UX
- 📌 Test meeting links before publishing
- 📌 Schedule classes ahead of time

## 📞 File Locations

```
backend/
  ├── server.js (lines 777-857 - API endpoints)
  └── create_classes_table.sql

app/
  ├── admin/classes/page.js (admin panel)
  ├── classes/page.js (public view)
  └── dashboard/page.js (widget)

docs/
  ├── CLASSES_SETUP.md
  ├── IMPLEMENTATION_SUMMARY.md
  └── QUICK_REFERENCE.md (this file)
```

## ✅ Testing

```bash
# Test API endpoints
curl http://localhost:5000/api/classes
curl http://localhost:5000/api/classes/upcoming

# Test with auth
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/classes
```

## 📈 Future Enhancements

- [ ] Add class recordings
- [ ] Email reminders
- [ ] Calendar sync
- [ ] Attendance tracking
- [ ] User ratings/reviews
- [ ] Recurring classes
- [ ] Class materials/downloads
- [ ] Q&A section
- [ ] Live chat during class
- [ ] Analytics dashboard

---

**Last Updated:** December 6, 2025
