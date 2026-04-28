const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const User = require('./models/User');
const Attendance = require('./models/Attendance');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/attendance';

async function migrate() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for migration...');

    // Drop collections to ensure a clean migration with new schema/indexes
    try {
      await User.collection.drop();
      console.log('Users collection dropped.');
    } catch (e) {
      console.log('Users collection not found, skipping drop.');
    }

    try {
      await Attendance.collection.drop();
      console.log('Attendance collection dropped.');
    } catch (e) {
      console.log('Attendance collection not found, skipping drop.');
    }
    const usersPath = path.join(__dirname, 'data/users.json');
    if (fs.existsSync(usersPath)) {
      const usersData = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
      console.log(`Found ${usersData.length} users to migrate.`);
      
      for (const userData of usersData) {
        // Hash password before migrating
        if (userData.password) {
          userData.password = await bcrypt.hash(userData.password, 10);
        }
        
        // Use findOneAndUpdate to avoid duplicates if run multiple times
        await User.findOneAndUpdate(
          { id: userData.id },
          userData,
          { upsert: true, new: true }
        );
      }
      console.log('Users migration complete.');
    }

    // Migrate Attendance
    const attendancePath = path.join(__dirname, 'data/attendance.json');
    if (fs.existsSync(attendancePath)) {
      const attendanceData = JSON.parse(fs.readFileSync(attendancePath, 'utf8'));
      console.log(`Found ${attendanceData.length} attendance records to migrate.`);
      
      for (const record of attendanceData) {
        await Attendance.findOneAndUpdate(
          { id: record.id },
          record,
          { upsert: true, new: true }
        );
      }
      console.log('Attendance migration complete.');
    }

    console.log('All data successfully migrated to MongoDB!');
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

migrate();
