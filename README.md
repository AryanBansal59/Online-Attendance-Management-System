AttendTrack - Online Attendance Management System
A comprehensive, full-stack web application built with Node.js, Express, MongoDB, and EJS for managing student attendance efficiently.

🚀 Project Flow
The application is designed with different roles in mind (Student, Teacher, Admin), providing tailored workflows for each to ensure smooth and secure operations.

1. Authentication & Onboarding
Landing/Sign-in: Users land on the homepage and proceed to the authentication portal.
Role-based Access: During sign-up, users are assigned specific roles (student, teacher, admin).
Session Management: Secure access and sessions are maintained using JWT (JSON Web Tokens).
2. Teacher Workflow (Marking Attendance)
Dashboard Overview: Teachers log in and view overall attendance statistics and quick actions.
Group Selection: Navigate to the "Mark Attendance" section. Teachers select specific student groups (e.g., Class A, Group 1) to filter the list of students.
Bulk Marking: The system displays a filtered list of students in the selected group. Teachers can efficiently mark them as Present, Absent, or Late for a specific date all at once.
Data Integrity: Server-side validation ensures no duplicate attendance entries can be created for the same student on the same day. Any modifications must be done through dedicated update flows.
3. Student Workflow (Viewing Attendance)
Dashboard Access: Students log in to their personalized dashboard.
Real-time Stats: They can instantly view their attendance percentage, total days, present days, and absent/late days.
Attendance History: Students can review a detailed log of their attendance status on a day-by-day basis, providing full transparency.
4. Admin Workflow (Management)
Admins have elevated privileges to oversee all users, view system-wide attendance summaries, and ensure the system runs smoothly.
🛠️ Technology Stack
Backend: Node.js, Express.js
Database: MongoDB (using Mongoose ORM)
Frontend: EJS (Embedded JavaScript templating), HTML, CSS, Vanilla JS
Authentication: JSON Web Tokens (JWT), bcryptjs for password hashing
⚙️ Installation & Setup
Clone the repository:

git clone <repository-url>
cd online-attendance-management-system
Install dependencies:

npm install
Configure Environment Variables: Create a .env file in the root directory and configure the following variables:

PORT=5001
MONGODB_URI=mongodb://localhost:27017/attendance-system
JWT_SECRET=your_super_secret_key_here
Start the application:

npm start
Or for development mode with automatic reloading:

npm run dev
Access the application: Open your browser and navigate to http://localhost:5001 (or whichever port you configured).

📖 API Documentation
The backend also exposes robust API endpoints for potential mobile app integrations or headless use.

Authentication
POST /api/auth/signup - Register a new user
POST /api/auth/signin - Login and receive JWT token
GET /api/auth/users - Get all users (Admin)
Attendance
POST /api/attendance/mark - Mark attendance (Teacher/Admin only)
GET /api/attendance/my-attendance/:studentId - Get personal attendance history
GET /api/attendance/all - Get all attendance records
GET /api/attendance/summary - Get attendance summary for all students
Dashboard
GET /api/dashboard/stats - Get system-wide statistics
GET /api/dashboard/profile/:userId - Get user profile details
POST /api/dashboard/profile/:userId/update - Update user profile
📝 Features Summary
✅ Authentication Page: Secure Registration and Login with role selection. ✅ Mark Attendance Page: Teachers can bulk-mark attendance filtering by student groups. ✅ View Attendance Page: Students can track real-time attendance percentages and history. ✅ Dashboard: Centralized hub to view profile, statistics, and recent activity.
