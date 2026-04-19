import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.middleware.js';
import upload from '../middleware/upload.js';
import { sendOtpEmail } from '../utils/email.js';

const router = express.Router();

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, bio } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Missing required fields' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: 'Email already registered' });
    const user = await User.create({ name, email, password, bio });
    res.status(201).json({ token: generateToken(user._id), user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Must provide email and password' });
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const match = await user.matchPassword(password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });
    if (user.status !== 'active') return res.status(403).json({ message: 'Account is inactive' });
    res.json({ token: generateToken(user._id), user: { id: user._id, name: user.name, email: user.email, role: user.role, bio: user.bio, profilePic: user.profilePic } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/me', protect, async (req, res) => {
  res.json(req.user);
});

router.put('/profile', protect, upload.single('profilePic'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.name = req.body.name || user.name;
    user.bio = req.body.bio || user.bio;
    if (req.file) user.profilePic = `/uploads/${req.file.filename}`;
    await user.save();
    res.json({ message: 'Profile updated', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/change-password', protect, async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.password = password;
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save OTP and expiry to user (10 minutes)
    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpire = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();
    
    // Send OTP via email
    const emailResult = await sendOtpEmail(email, otp);
    
    if (!emailResult.success) {
      console.error('Email sending failed:', emailResult.message);
      // In development, log OTP to console as fallback
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[DEV MODE] OTP for ${email}: ${otp}`);
        return res.json({ 
          message: 'OTP sent to your email successfully',
          devOtp: otp // Remove this in production
        });
      }
      return res.status(500).json({ message: `Failed to send OTP email: ${emailResult.message}` });
    }
    
    res.json({ message: 'OTP sent to your email successfully' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });
    
    const user = await User.findOne({
      email,
      resetPasswordOtp: otp,
      resetPasswordOtpExpire: { $gt: new Date() }
    });
    
    if (!user) return res.status(400).json({ message: 'Invalid or expired OTP' });
    
    res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, password } = req.body;
    if (!email || !otp || !password) return res.status(400).json({ message: 'Email, OTP, and password are required' });
    
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    
    const user = await User.findOne({
      email,
      resetPasswordOtp: otp,
      resetPasswordOtpExpire: { $gt: new Date() }
    });
    
    if (!user) return res.status(400).json({ message: 'Invalid or expired OTP' });
    
    // Update password and clear OTP
    user.password = password;
    user.resetPasswordOtp = null;
    user.resetPasswordOtpExpire = null;
    await user.save();
    
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
