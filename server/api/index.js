import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import rateLimit from 'express-rate-limit';

// Import Routes
import authRoutes from '../routes/auth.js';
import goalRoutes from '../routes/goals.js';
import userRoutes from '../routes/userRoutes.js';
import youtubeRoutes from '../routes/youtube.js';
import aiRoutes from '../routes/ai.js';
import adminRoutes from '../routes/admin.js';
import '../config/passport.js'; // ✅ Load Passport Config

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';

// Increase JSON payload limit for large playlist data
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(passport.initialize());

// ✅ CORS Configuration - Only allow specific origins
const allowedOrigins = [
  "http://localhost:5173",
  "https://ytfocus.vercel.app",
  "https://yt-focus-eosin.vercel.app",
  "https://yt-focus-psi.vercel.app"
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Check if the origin matches our allowed list (no wildcards for security)
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("Blocked by CORS:", origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// ✅ SECURITY: Rate Limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per window
  message: { message: 'Too many attempts, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 15, // 15 AI requests per minute
  message: { message: 'Too many AI requests, please slow down' },
  standardHeaders: true,
  legacyHeaders: false,
});

const youtubeLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // 20 YouTube requests per minute
  message: { message: 'Too many requests, please slow down' },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute general
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(generalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/ai', aiLimiter);
app.use('/api/youtube', youtubeLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/users', userRoutes);
app.use('/api/youtube', youtubeRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.send('API is running successfully!');
});

// ✅ SECURITY: Global error handler — prevents stack traces leaking to clients
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(err.status || 500).json({
    message: isProduction ? 'Something went wrong' : err.message,
  });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ App connected to database');
    // Only listen if not running in Vercel (production serverless)
    if (process.env.NODE_ENV !== 'production') {
      app.listen(PORT, () => {
        console.log(`🚀 Server running on port: ${PORT}`);
      });
    }
  })
  .catch((error) => {
    console.error('❌ Database connection failed:', error);
  });

export default app;
