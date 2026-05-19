const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authController = require('../controllers/auth');

const router = express.Router();

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

router.get('/signin', authController.getSignin);
router.post('/admin/add-user', upload.single('profilePic'), authController.addUser);
router.get('/admin/users', authController.getAdminUsers);
router.delete('/admin/users/:userId', authController.deleteUser);
router.put('/admin/users/:userId', upload.single('profilePic'), authController.updateUser);
router.post('/signin', authController.signin);
router.post('/google-signin', authController.googleSignin);
router.get('/users', authController.getUsers);

module.exports = router;
