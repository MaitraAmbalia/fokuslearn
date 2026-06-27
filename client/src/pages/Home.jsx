import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Link2, MonitorPlay, ClipboardCheck, Lock, FileText, Brain, TrendingUp, Target, Award, CheckCircle2, ArrowRight, Sun, Moon } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const Home = () => {
  const { theme, toggleTheme } = useTheme();
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">

      {/* --- Sticky Navbar --- */}
      <nav className="sticky top-0 z-50 w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          {/* Logo Section */}
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => window.scrollTo(0, 0)}>
            <div className="bg-blue-600 p-2 rounded-xl group-hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
              <Play className="w-5 h-5 text-white fill-current" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">Fokuslearn</span>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-4 sm:gap-6">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <Link to="/login" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium text-sm hidden sm:block transition-colors">
              Login
            </Link>
            <Link
              to="/signup"
              className="bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 px-5 py-2.5 rounded-full font-medium text-sm transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              Sign Up Free
            </Link>
          </div>

        </div>
      </nav>

      {/* --- Hero Section --- */}
      <main className="relative pt-20 pb-32 overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-blob" />
          <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-200" />
          <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] bg-pink-400/20 dark:bg-pink-600/10 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-400" />
        </div>

        <motion.div
          style={{ opacity, scale }}
          className="max-w-4xl mx-auto px-6 text-center"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-xs font-semibold mb-6 border border-blue-100 dark:border-blue-800">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            v2.0 is now live
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 dark:text-white mb-8 leading-[1.1]">
            Master any subject with <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400">
              Focused Learning
            </span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-xl text-slate-500 dark:text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Turn chaotic YouTube playlists into structured courses.
            Get AI-generated summaries, quizzes, and flashcards to supercharge your retention.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/login"
              className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-full bg-blue-600 dark:bg-blue-500 px-8 font-medium text-white transition-all hover:bg-blue-700 dark:hover:bg-blue-600 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/30"
            >
              <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-100%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(100%)]">
                <div className="relative h-full w-8 bg-white/20" />
              </div>
              <span className="flex items-center gap-2">
                <Play className="w-4 h-4 fill-current" />
                Start Learning Now
              </span>
            </Link>
            <a
              href="#how-it-works"
              className="px-8 py-3.5 rounded-full text-slate-600 dark:text-slate-300 font-medium hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-2"
            >
              How it Works <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>
        </motion.div>
      </main>

      {/* --- How It Works Section --- */}
      <section id="how-it-works" className="py-24 bg-white dark:bg-slate-900/50 relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Streamlined Learning Flow</h2>
            <p className="text-slate-500 dark:text-slate-400">Three simple steps to transform how you watch educational content.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              number="01"
              icon={<Link2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />}
              title="Import Playlist"
              description="Paste any YouTube playlist URL. We'll instantly convert it into a structured course curriculum."
              delay={0}
            />
            <StepCard
              number="02"
              icon={<MonitorPlay className="w-8 h-8 text-purple-600 dark:text-purple-400" />}
              title="Focused Viewing"
              description="Watch distraction-free. Videos are locked until you verify completion, ensuring real progress."
              delay={0.2}
            />
            <StepCard
              number="03"
              icon={<Brain className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />}
              title="Master Content"
              description="Test yourself with AI-generated quizzes and flashcards after every lesson to cement your knowledge."
              delay={0.4}
            />
          </div>
        </div>
      </section>

      {/* --- Features Grid Section --- */}
      <section className="py-24 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">Built for Serious Learners</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg">
              Unlike standard YouTube, our platform is designed to optimize your cognitive load and retention.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Lock className="w-6 h-6 text-blue-500" />}
              title="Progression Lock"
              description="Prevent skimming. Unlock the next video only after you truly finish the current one."
            />
            <FeatureCard
              icon={<FileText className="w-6 h-6 text-purple-500" />}
              title="AI Flashcards"
              description="Smart flashcards generated instantly from video captions to help you memorize key concepts."
            />
            <FeatureCard
              icon={<CheckCircle2 className="w-6 h-6 text-emerald-500" />}
              title="Instant Quizzes"
              description="Validate your understanding with auto-generated multiple-choice questions for every video."
            />
            <FeatureCard
              icon={<TrendingUp className="w-6 h-6 text-orange-500" />}
              title="Detailed Analytics"
              description="Track XP, streaks, and completion rates. Visualize your improvement over time."
            />
            <FeatureCard
              icon={<Target className="w-6 h-6 text-teal-500" />}
              title="Goal Setting"
              description="Define your learning path. Set active goals and deadlines to keep yourself accountable."
            />
            <FeatureCard
              icon={<Award className="w-6 h-6 text-yellow-500" />}
              title="Certificates"
              description="Earn verifiable certificates upon course completion to showcase your new skills."
            />
          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">

          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Play className="w-4 h-4 text-white fill-current" />
            </div>
            <span className="font-bold text-slate-700 dark:text-slate-200 text-lg">Fokuslearn</span>
          </div>

          <div className="flex gap-8 text-sm text-slate-500 dark:text-slate-400">
            <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Terms</a>
            <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Twitter</a>
            <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">GitHub</a>
          </div>

          <p className="text-sm text-slate-400 dark:text-slate-500">© 2026 Fokuslearn. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

// --- Sub-components ---

const StepCard = ({ number, icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    className="relative p-8 rounded-3xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800 transition-all group"
  >
    <div className="absolute top-6 right-8 text-6xl font-black text-slate-100 dark:text-slate-700/50 -z-0 select-none group-hover:text-blue-50 dark:group-hover:text-blue-900/30 transition-colors">
      {number}
    </div>
    <div className="relative z-10">
      <div className="w-14 h-14 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-slate-100 dark:border-slate-700 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{title}</h3>
      <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
    </div>
  </motion.div>
);

const FeatureCard = ({ icon, title, description }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 dark:hover:shadow-blue-500/10 transition-all"
  >
    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center mb-6">
      {icon}
    </div>
    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">{title}</h3>
    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{description}</p>
  </motion.div>
);

export default Home;
