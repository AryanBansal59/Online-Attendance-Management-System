const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key-change-in-production';


const usersFile = path.join(__dirname, '../data/users.json');


router.get('/signin', (req, res) => {
  res.render('signin');
});


const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(usersFile, JSON.stringify([], null, 2));
}


const getUsers = () => {
  try {
    const data = fs.readFileSync(usersFile, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
};


const saveUsers = (users) => {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
};


router.post('/admin/add-user', (req, res) => {
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

    const users = getUsers();

    if (users.find(u => u.id === userId)) {
      return res.status(400).json({ error: 'A user with this ID already exists' });
    }

    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const newUser = {
      id: userId,
      name,
      email,
      password: password,
      role,
      ...(role === 'teacher' && { subject }),
      createdAt: new Date()
    };

    users.push(newUser);
    saveUsers(users);

    res.status(201).json({ 
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} added successfully`,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        ...(newUser.subject && { subject: newUser.subject })
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while adding user' });
  }
});


router.get('/admin/users', (req, res) => {
  try {
    const users = getUsers();

    const safeUsers = users.map(({ password, ...user }) => user);
    res.json({
      totalUsers: users.length,
      users: safeUsers
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while retrieving users' });
  }
});


router.delete('/admin/users/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    let users = getUsers();

    const userToDelete = users.find(u => u.id === userId);
    if (!userToDelete) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (userToDelete.role === 'admin') {
      return res.status(403).json({ error: 'Cannot delete admin users' });
    }

    users = users.filter(u => u.id !== userId);
    saveUsers(users);

    res.json({
      message: `${userToDelete.name} has been removed`,
      user: userToDelete
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while deleting user' });
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

    const users = getUsers();

    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = password === user.password;
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
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error during signin' });
  }
});


router.get('/users', (req, res) => {
  try {
    const users = getUsers();
    const userList = users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role
    }));
    res.json(userList);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
