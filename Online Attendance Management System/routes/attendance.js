const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();


const attendanceFile = path.join(__dirname, '../data/attendance.json');


const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
if (!fs.existsSync(attendanceFile)) {
  fs.writeFileSync(attendanceFile, JSON.stringify([], null, 2));
}


const getAttendance = () => {
  try {
    const data = fs.readFileSync(attendanceFile, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
};


const saveAttendance = (records) => {
  fs.writeFileSync(attendanceFile, JSON.stringify(records, null, 2));
};


router.post('/mark', (req, res) => {
  try {
    const { studentId, studentName, date, status } = req.body;


    if (!studentId || !studentName || !date || !status) {
      return res.status(400).json({ 
        error: 'All fields required: studentId, studentName, date, status' 
      });
    }


    if (!['present', 'absent'].includes(status)) {
      return res.status(400).json({ 
        error: 'Status must be present or absent' 
      });
    }

    const attendance = getAttendance();


    const record = {
      id: Date.now().toString(),
      studentId,
      studentName,
      date,
      status,
      markedAt: new Date()
    };

    attendance.push(record);
    saveAttendance(attendance);

    res.status(201).json({ 
      message: 'Attendance marked successfully',
      record
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while marking attendance' });
  }
});


router.get('/my-attendance/:studentId', (req, res) => {
  try {
    const { studentId } = req.params;
    const attendance = getAttendance();


    const studentAttendance = attendance.filter(a => a.studentId === studentId);

    if (studentAttendance.length === 0) {
      return res.json({
        studentId,
        name: 'N/A',
        attendancePercentage: 0,
        totalDays: 0,
        presentDays: 0,
        lateDays: 0,
        absentDays: 0,
        records: [],
        message: 'No attendance records found yet'
      });
    }


    const totalDays = studentAttendance.length;
    const presentDays = studentAttendance.filter(a => a.status === 'present').length;
    const lateDays = studentAttendance.filter(a => a.status === 'late').length;
    const absentDays = studentAttendance.filter(a => a.status === 'absent').length;


    const effectivePresent = presentDays + (lateDays * 0.5);
    const attendancePercentage = ((effectivePresent / totalDays) * 100).toFixed(2);

    res.json({
      studentId,
      name: studentAttendance[0].studentName,
      attendancePercentage: parseFloat(attendancePercentage),
      totalDays,
      presentDays,
      lateDays,
      absentDays,
      records: studentAttendance
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while retrieving attendance' });
  }
});


router.get('/all', (req, res) => {
  try {
    const attendance = getAttendance();

    if (attendance.length === 0) {
      return res.json({ 
        message: 'No attendance records found',
        records: [] 
      });
    }

    res.json({
      totalRecords: attendance.length,
      records: attendance
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while retrieving all attendance' });
  }
});


router.get('/summary', (req, res) => {
  try {
    const attendance = getAttendance();


    const summary = {};
    attendance.forEach(record => {
      if (!summary[record.studentId]) {
        summary[record.studentId] = {
          studentId: record.studentId,
          name: record.studentName,
          totalDays: 0,
          presentDays: 0,
          lateDays: 0,
          absentDays: 0
        };
      }

      summary[record.studentId].totalDays++;
      if (record.status === 'present') summary[record.studentId].presentDays++;
      else if (record.status === 'late') summary[record.studentId].lateDays++;
      else if (record.status === 'absent') summary[record.studentId].absentDays++;
    });


    const summaryList = Object.values(summary).map(s => ({
      ...s,
      attendancePercentage: s.totalDays > 0 
        ? (((s.presentDays + (s.lateDays * 0.5)) / s.totalDays) * 100).toFixed(2)
        : 0
    }));

    res.json({
      totalStudents: summaryList.length,
      summary: summaryList
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while retrieving summary' });
  }
});

module.exports = router;
