# Quick Start Guide

## Installation & Setup

1. **Open terminal/command prompt** in the project directory
2. **Install dependencies:**
   ```
   npm install
   ```
3. **Start the server:**
   ```
   npm start
   ```

The server will start on `http://localhost:5000`

---

## Quick Test Commands (Using Postman or cURL)

### Step 1: Create a Student Account (Sign-up)
```
POST http://localhost:5000/api/auth/signup
Body (JSON):
{
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "password": "password123",
  "role": "student"
}
```

### Step 2: Create a Teacher Account
```
POST http://localhost:5000/api/auth/signup
Body (JSON):
{
  "name": "Mr. Smith",
  "email": "smith@example.com",
  "password": "password123",
  "role": "teacher"
}
```

### Step 3: Login (Sign-in)
```
POST http://localhost:5000/api/auth/signin
Body (JSON):
{
  "email": "alice@example.com",
  "password": "password123"
}
```

### Step 4: Mark Attendance (Teacher marks student present)
```
POST http://localhost:5000/api/attendance/mark
Body (JSON):
{
  "studentId": "your-student-id",
  "studentName": "Alice Johnson",
  "date": "2024-03-01",
  "status": "present"
}
```

### Step 5: Check Attendance (Student views real-time percentage)
```
GET http://localhost:5000/api/attendance/my-attendance/your-student-id
```

### Step 6: View Dashboard Stats
```
GET http://localhost:5000/api/dashboard/stats
```

### Step 7: View User Profile
```
GET http://localhost:5000/api/dashboard/profile/your-user-id
```

---

## Your 5 Pages:

✅ **Page 1:** Sign-up - Create account (POST)
✅ **Page 2:** Sign-in - Login (POST)
✅ **Page 3:** Mark Attendance - Teachers mark attendance (POST)
✅ **Page 4:** View Attendance - Students check percentage (GET)
✅ **Page 5:** Dashboard - Profile & Statistics (GET + POST)

---

## Project Structure Created:

```
Online Attendance Management System/
├── server.js              ← Main file (run this)
├── package.json           ← Dependencies
├── .env                   ← Configuration
├── README.md              ← Full documentation
├── routes/
│   ├── auth.js           ← Sign-up & Sign-in
│   ├── attendance.js      ← Mark & View attendance
│   └── dashboard.js       ← Profile & Stats
└── data/                  ← Auto-created by app
    ├── users.json
    └── attendance.json
```

---

## Features:

✅ User authentication with encrypted passwords
✅ Real-time attendance tracking
✅ Attendance percentage calculation
✅ Student roles, teacher roles, admin roles
✅ JWT token-based security
✅ Complete API documentation

---

For more details, see **README.md**
