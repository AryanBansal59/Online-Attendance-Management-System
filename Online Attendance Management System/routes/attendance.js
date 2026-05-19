const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance');

router.post('/mark', attendanceController.markAttendance);
router.get('/record', attendanceController.getRecord);
router.post('/update', attendanceController.updateAttendance);
router.get('/my-attendance/:userId', attendanceController.getMyAttendance);
router.get('/view', attendanceController.viewAttendance);

// Group Attendance Routes
router.post('/mark-group', attendanceController.markAttendanceByGroup);
router.get('/students-by-group', attendanceController.getStudentsByGroup);
router.post('/update-group', attendanceController.updateAttendanceByGroup);
router.post('/mark-bulk', attendanceController.markBulkAttendance);

module.exports = router;
