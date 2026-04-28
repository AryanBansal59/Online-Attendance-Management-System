const express = require('express');
const User = require('../models/User');
const Attendance = require('../models/Attendance');

const router = express.Router();

router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalTeachers = await User.countDocuments({ role: 'teacher' });
    const totalAttendanceRecords = await Attendance.countDocuments();
    
    // Get last 10 attendance records
    const recentAttendance = await Attendance.find().sort({ markedAt: -1 }).limit(10);

    const stats = {
      totalUsers,
      totalStudents,
      totalTeachers,
      totalAttendanceRecords,
      recentAttendance
    };

    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while retrieving stats' });
  }
});


router.get('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findOne({ id: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let attendanceData = null;
    if (user.role === 'student') {
      const studentAttendance = await Attendance.find({ studentId: userId });
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
        subject: user.subject,
        profilePic: user.profilePic,
        createdAt: user.createdAt
      },
      attendance: attendanceData
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while retrieving profile' });
  }
});


router.post('/profile/:userId/update', async (req, res) => {
  try {
    const { userId } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const user = await User.findOne({ id: userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.name = name;
    await user.save();

    res.json({ 
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while updating profile' });
  }
});

module.exports = router;
