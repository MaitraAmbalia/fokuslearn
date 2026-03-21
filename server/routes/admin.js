import express from 'express';
import User from '../models/User.js';
import Goal from '../models/Goal.js';
import { protect } from '../middleware/authMiddleware.js';
import { isAdmin } from '../middleware/adminMiddleware.js';

const router = express.Router();
const isProduction = process.env.NODE_ENV === 'production';

// @route   GET /api/admin/stats
// @desc    Get platform-wide analytics (admin only)
router.get('/stats', protect, isAdmin, async (req, res) => {
  try {
    // --- 1. Core Counts ---
    const totalUsers = await User.countDocuments();
    const totalGoals = await Goal.countDocuments();

    // Total videos watched (sum of completedVideos across all goals)
    const videosResult = await Goal.aggregate([
      { $group: { _id: null, total: { $sum: '$completedVideos' } } }
    ]);
    const totalVideosWatched = videosResult[0]?.total || 0;

    // Total certificates issued
    const certsResult = await User.aggregate([
      { $project: { certCount: { $size: { $ifNull: ['$certificates', []] } } } },
      { $group: { _id: null, total: { $sum: '$certCount' } } }
    ]);
    const totalCertificates = certsResult[0]?.total || 0;

    // Total learning minutes
    const minutesResult = await User.aggregate([
      { $group: { _id: null, total: { $sum: '$stats.totalMinutes' } } }
    ]);
    const totalMinutes = minutesResult[0]?.total || 0;

    // --- 2. Growth Data (last 30 days) ---
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailySignups = await User.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Fill in missing days with 0
    const growthData = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const found = dailySignups.find(s => s._id === dateStr);
      growthData.push({
        date: dateStr,
        label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count: found ? found.count : 0
      });
    }

    // New users this week
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const newUsersThisWeek = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    // --- 3. Top Courses (most popular goals by title) ---
    const topCourses = await Goal.aggregate([
      {
        $group: {
          _id: '$title',
          userCount: { $sum: 1 },
          avgProgress: { $avg: '$progress' },
          thumbnail: { $first: '$thumbnail' },
          instructor: { $first: '$instructor' }
        }
      },
      { $sort: { userCount: -1 } },
      { $limit: 5 }
    ]);

    // --- 4. Recent Signups ---
    const recentUsers = await User.find()
      .select('name email avatar level xp createdAt')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // --- 5. Platform activity (videos completed per day, last 7 days) ---
    const activityResult = await User.aggregate([
      { $unwind: '$activityLog' },
      {
        $match: {
          'activityLog.date': {
            $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          }
        }
      },
      {
        $group: {
          _id: '$activityLog.date',
          totalActivities: { $sum: '$activityLog.count' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      stats: {
        totalUsers,
        totalGoals,
        totalVideosWatched,
        totalCertificates,
        totalMinutes,
        newUsersThisWeek,
      },
      growthData,
      topCourses,
      recentUsers,
      weeklyActivity: activityResult,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ message: isProduction ? 'Failed to load stats' : error.message });
  }
});

export default router;
