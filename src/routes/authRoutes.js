// authRoutes.js
const express = require('express');
const authController = require('../controllers/authController');
// const upload = require('../middleware/uploadMiddleware');
const { uploadProfilePhoto } = require('../middleware/uploadMiddleware');

const router = express.Router();

// Authentication routes
// router.post('/register', authController.register);
// router.post('/register', upload.single('photo'), authController.register); // 'photo' is the field name
router.post('/register', uploadProfilePhoto, authController.register);
router.post('/login', authController.login);
router.post('/login/google', authController.loginWithGoogle);
router.post('/login/facebook', authController.loginWithFacebook);
router.get('/user/:uid', authController.getUserByUid); 

module.exports = router;

