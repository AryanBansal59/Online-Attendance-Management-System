const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Try to load User model
let User;
try {
  User = require('./models/User');
} catch (e) {
  // If model is not found, define it inline
  const userSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'teacher', 'student'], default: 'student' },
    subject: String,
    profilePic: String,
    createdAt: { type: Date, default: Date.now }
  });
  User = mongoose.model('User', userSchema);
}

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/attendance');
    console.log('Connected to MongoDB');

    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const adminUser = new User({
      id: 'ADM001',
      name: 'System Admin',
      email: 'admin@attendtrack.com',
      password: hashedPassword,
      role: 'admin'
    });

    await adminUser.save();
    console.log('Admin user created successfully!');
    console.log('Email: admin@attendtrack.com');
    console.log('Password: admin123');
    
    await mongoose.connection.close();
  } catch (err) {
    console.error('Error creating admin:', err.message);
    process.exit(1);
  }
}

createAdmin();
