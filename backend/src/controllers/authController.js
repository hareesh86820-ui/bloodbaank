const User = require('../models/User');
const Donor = require('../models/Donor');
const Hospital = require('../models/Hospital');
const OTP = require('../models/OTP');
const generateToken = require('../utils/generateToken');
const { sendOTPEmail } = require('../utils/mailer');
const crypto = require('crypto');

// Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Step 1: Send OTP to email
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    // Check if email already registered
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    // Delete any existing OTP for this email
    await OTP.deleteMany({ email: email.toLowerCase() });

    const otp = generateOTP();
    await OTP.create({ email: email.toLowerCase(), otp });
    await sendOTPEmail(email, otp);

    res.json({ message: 'OTP sent to your email' });
  } catch (err) {
    console.error('Send OTP error:', err.message);
    res.status(500).json({ message: 'Failed to send OTP. Check email configuration.' });
  }
};

// Step 2: Verify OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const record = await OTP.findOne({ email: email.toLowerCase(), otp });

    if (!record) return res.status(400).json({ message: 'Invalid OTP' });
    if (new Date() > record.expiresAt) return res.status(400).json({ message: 'OTP expired. Request a new one.' });

    // Mark as verified
    await OTP.findByIdAndUpdate(record._id, { verified: true });
    res.json({ message: 'Email verified', verified: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, role, location } = req.body;

    if (!name || !email || !phone || !password || !role) {
      return res.status(400).json({ message: 'Name, email, phone, password and role are required' });
    }

    const validRoles = ['donor', 'recipient', 'hospital', 'admin', 'ngo'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Check OTP was verified
    const otpRecord = await OTP.findOne({ email: email.toLowerCase(), verified: true });
    if (!otpRecord) {
      return res.status(400).json({ message: 'Email not verified. Please verify your email with OTP first.' });
    }

    const emailExists = await User.findOne({ email: email.toLowerCase() });
    if (emailExists) return res.status(400).json({ message: 'Email already registered' });

    const phoneExists = await User.findOne({ phone });
    if (phoneExists) return res.status(400).json({ message: 'Phone number already registered' });

    const user = await User.create({
      name, email: email.toLowerCase(), phone, password, role,
      isVerified: true, // email verified via OTP
      location: location || { type: 'Point', coordinates: [0, 0] }
    });

    if (role === 'donor') {
      const { bloodType, age, weight, healthInfo, priorityAlertOptIn } = req.body;
      if (!bloodType || !age || !weight) {
        await User.findByIdAndDelete(user._id);
        return res.status(400).json({ message: 'Donor requires bloodType, age and weight' });
      }
      await Donor.create({ user: user._id, bloodType, age: parseInt(age), weight: parseFloat(weight), healthInfo: healthInfo || {}, priorityAlertOptIn: priorityAlertOptIn || false });
    }

    if (role === 'hospital') {
      const { hospitalName, licenseNumber, address } = req.body;
      if (!hospitalName || !licenseNumber) {
        await User.findByIdAndDelete(user._id);
        return res.status(400).json({ message: 'Hospital requires hospitalName and licenseNumber' });
      }
      await Hospital.create({ user: user._id, name: hospitalName, licenseNumber, address: address || '', location: location || { type: 'Point', coordinates: [0, 0] } });
    }

    // Clean up OTP
    await OTP.deleteMany({ email: email.toLowerCase() });

    res.status(201).json({
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({ message: `${field} already registered` });
    }
    console.error('Register error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: 'Account has been deactivated. Contact support.' });
    }
    res.json({
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMe = async (req, res) => {
  res.json(req.user);
};

exports.updateFCMToken = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { fcmToken: req.body.fcmToken });
    res.json({ message: 'FCM token updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
