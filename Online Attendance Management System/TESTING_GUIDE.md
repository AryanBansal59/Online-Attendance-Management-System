# Testing Guide - All 5 Pages

Your online attendance management system has 5 working pages. Here's how to test each one:

---

## ✅ Setup Requirements

1. **Server Running:** Make sure the server is running
   ```
   npm start
   ```
   Server will run on: `http://localhost:5000`

2. **Frontend Pages:** Access the pages at:
   - Homepage: `http://localhost:5000/`

---

## 📋 The 5 Pages & How to Use Them

### **PAGE 1: Sign-Up (signup.ejs)** - POST Request
**URL:** `http://localhost:5000/api/auth/signup`

**Purpose:** Create new user accounts

**Test Steps:**
1. Navigate to sign-up page
2. Fill in the form:
   - Full Name: `Alice Johnson`
   - Email: `alice@example.com`
   - Password: `password123`
   - Role: Select `Student`
3. Click "Create Account"
4. ✅ Should see success message and redirect to sign-in page

**Create Multiple Test Accounts:**
- Student: alice@example.com / password123 / student
- Teacher: smith@example.com / password123 / teacher
- Admin: admin@example.com / password123 / admin

---

### **PAGE 2: Sign-In (signin.ejs)** - POST Request
**URL:** `http://localhost:5000/api/auth/signin`

**Purpose:** Login to existing accounts

**Test Steps:**
1. Navigate to sign-in page
2. Enter credentials you created in Sign-Up:
   - Email: `alice@example.com`
   - Password: `password123`
3. Click "Sign In"
4. ✅ Should see "Login successful" and be redirected to Dashboard

**What Happens:**
- JWT token is generated and stored
- User information is saved in browser (localStorage)
- Can now access protected pages

---

### **PAGE 3: Mark Attendance (mark-attendance.ejs)** - POST Request
**URL:** `http://localhost:5000/mark-attendance`

**Purpose:** Teachers mark student attendance in real-time

**Requirements:**
- Must be logged in
- Best tested with a "teacher" role account

**Test Steps:**
1. Sign-in as teacher (smith@example.com)
2. Go to Mark Attendance page
3. Fill the form:
   - Student ID: `alice123`
   - Student Name: `Alice Johnson`
   - Date: `2024-03-01` (auto-filled today)
   - Status: Click one of:
     - ✓ Present
     - ✗ Absent
     - 🕐 Late
4. Click "Mark Attendance"
5. ✅ Should show success message

**Real-Time Feature:**
- After marking attendance, student can immediately see it in View Attendance page
- Attendance percentage updates instantly

**Test Multiple Records:**
Mark attendance for the same student on different dates to see the percentage calculation:
```
Date: 2024-02-01, Status: present
Date: 2024-02-02, Status: present
Date: 2024-02-03, Status: absent
Date: 2024-02-04, Status: late
```

---

### **PAGE 4: View Attendance (view-attendance.ejs)** - GET Request
**URL:** `http://localhost:5000/view-attendance`

**Purpose:** Students check real-time attendance percentage

**For Students:**
1. Sign-in as student (alice@example.com)
2. Go to View Attendance page
3. Student ID should auto-fill
4. Click "Search Attendance"
5. ✅ Should display:
   - Attendance Percentage (e.g., 85.5%)
   - Total Days: 4
   - Present Days: 2
   - Absent Days: 1
   - Late Days: 1
   - List of all attendance records

**For Teachers/Admins:**
1. Sign-in as teacher
2. Go to View Attendance page
3. Enter a student ID manually (e.g., `alice123`)
4. Click "Search Attendance"
5. ✅ Should display that student's attendance data

**Real-Time Updates:**
- Mark attendance for a student → student can immediately see the update
- No page refresh needed for new records
- Percentage automatically recalculates

---

### **PAGE 5: Dashboard (dashboard.ejs)** - GET & POST Requests
**URL:** `http://localhost:5000/dashboard`

**Purpose:** View profile, statistics, and update information

**Requirements:**
- Must be logged in

**Dashboard Tabs:**

#### **Tab 1: Profile**
- View your account info (name, email, role)
- Edit your full name
- For students: See attendance percentage

**Test:**
1. Click "Profile" tab
2. See your information displayed
3. Click "Update Profile"
4. Change your name
5. Click "Update Profile" button
6. ✅ Should show updated successfully

#### **Tab 2: Attendance** (Students Only)
- Shows student's attendance stats
- Only appears if you're logged in as a student

**Test:**
1. Log in as student
2. Click "Attendance" tab
3. ✅ Should display:
   - Attendance percentage
   - Total days tracked
   - Present/Absent/Late breakdown

#### **Tab 3: Statistics**
- Shows system-wide stats
- Total users count
- Total students count
- Total teachers count
- Total attendance records

**Test:**
1. Click "Statistics" tab
2. ✅ Should show system stats based on your created data

---

## 🎯 Complete Testing Workflow

### **Test Scenario: Teacher Marks Attendance for Student**

**Step 1: Sign Up**
- Create Student Account
  - Name: Alice
  - Email: alice@example.com
  - Role: Student
- Create Teacher Account
  - Name: Mr. Smith
  - Email: smith@example.com
  - Role: Teacher

**Step 2: Teacher Marks Attendance**
- Sign in as teacher
- Go to Mark Attendance
- Mark Alice as "present" for 2024-03-01
- Mark Alice as "present" for 2024-03-02
- Mark Alice as "absent" for 2024-03-03

**Step 3: Student Views Real-Time Attendance**
- Sign in as Alice (student)
- Go to View Attendance
- Student ID auto-fills or enter: alice123
- Click Search
- ✅ See 66.7% attendance (2 present, 1 absent)
- See all 3 records listed

**Step 4: Check Dashboard**
- While still logged in as Alice
- Go to Dashboard
- Click Attendance tab
- ✅ See same attendance stats
- Click Profile tab
- ✅ Edit name and update

---

## 🧪 API Testing with Postman/cURL

### **Sign-Up (POST)**
```
POST http://localhost:5000/api/auth/signup
Body:
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "role": "student"
}
```

### **Sign-In (POST)**
```
POST http://localhost:5000/api/auth/signin
Body:
{
  "email": "test@example.com",
  "password": "password123"
}
Returns: JWT token
```

### **Mark Attendance (POST)**
```
POST http://localhost:5000/api/attendance/mark
Body:
{
  "studentId": "student123",
  "studentName": "Test User",
  "date": "2024-03-01",
  "status": "present"
}
```

### **View Attendance (GET)**
```
GET http://localhost:5000/api/attendance/my-attendance/student123
Returns: Student's attendance data with percentage
```

### **Dashboard Stats (GET)**
```
GET http://localhost:5000/api/dashboard/stats
Returns: System statistics
```

### **User Profile (GET)**
```
GET http://localhost:5000/api/dashboard/profile/user-id
Returns: User profile and attendance (if student)
```

### **Update Profile (POST)**
```
POST http://localhost:5000/api/dashboard/profile/user-id/update
Body:
{
  "name": "New Name"
}
```

---

## ✨ Features Tested

✅ **Page 1 - Sign-Up**
- User registration with POST
- Password encryption
- Role selection (student/teacher/admin)
- Validation

✅ **Page 2 - Sign-In**
- User authentication with POST
- JWT token generation
- Session management
- Redirect on success

✅ **Page 3 - Mark Attendance**
- POST request to create records
- Teacher can mark multiple students
- Status selection (present/absent/late)
- Real-time updates

✅ **Page 4 - View Attendance**
- GET request to fetch data
- Real-time attendance percentage
- Auto-updating without page refresh
- Student-specific or admin can view any

✅ **Page 5 - Dashboard**
- Display user profile (GET)
- Update profile information (POST)
- Show attendance statistics
- System-wide statistics
- Tabbed interface

---

## 📁 Data Storage

All data is stored in JSON files:
- `/data/users.json` - User accounts
- `/data/attendance.json` - Attendance records

You can manually edit or delete these files to test fresh, or the app creates them automatically.

---

## 🐛 Troubleshooting

**Problem:** "Cannot find page" error
- **Solution:** Make sure server is running with `npm start`

**Problem:** CORS errors in console
- **Solution:** CORS is already enabled in server.js

**Problem:** Cannot mark attendance
- **Solution:** Log in first, then go to mark attendance page

**Problem:** Attendance doesn't update in real-time
- **Solution:** Refresh the View Attendance page or go back and re-enter student ID

**Problem:** Student doesn't see attendance tab
- **Solution:** Must be logged in as a student (role: "student")

---

## 📊 Summary

| Page | Method | Purpose |
|------|--------|---------|
| Sign-Up | POST | Create user account |
| Sign-In | POST | Login & get JWT |
| Mark Attendance | POST | Record attendance |
| View Attendance | GET | Check real-time % |
| Dashboard | GET/POST | Profile & stats |

**All 5 pages are fully functional and test both POST and GET requests!** 🎉
