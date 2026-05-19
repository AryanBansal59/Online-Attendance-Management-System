const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const Attendance = require('../models/Attendance');

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'your-google-client-id.apps.googleusercontent.com';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

const MAIN_ADMIN_EMAIL = 'admin@attendtrack.com';

exports.getSignin = (req, res) => {
  res.render('signin', { googleClientId: GOOGLE_CLIENT_ID });
};

exports.addUser = async (req, res) => {
  try {
    const { userId, name, email, password, role, subject, group } = req.body;

    if (!userId || !name || !email || !password || !role) {
      return res.status(400).json({ 
        error: 'All fields are required (userId, name, email, password, role)' 
      });
    }

    if (!['student', 'teacher', 'admin'].includes(role)) {
      return res.status(400).json({ 
        error: 'Role must be student, teacher, or admin' 
      });
    }

    if (role === 'teacher' && !subject) {
      return res.status(400).json({
        error: 'Subject is required for teachers'
      });
    }

    if (role === 'student' && !group) {
      return res.status(400).json({
        error: 'Group is required for students'
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
      group: role === 'student' ? group : undefined,
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
        group: newUser.group,
        profilePic: newUser.profilePic
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while adding user' });
  }
};

exports.getAdminUsers = async (req, res) => {
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
};

exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const userToDelete = await User.findOne({ id: userId });
    if (!userToDelete) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (userToDelete.email === MAIN_ADMIN_EMAIL) {
      return res.status(403).json({ error: 'Cannot delete the main admin account' });
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
};

exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newUserId, name, email, password, role, subject, group } = req.body;

    const user = await User.findOne({ id: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let finalId = userId;
    if (newUserId && newUserId !== userId) {
      const idExists = await User.findOne({ id: newUserId });
      if (idExists) {
        return res.status(400).json({ error: 'New User ID already exists' });
      }
      
      user.id = newUserId;
      finalId = newUserId;

      await Attendance.updateMany(
        { studentId: userId },
        { $set: { studentId: newUserId } }
      );
    }

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
    
    if (role) {
      if (!['student', 'teacher', 'admin'].includes(role)) {
        return res.status(400).json({ error: 'Role must be student, teacher, or admin' });
      }
      user.role = role;
    }
    
    if (user.role === 'teacher') {
      user.subject = subject || user.subject;
    } else {
      user.subject = undefined;
    }

    if (user.role === 'student') {
      user.group = group || user.group;
    } else {
      user.group = undefined;
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
        subject: user.subject,
        group: user.group
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while updating user' });
  }
};

exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }

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
};

exports.googleSignin = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'No token provided' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const email = payload.email;

    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(403).json({ error: 'User not registered. Contact admin to add your email.' });
    }

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
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('id name email role profilePic group');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
