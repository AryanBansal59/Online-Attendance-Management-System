const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const Attendance = require('../models/Attendance');

const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'your-google-client-id.apps.googleusercontent.com';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Setup Multer for Profile Picture Uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '../public/uploads/profiles');
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

router.get('/signin', (req, res) => {
  res.render('signin', { googleClientId: GOOGLE_CLIENT_ID });
});

// Create a new user (Admin functionality)
router.post('/admin/add-user', upload.single('profilePic'), async (req, res) => {
  try {
    const { userId, name, email, password, role, subject } = req.body;

    if (!userId || !name || !email || !password || !role) {
      return res.status(400).json({ 
        error: 'All fields are required (userId, name, email, password, role)' 
      });
    }

    if (!['student', 'teacher'].includes(role)) {
      return res.status(400).json({ 
        error: 'Role must be student or teacher' 
      });
    }

    if (role === 'teacher' && !subject) {
      return res.status(400).json({
        error: 'Subject is required for teachers'
      });
    }

    const existingUser = await User.findOne({ $or: [{ id: userId }, { email }] });
    if (existingUser) {
      return res.status(400).json({ error: 'User ID or Email already exists' });
    }

    const profilePicPath = req.file ? `/uploads/profiles/${req.file.filename}` : null;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      id: userId,
      name,
      email,
      password: hashedPassword,
      role,
      subject: role === 'teacher' ? subject : undefined,
      profilePic: profilePicPath
    });

    await newUser.save();

    res.status(201).json({ 
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} added successfully`,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        subject: newUser.subject,
        profilePic: newUser.profilePic
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while adding user' });
  }
});


router.get('/admin/users', async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json({
      totalUsers: users.length,
      users: users
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while retrieving users' });
  }
});


router.delete('/admin/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const userToDelete = await User.findOne({ id: userId });
    if (!userToDelete) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (userToDelete.role === 'admin') {
      return res.status(403).json({ error: 'Cannot delete admin users' });
    }

    await User.deleteOne({ id: userId });

    res.json({
      message: `${userToDelete.name} has been removed`,
      user: userToDelete
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while deleting user' });
  }
});

// Update an existing user (Admin functionality)
router.put('/admin/users/:userId', upload.single('profilePic'), async (req, res) => {
  try {
    const { userId } = req.params;
    const { newUserId, name, email, password, role, subject } = req.body;

    const user = await User.findOne({ id: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role === 'admin' && userId !== req.body.currentAdminId) { 
      // Prevent editing other admins unless specific permissions are added later
      return res.status(403).json({ error: 'Cannot update admin users' });
    }

    // Handle User ID Change (Cascading)
    let finalId = userId;
    if (newUserId && newUserId !== userId) {
      const idExists = await User.findOne({ id: newUserId });
      if (idExists) {
        return res.status(400).json({ error: 'New User ID already exists' });
      }
      
      // Update User ID in the User document
      user.id = newUserId;
      finalId = newUserId;

      // Cascade update to Attendance records
      await Attendance.updateMany(
        { studentId: userId },
        { $set: { studentId: newUserId } }
      );
      
      console.log(`Cascaded User ID change from ${userId} to ${newUserId} across attendance records.`);
    }

    // Check if new email is already taken by another user
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ error: 'Email already in use by another user' });
      }
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }
    
    if (role && user.role !== 'admin') { // Don't let admin change their own role here
      if (!['student', 'teacher'].includes(role)) {
        return res.status(400).json({ error: 'Role must be student or teacher' });
      }
      user.role = role;
    }
    
    if (user.role === 'teacher') {
      user.subject = subject || user.subject;
    } else {
      user.subject = undefined;
    }

    if (req.file) {
      user.profilePic = `/uploads/profiles/${req.file.filename}`;
    }

    await user.save();

    res.json({
      message: 'User updated successfully' + (newUserId && newUserId !== userId ? ' (User ID cascaded)' : ''),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        subject: user.subject
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while updating user' });
  }
});


router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }

    // Allow login with either email or user ID
    const user = await User.findOne({ 
      $or: [{ email: email }, { id: email }] 
    });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      SECRET_KEY,
      { expiresIn: '7d' }
    );

    res.json({ 
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        subject: user.subject || null,
        profilePic: user.profilePic
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error during signin' });
  }
});

// Google Sign-in Endpoint
router.post('/google-signin', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'No token provided' });
    }

    // Verify token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const email = payload.email;

    // Check if user exists in the database
    const user = await User.findOne({ email });
    
    if (!user) {
      // For this system, users are added by Admin. 
      return res.status(403).json({ error: 'User not registered. Contact admin to add your email.' });
    }

    // Sign JWT
    const jwtToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      SECRET_KEY,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token: jwtToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic || payload.picture
      }
    });
    
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(401).json({ error: 'Invalid Google Token or Auth Error' });
  }
});

router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}).select('id name email role profilePic');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
