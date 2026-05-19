const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/attendance';

mongoose.connect(MONGO_URI).then(async () => {
  const users = await User.find({ role: 'student' });
  console.log('Students in DB:', users.map(u => ({ id: u.id, name: u.name, group: u.group })));
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
