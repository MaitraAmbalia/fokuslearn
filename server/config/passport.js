import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                console.log("🔍 Google Strategy Callback Triggered");
                console.log("👤 Profile ID:", profile.id);
                console.log("📧 Profile Email:", profile.emails[0].value);

                // 1. Check if user exists by googleId
                let user = await User.findOne({ googleId: profile.id });

                if (user) {
                    console.log("✅ User found by Google ID");
                    return done(null, user);
                }

                // 2. Check if user exists by email
                user = await User.findOne({ email: profile.emails[0].value });

                if (user) {
                    console.log("✅ User found by Email (Linking Google ID)");
                    // Link Google account
                    user.googleId = profile.id;
                    await user.save();
                    return done(null, user);
                }

                console.log("🆕 Creating new user...");
                // 3. Create new user
                user = await User.create({
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    // ✅ SECURITY: No dummy password — password field is optional for OAuth users
                    googleId: profile.id,
                    avatar: profile.photos[0]?.value || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.displayName)}&background=random`,
                });
                console.log("✅ New user created successfully");

                done(null, user);
            } catch (error) {
                console.error("❌ Google Strategy Error:", error);
                done(error, null);
            }
        }
    )
);
