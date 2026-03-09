const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const usersFile = path.join(__dirname, '../data/users.json');
const attendanceFile = path.join(__dirname, '../data/attendance.json');

// Helper function to read users
const getUsers = () => {
  try {
    const data = fs.readFileSync(usersFile, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
};

// Helper function to read attendance
const getAttendance = () => {
  try {
    const data = fs.readFileSync(attendanceFile, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
};


router.get('/stats', (req, res) => {
  try {
    const users = getUsers();
    const attendance = getAttendance();

    const stats = {
      totalUsers: users.length,
      totalStudents: users.filter(u => u.role === 'student').length,
      totalTeachers: users.filter(u => u.role === 'teacher').length,
      totalAttendanceRecords: attendance.length,
      recentAttendance: attendance.slice(-10)
    };

    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while retrieving stats' });
  }
});


router.get('/profile/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const users = getUsers();
    const attendance = getAttendance();


    const user = users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }


    let attendanceData = null;
    if (user.role === 'student') {
      const studentAttendance = attendance.filter(a => a.studentId === userId);
      if (studentAttendance.length > 0) {
        const totalDays = studentAttendance.length;
        const presentDays = studentAttendance.filter(a => a.status === 'present').length;
        const lateDays = studentAttendance.filter(a => a.status === 'late').length;
        const absentDays = studentAttendance.filter(a => a.status === 'absent').length;
        const effectivePresent = presentDays + (lateDays * 0.5);
        
        attendanceData = {
          totalDays,
          presentDays,
          lateDays,
          absentDays,
          attendancePercentage: ((effectivePresent / totalDays) * 100).toFixed(2)
        };
      }
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      },
      attendance: attendanceData
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while retrieving profile' });
  }
});


router.post('/profile/:userId/update', (req, res) => {
  try {
    const { userId } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const users = getUsers();
    const user = users.find(u => u.id === userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.name = name;
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

    res.json({ 
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while updating profile' });
  }
});

module.exports = router;
