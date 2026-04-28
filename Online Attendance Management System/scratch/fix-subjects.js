const mongoose = require('mongoose');
require('dotenv').config();

const Attendance = require('../models/Attendance');

async function fixSubjects() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/attendance');
  console.log('Connected to MongoDB');

  // Update all records with no subject to 'DSA'
  const result = await Attendance.updateMany(
    { $or: [{ subject: { $exists: false } }, { subject: null }, { subject: '' }] },
    { $set: { subject: 'DSA' } }
  );

  console.log(`Updated ${result.modifiedCount} attendance record(s) → subject set to "DSA"`);
  await mongoose.connection.close();
}

fixSubjects().catch(err => { console.error(err); process.exit(1); });
