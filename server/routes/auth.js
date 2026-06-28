import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import passport from 'passport';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
const isProduction = process.env.NODE_ENV === 'production';

// Generate Token — reduced to 7 days for security
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

// Set Cookie Helper — fixed sameSite for cross-origin deployment
const setTokenCookie = (res, token) => {
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax', // 'none' for cross-origin prod, 'lax' for localhost
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// @route   GET /api/auth/test-google
// @desc    Test if auth route is active
router.get('/test-google', (req, res) => {
  res.send('Google auth route is here!');
});

// @route   GET /api/auth/google
// @desc    Auth with Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// @route   GET /api/auth/google/callback
// @desc    Google auth callback
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    const token = generateToken(req.user._id);
    setTokenCookie(res, token);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/dashboard`);
  }
);

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', [
  body('name').trim().escape().isLength({ min: 1, max: 100 }).withMessage('Name is required (1-100 characters)'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number'),
], async (req, res) => {
  // ✅ SECURITY: Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const { name, email, password, avatar } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      avatar: avatar || defaultAvatar,
    });

    if (user) {
      const token = generateToken(user._id);
      setTokenCookie(res, token);

      // ✅ SECURITY: Token no longer sent in response body
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        streak: user.streak || 0,
        level: user.level || 1,
        xp: user.xp || 0,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: isProduction ? 'Registration failed' : error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Auth user & get token
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
], async (req, res) => {
  // ✅ SECURITY: Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && user.password && (await bcrypt.compare(password, user.password))) {
      const token = generateToken(user._id);
      setTokenCookie(res, token);

      // ✅ SECURITY: Token no longer sent in response body
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        streak: user.streak,
        level: user.level,
        xp: user.xp,
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: isProduction ? 'Login failed' : error.message });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user / clear cookie
router.post('/logout', (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out' });
});

// @route   GET /api/auth/me
// @desc    Get current user
router.get('/me', protect, async (req, res) => {
  const userObj = req.user.toObject();
  
  // Inject isAdmin flag if email matches ADMIN_EMAIL from env
  if (process.env.ADMIN_EMAIL && userObj.email === process.env.ADMIN_EMAIL) {
    userObj.isAdmin = true;
  }
  
  res.status(200).json(userObj);
});

export default router;
