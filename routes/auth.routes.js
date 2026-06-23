import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { verifyToken } from '../middleware/auth.js';
import { setTokenCookie, clearTokenCookie } from '../utils/generateToken.js';

const router = express.Router();

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z]).{6,}$/;

router.post('/register', async (req, res) => {
  try {
    const { name, email, photoURL, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All required fields must be filled.' });
    }

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters with one uppercase and one lowercase letter.',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Password and Confirm Password must match.' });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Email already registered. Please login.' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      photoURL: photoURL || '',
      password: hashed,
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please login.',
      user: { name: user.name, email: user.email, photoURL: user.photoURL },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.password) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = setTokenCookie(res, { id: user._id, email: user.email, name: user.name, photoURL: user.photoURL });

    res.json({
      success: true,
      message: 'Login successful.',
      user: { name: user.name, email: user.email, photoURL: user.photoURL },
      token,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/google', async (req, res) => {
  try {
    const { name, email, photoURL } = req.body;

    if (!email || !name) {
      return res.status(400).json({ success: false, message: 'Google login data is incomplete.' });
    }

    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      user = await User.create({
        name,
        email: email.toLowerCase(),
        photoURL: photoURL || '',
        password: '',
      });
    } else if (photoURL && user.photoURL !== photoURL) {
      user.photoURL = photoURL;
      await user.save();
    }

    const token = setTokenCookie(res, { id: user._id, email: user.email, name: user.name, photoURL: user.photoURL });

    res.json({
      success: true,
      message: 'Google login successful.',
      user: { name: user.name, email: user.email, photoURL: user.photoURL },
      token,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/logout', (req, res) => {
  clearTokenCookie(res);
  res.json({ success: true, message: 'Logged out successfully.' });
});

router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.json({
      success: true,
      user: { name: user.name, email: user.email, photoURL: user.photoURL },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
