const router = require('express').Router();
const { register, login, getMe, updateFCMToken, sendOTP, verifyOTP } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/fcm-token', protect, updateFCMToken);

module.exports = router;
