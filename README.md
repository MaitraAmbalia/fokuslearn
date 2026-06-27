# 🎯 YT Focus

> Turn YouTube Playlists into Focused Learning Journeys

YT Focus is a gamified learning platform that transforms YouTube playlists into structured, engaging courses. Watch videos step-by-step, unlock progress with quizzes, and track your learning journey with XP, streaks, and certificates.

![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-8.0-47A248?logo=mongodb&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)
[![Live Demo](https://img.shields.io/badge/Live-Demo-green?style=for-the-badge)](https://yt-focus-psi.vercel.app/)

---

## 🌐 Live Demo

🚀 **Try YT Focus here:**  
fokuslearn.vercel.app
  
> Note: Backend is hosted separately. First load may take a few seconds.

🎥 **Demo video:**  
- https://drive.google.com/file/d/1hQ6rjb2eEyoZFgc43rV0EDHNKSiMymM3/view

---
## ✨ Features

### 🔒 Video Locking System
Stay focused by unlocking videos one at a time. No skipping ahead until you complete the current lesson and pass the quiz.

### 🧠 AI-Powered Learning
- **AI Quizzes** - Automatically generated quizzes after each video to test your knowledge
- **AI Flashcards** - Smart flashcards generated from video content for better retention

### 📊 Progress Tracking
- **XP & Leveling** - Earn experience points for completing videos and quizzes
- **Daily Streaks** - Build consistent learning habits with streak tracking
- **Activity Graph** - Weekly contribution graph to visualize your learning journey

### 🏆 Achievements & Certificates
Earn certificates when you complete a course. Download and share your achievements with others.

### 📝 Personal Notes
Take notes while watching videos and save them for later reference.

---


## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern UI library
- **Vite** - Fast build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations
- **React Router** - Client-side routing
- **React Player** - Video playback
- **Radix UI** - Accessible UI primitives
- **Lucide React** - Beautiful icons

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Google Generative AI** - AI features for quizzes and flashcards

---

## 📁 Project Structure

```
yt-focus/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── ui/         # Base UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── VideoPlayer.jsx
│   │   │   ├── QuizModal.jsx
│   │   │   ├── Flashcard.jsx
│   │   │   └── ...
│   │   ├── pages/          # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── GoalDetail.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── Login.jsx
│   │   └── ...
│   └── package.json
│
├── server/                 # Express backend
│   ├── config/             # Database configuration
│   ├── middleware/         # Auth middleware
│   ├── models/             # Mongoose schemas
│   │   ├── User.js
│   │   └── Goal.js
│   ├── routes/             # API routes
│   │   ├── auth.js
│   │   ├── goals.js
│   │   ├── ai.js
│   │   ├── youtube.js
│   │   └── userRoutes.js
│   ├── utils/              # Helper utilities
│   └── index.js            # Server entry point
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB instance (local or Atlas)
- YouTube Data API key
- Google AI API key (for Gemini)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/prit-zalavadiya-78/yt-focus.git
   cd yt-focus
   ```

2. **Set up the backend**
   ```bash
   cd server
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   YOUTUBE_API_KEY=your_youtube_api_key
   GEMINI_API_KEY=your_google_ai_api_key
   ```

4. **Set up the frontend**
   ```bash
   cd ../client
   npm install
   ```

5. **Run the development servers**

   In the `server` directory:
   ```bash
   npm run dev
   ```

   In the `client` directory:
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to `http://localhost:5173` to use the application.

---

## 📖 How It Works

1. **Paste YouTube Playlist** - Add any YouTube playlist URL to create a learning goal
2. **Watch & Learn Step-by-Step** - Videos unlock sequentially as you progress
3. **Take Quizzes** - Pass AI-generated quizzes to unlock the next video
4. **Track Progress** - Earn XP, maintain streaks, and level up
5. **Earn Certificates** - Complete courses to receive downloadable certificates

---

## 🔑 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login user |

### Goals
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/goals` | Get all user goals |
| POST | `/api/goals` | Create a new goal |
| GET | `/api/goals/:id` | Get goal details |
| PUT | `/api/goals/:id` | Update goal |
| DELETE | `/api/goals/:id` | Delete goal |

### AI Features
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/quiz` | Generate quiz for video |
| POST | `/api/ai/flashcards` | Generate flashcards |

### User
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/profile` | Get user profile |
| PUT | `/api/user/profile` | Update profile |
| GET | `/api/user/stats` | Get user statistics |

---

## 👥 Team

Built with ❤️ for the Tech Sprint Hackathon 2025

---

## 🙏 Acknowledgments

- [YouTube Data API](https://developers.google.com/youtube/v3)
- [Google Generative AI](https://ai.google.dev/)
- [React](https://react.dev/)
- [TailwindCSS](https://tailwindcss.com/)
