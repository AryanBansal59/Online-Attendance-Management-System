# Online Attendance Management System - Backend API

A Node.js and Express backend for managing student attendance in real-time.

## Project Structure

```
├── server.js                 # Main entry point
├── package.json             # Dependencies
├── .env                     # Environment variables
├── routes/
│   ├── auth.js             # Sign-up and Sign-in endpoints
│   ├── attendance.js        # Mark and view attendance
│   └── dashboard.js         # User profile and statistics
└── data/
    ├── users.json          # User database (auto-created)
    └── attendance.json      # Attendance records (auto-created)
```

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```
   
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

The server will run on `http://localhost:5000`

---

## API Endpoints

### 1. AUTHENTICATION (Sign-up & Sign-in)

#### Sign-up - Create new account
- **Endpoint:** `POST /api/auth/signup`
- **Request Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "student"
  }
  ```
- **Role Options:** `student`, `teacher`, `admin`
- **Response:**
  ```json
  {
    "message": "User registered successfully",
    "user": {
      "id": "1234567890",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "student"
    }
  }
  ```

#### Sign-in - Login to account
- **Endpoint:** `POST /api/auth/signin`
- **Request Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "1234567890",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "student"
    }
  }
  ```

#### Get All Users
- **Endpoint:** `GET /api/auth/users`
- **Response:** Array of all users (without passwords)

---

### 2. ATTENDANCE MANAGEMENT

#### Mark Attendance (Teacher)
- **Endpoint:** `POST /api/attendance/mark`
- **Request Body:**
  ```json
  {
    "studentId": "student123",
    "studentName": "John Doe",
    "date": "2024-03-01",
    "status": "present"
  }
  ```
- **Status Options:** `present`, `absent`, `late`
- **Response:**
  ```json
  {
    "message": "Attendance marked successfully",
    "record": {
      "id": "1234567890",
      "studentId": "student123",
      "studentName": "John Doe",
      "date": "2024-03-01",
      "status": "present",
      "markedAt": "2024-03-01T10:30:00.000Z"
    }
  }
  ```

#### View My Attendance (Student - Real-time)
- **Endpoint:** `GET /api/attendance/my-attendance/:studentId`
- **Response:**
  ```json
  {
    "studentId": "student123",
    "name": "John Doe",
    "attendancePercentage": 85.5,
    "totalDays": 20,
    "presentDays": 17,
    "lateDays": 1,
    "absentDays": 2,
    "records": [
      {
        "id": "1234567890",
        "studentId": "student123",
        "studentName": "John Doe",
        "date": "2024-03-01",
        "status": "present",
        "markedAt": "2024-03-01T10:30:00.000Z"
      }
    ]
  }
  ```

#### Get All Attendance Records
- **Endpoint:** `GET /api/attendance/all`
- **Response:** All attendance records in the system

#### Get Attendance Summary (All Students)
- **Endpoint:** `GET /api/attendance/summary`
- **Response:**
  ```json
  {
    "totalStudents": 5,
    "summary": [
      {
        "studentId": "student123",
        "name": "John Doe",
        "totalDays": 20,
        "presentDays": 17,
        "lateDays": 1,
        "absentDays": 2,
        "attendancePercentage": "85.50"
      }
    ]
  }
  ```

---

### 3. DASHBOARD & PROFILE

#### Get Dashboard Statistics
- **Endpoint:** `GET /api/dashboard/stats`
- **Response:**
  ```json
  {
    "totalUsers": 25,
    "totalStudents": 20,
    "totalTeachers": 5,
    "totalAttendanceRecords": 150,
    "recentAttendance": [...]
  }
  ```

#### Get User Profile
- **Endpoint:** `GET /api/dashboard/profile/:userId`
- **Response:**
  ```json
  {
    "user": {
      "id": "student123",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "student",
      "createdAt": "2024-02-01T10:00:00.000Z"
    },
    "attendance": {
      "totalDays": 20,
      "presentDays": 17,
      "lateDays": 1,
      "absentDays": 2,
      "attendancePercentage": "85.50"
    }
  }
  ```

#### Update User Profile
- **Endpoint:** `POST /api/dashboard/profile/:userId/update`
- **Request Body:**
  ```json
  {
    "name": "Jane Doe"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Profile updated successfully",
    "user": {
      "id": "student123",
      "name": "Jane Doe",
      "email": "john@example.com",
      "role": "student"
    }
  }
  ```

---

## Features Summary

✅ **Page 1 - Sign-up Page** (POST)
   - User registration with role selection
   
✅ **Page 2 - Sign-in Page** (POST)
   - User login with JWT token generation

✅ **Page 3 - Mark Attendance Page** (POST)
   - Teachers can mark attendance for students

✅ **Page 4 - View Attendance Page** (GET)
   - Students can check real-time attendance percentage

✅ **Page 5 - Dashboard Page** (GET + POST)
   - View profile, statistics, update name

---

## Testing the API

You can test the API using **Postman** or **cURL**:

### Example: Sign-up
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Student Name",
    "email": "student@example.com",
    "password": "password123",
    "role": "student"
  }'
```

### Example: Sign-in
```bash
curl -X POST http://localhost:5000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "password123"
  }'
```

### Example: Mark Attendance
```bash
curl -X POST http://localhost:5000/api/attendance/mark \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "12345",
    "studentName": "Student Name",
    "date": "2024-03-01",
    "status": "present"
  }'
```

### Example: View Attendance
```bash
curl http://localhost:5000/api/attendance/my-attendance/12345
```

---

## Notes

- Attendance percentage calculation: **(Present Days + Late Days × 0.5) / Total Days × 100**
- Passwords are encrypted using bcryptjs
- JWT tokens expire after 7 days
- Data is stored locally in JSON files (data/users.json and data/attendance.json)
- For production, migrate to a real database like MongoDB or PostgreSQL

---

## Next Steps

1. Install dependencies: `npm install`
2. Start the server: `npm start`
3. Test endpoints using Postman or cURL
4. Connect frontend application to these endpoints
5. For production, add database integration and environment configuration
