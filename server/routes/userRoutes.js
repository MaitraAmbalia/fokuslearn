import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';
const router = express.Router();

const isProduction = process.env.NODE_ENV === 'production';

// ✅ SECURITY: Server-side XP constants — client cannot control these
const XP_REWARDS = {
  quiz: 25,
  video: 50,
};
const MAX_TIME_SPENT_PER_VIDEO = 300; // Max 5 hours in minutes

// @route   GET /api/users/profile
router.get('/profile', protect, async (req, res) => {
    try {
      const user = await User.findById(req.user._id).select('-password');
      res.json(user);
    } catch (error) {
      console.error('Profile fetch error:', error);
      res.status(500).json({ message: isProduction ? 'Failed to fetch profile' : error.message });
    }
});

// @route   PATCH /api/users/add-xp
// @desc    Award XP for completing actions (server determines amount)
router.patch('/add-xp', protect, [
  body('type').isIn(['quiz', 'video']).withMessage('Invalid action type'),
  body('timeSpent').optional().isInt({ min: 0, max: 300 }).withMessage('Invalid time value'),
], async (req, res) => {
  // ✅ SECURITY: Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const { type, timeSpent } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // ✅ SECURITY: XP amount determined by server, NOT client
    const xpAmount = XP_REWARDS[type] || 0;
    user.xp += xpAmount;
    
    // Level Up Logic
    const newLevel = Math.floor(user.xp / 100) + 1;
    if (newLevel > user.level) user.level = newLevel;

    // Update Specific Stats
    if (type === 'quiz') {
        user.stats.quizzesPassed += 1;
    }
    
    if (type === 'video') {
        // ✅ SECURITY: Cap timeSpent to reasonable maximum
        const safeTimeSpent = Math.min(Math.max(0, parseInt(timeSpent) || 10), MAX_TIME_SPENT_PER_VIDEO);
        user.stats.totalMinutes += safeTimeSpent;
        user.stats.videosCompleted += 1;
    }

    // Streak Logic
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    let lastDateStr = user.lastStudyDate ? new Date(user.lastStudyDate).toISOString().split('T')[0] : null;

    if (lastDateStr !== todayStr) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastDateStr === yesterdayStr) user.streak += 1;
        else user.streak = 1;
        
        user.lastStudyDate = today;
    }

    // Activity Log
    const logIndex = user.activityLog.findIndex(log => log.date === todayStr);
    if (logIndex !== -1) user.activityLog[logIndex].count += 1;
    else user.activityLog.push({ date: todayStr, count: 1 });

    await user.save();
    res.json(user);
  } catch (error) {
    console.error('Add XP error:', error);
    res.status(500).json({ message: isProduction ? 'Failed to update XP' : error.message });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile (Avatar, Bio, Name)
router.put('/profile', protect, [
  body('name').optional().trim().escape().isLength({ min: 1, max: 100 }).withMessage('Name must be 1-100 characters'),
  body('bio').optional().trim().isLength({ max: 500 }).withMessage('Bio must be under 500 characters'),
  body('avatar').optional().isURL().withMessage('Avatar must be a valid URL'),
], async (req, res) => {
  // ✅ SECURITY: Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  try {
    const user = await User.findById(req.user._id);

    if (user) {
      // Use !== undefined to allow clearing fields with empty string
      if (req.body.name !== undefined) user.name = req.body.name;
      if (req.body.avatar !== undefined) user.avatar = req.body.avatar;
      if (req.body.bio !== undefined) user.bio = req.body.bio;

      const updatedUser = await user.save();

      // ✅ SECURITY: Token no longer sent in response body
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        bio: updatedUser.bio,
        xp: updatedUser.xp,
        level: updatedUser.level,
        streak: updatedUser.streak,
        stats: updatedUser.stats,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: isProduction ? 'Failed to update profile' : error.message });
  }
});

export default router;