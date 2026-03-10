const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const usersFile = path.join(__dirname, '../data/users.json');
const attendanceFile = path.join(__dirname, '../data/attendance.json');

const getUsers = () => {
  try { return JSON.parse(fs.readFileSync(usersFile, 'utf8')); }
  catch (err) { return []; }
};

const getAttendance = () => {
  try { return JSON.parse(fs.readFileSync(attendanceFile, 'utf8')); }
  catch (err) { return []; }
};

const saveAttendance = (records) => {
  fs.writeFileSync(attendanceFile, JSON.stringify(records, null, 2));
};


router.post('/mark', (req, res) => {
  try {
    const { studentId, date, status } = req.body;

    if (!studentId || !date || !status) {
      return res.status(400).json({ error: 'studentId, date, and status are required' });
    }

    if (!['present', 'absent', 'late'].includes(status)) {
      return res.status(400).json({ error: 'Status must be present, absent, or late' });
    }

    const users = getUsers();
    const student = users.find(u => u.id === studentId && u.role === 'student');
    if (!student) {
      return res.status(404).json({ error: 'Student not found with this ID' });
    }

    const attendance = getAttendance();

    const existing = attendance.find(a => a.studentId === studentId && a.date === date);
    if (existing) {
      return res.status(400).json({ error: 'Attendance already marked for this student on this date' });
    }

    const record = {
      id: Date.now().toString(),
      studentId,
      studentName: student.name,
      date,
      status,
      markedAt: new Date()
    };

    attendance.push(record);
    saveAttendance(attendance);

    res.status(201).json({ message: 'Attendance marked successfully', record });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while marking attendance' });
  }
});


router.get('/record', (req, res) => {
  try {
    const { studentId, date } = req.query;

    if (!studentId || !date) {
      return res.status(400).json({ error: 'studentId and date are required' });
    }

    const attendance = getAttendance();
    const record = attendance.find(a => a.studentId === studentId && a.date === date);

    if (!record) {
      return res.status(404).json({ error: 'No attendance record found for this student on this date' });
    }

    res.json({ record });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while fetching attendance record' });
  }
});


router.post('/update', (req, res) => {
  try {
    const { recordId, studentId, date, status } = req.body;

    if (!status || !['present', 'absent', 'late'].includes(status)) {
      return res.status(400).json({ error: 'Valid status (present/absent/late) is required' });
    }

    const attendance = getAttendance();

    let record = null;
    if (recordId) {
      record = attendance.find(a => a.id === recordId);
    } else if (studentId && date) {
      record = attendance.find(a => a.studentId === studentId && a.date === date);
    }

    if (!record) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }

    record.status = status;
    record.updatedAt = new Date();
    saveAttendance(attendance);

    res.json({ message: 'Attendance updated successfully', record });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while updating attendance' });
  }
});


router.get('/my-attendance/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const attendance = getAttendance();

    const studentAttendance = attendance.filter(a => a.studentId === userId);

    if (studentAttendance.length === 0) {
      return res.status(404).json({ error: 'No attendance records found' });
    }

    const totalDays = studentAttendance.length;
    const presentDays = studentAttendance.filter(a => a.status === 'present').length;
    const lateDays = studentAttendance.filter(a => a.status === 'late').length;
    const absentDays = studentAttendance.filter(a => a.status === 'absent').length;
    const effectivePresent = presentDays + (lateDays * 0.5);

    res.json({
      totalDays,
      presentDays,
      lateDays,
      absentDays,
      attendancePercentage: ((effectivePresent / totalDays) * 100).toFixed(2),
      records: studentAttendance
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while retrieving attendance' });
  }
});


router.get('/view', (req, res) => {
  try {
    const { studentId, date, startDate, endDate } = req.query;
    let attendance = getAttendance();

    if (studentId) attendance = attendance.filter(a => a.studentId === studentId);
    if (date) attendance = attendance.filter(a => a.date === date);
    if (startDate) attendance = attendance.filter(a => a.date >= startDate);
    if (endDate) attendance = attendance.filter(a => a.date <= endDate);

    res.json({ records: attendance, total: attendance.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while viewing attendance' });
  }
});

module.exports = router;
