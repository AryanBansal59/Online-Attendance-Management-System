const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'public'));


app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use(express.static(path.join(__dirname, 'public')));

s
const authRoutes = require('./routes/auth');
const attendanceRoutes = require('./routes/attendance');
const dashboardRoutes = require('./routes/dashboard');


app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/dashboard', dashboardRoutes);


app.get('/', (req, res) => {
  res.render('index');
});


app.get('/dashboard', (req, res) => {
  res.render('dashboard');
});

app.get('/mark-attendance', (req, res) => {
  res.render('mark-attendance');
});

app.get('/view-attendance', (req, res) => {
  res.render('view-attendance');
});


app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log('Press Ctrl+C to stop the server');
});
