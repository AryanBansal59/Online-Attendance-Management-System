const express = require('express');
const Attendance = require('../models/Attendance');
const User = require('../models/User');

const router = express.Router();

router.post('/mark', async (req, res) => {
  try {
    const { studentId, date, status, subject } = req.body;
    const trimmedStudentId = studentId ? studentId.trim() : '';
    const trimmedSubject = subject ? subject.trim() : '';

    if (!trimmedStudentId || !date || !status || !trimmedSubject) {
      return res.status(400).json({ error: 'studentId, date, status, and subject are required' });
    }

    if (!['present', 'absent', 'late'].includes(status)) {
      return res.status(400).json({ error: 'Status must be present, absent, or late' });
    }

    // Enforce: attendance can only be marked for today (IST)
    const today = new Intl.DateTimeFormat('en-CA', { 
      timeZone: 'Asia/Kolkata', 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    }).format(new Date());

    if (date !== today) {
      return res.status(400).json({ error: 'Attendance can only be marked for today\'s date' });
    }

    const student = await User.findOne({ id: trimmedStudentId, role: 'student' });
    if (!student) {
      return res.status(404).json({ error: 'Student not found with this ID' });
    }

    const existing = await Attendance.findOne({ studentId: trimmedStudentId, date, subject: trimmedSubject });
    if (existing) {
      return res.status(400).json({ error: 'Attendance already marked for this subject on this date' });
    }

    const record = new Attendance({
      id: Date.now().toString(),
      studentId: trimmedStudentId,
      studentName: student.name,
      date,
      status,
      subject: trimmedSubject
    });

    await record.save();

    res.status(201).json({ message: 'Attendance marked successfully', record });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while marking attendance' });
  }
});

router.get('/record', async (req, res) => {
  try {
    const { studentId, date, subject } = req.query;

    if (!studentId || !date || !subject) {
      return res.status(400).json({ error: 'studentId, date, and subject are required' });
    }

    const record = await Attendance.findOne({ 
      studentId: studentId.trim(), 
      date, 
      subject: subject.trim() 
    });

    if (!record) {
      return res.status(404).json({ error: 'No attendance record found for this student on this date for the selected subject' });
    }

    res.json({ record });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while fetching attendance record' });
  }
});

router.post('/update', async (req, res) => {
  try {
    const { recordId, studentId, date, status, subject } = req.body;

    if (!status || !['present', 'absent', 'late'].includes(status)) {
      return res.status(400).json({ error: 'Valid status (present/absent/late) is required' });
    }

    let record = null;
    if (recordId) {
      record = await Attendance.findOne({ id: recordId });
    } else if (studentId && date && subject) {
      record = await Attendance.findOne({ 
        studentId: studentId.trim(), 
        date, 
        subject: subject.trim() 
      });
    }

    if (!record) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }

    record.status = status;
    record.updatedAt = new Date();
    await record.save();

    res.json({ message: 'Attendance updated successfully', record });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while updating attendance' });
  }
});

router.get('/my-attendance/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const records = await Attendance.find({ studentId: userId });

    if (records.length === 0) {
      return res.status(404).json({ error: 'No attendance records found' });
    }

    // Overall stats
    const totalDays = records.length;
    const presentDays = records.filter(a => a.status === 'present').length;
    const lateDays = records.filter(a => a.status === 'late').length;
    const absentDays = records.filter(a => a.status === 'absent').length;
    const effectivePresent = presentDays + (lateDays * 0.5);

    // Subject-wise stats
    const subjectWise = {};
    records.forEach(a => {
      const sub = a.subject || 'General';
      if (!subjectWise[sub]) {
        subjectWise[sub] = { total: 0, present: 0, late: 0, absent: 0 };
      }
      subjectWise[sub].total++;
      if (a.status === 'present') subjectWise[sub].present++;
      else if (a.status === 'late') subjectWise[sub].late++;
      else if (a.status === 'absent') subjectWise[sub].absent++;
    });

    // Calculate percentages for each subject
    const subjectStats = Object.keys(subjectWise).map(sub => {
      const s = subjectWise[sub];
      const eff = s.present + (s.late * 0.5);
      return {
        subject: sub,
        total: s.total,
        present: s.present,
        late: s.late,
        absent: s.absent,
        percentage: ((eff / s.total) * 100).toFixed(2)
      };
    });

    res.json({
      overall: {
        totalDays,
        presentDays,
        lateDays,
        absentDays,
        attendancePercentage: ((effectivePresent / totalDays) * 100).toFixed(2),
      },
      subjectStats,
      records
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while retrieving attendance' });
  }
});

router.get('/view', async (req, res) => {
  try {
    const { studentId, date, startDate, endDate } = req.query;
    let query = {};

    if (studentId) query.studentId = studentId;
    if (date) query.date = date;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = startDate;
      if (endDate) query.date.$lte = endDate;
    }

    const attendance = await Attendance.find(query);

    res.json({ records: attendance, total: attendance.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while viewing attendance' });
  }
});

module.exports = router;
