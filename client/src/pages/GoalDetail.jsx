import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertTriangle, Zap, FileText, CheckCircle, ChevronRight } from 'lucide-react';

// Components
import Navbar from '../components/Navbar';
import VideoPlayer from '../components/VideoPlayer';
import RoadmapView from '../components/RoadmapView';
import QuizModal from '../components/QuizModal';
import NotesEditor from '../components/NotesEditor';
import ConfettiManager from '../components/ConfettiManager';
import Flashcard from '../components/Flashcard';

import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const GoalDetail = () => {
  const { id } = useParams();
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [goal, setGoal] = useState(null);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('notes');
  const [flashcards, setFlashcards] = useState([]);
  const [flashcardLoading, setFlashcardLoading] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState([]);
  const [triggerConfetti, setTriggerConfetti] = useState(false);
  const [quizCache, setQuizCache] = useState({});
  const pendingRequests = useRef({}); // Track in-flight promises

  useEffect(() => {
    const fetchGoal = async () => {
      try {
        const { data } = await api.get(`/goals/${id}`);
        setGoal(data);
        const activeVid = data.videos.find(v => v.isCurrent) || data.videos[0];
        setCurrentVideo(activeVid);

        // Optionally generate for the very first video if not watched
        if (activeVid && !activeVid.watched && !quizCache[activeVid._id]) {
          generateQuizInBackground(activeVid);
        }

      } catch (error) {
        console.error("Error fetching goal", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGoal();
  }, [id]);

  const generateQuizInBackground = async (video) => {
    // Check if already cached OR already fetching
    if (!video || quizCache[video._id] || pendingRequests.current[video._id]) return;

    console.log(`Background generating quiz for: ${video.title}`);

    // Create and store the promise
    const requestPromise = api.post('/ai/quiz', {
      videoTitle: video.title,
      description: "Coding tutorial",
      youtubeId: video.youtubeId
    });

    pendingRequests.current[video._id] = requestPromise;

    try {
      const { data } = await requestPromise;
      setQuizCache(prev => ({ ...prev, [video._id]: data }));
      console.log(`Quiz pre-generated for: ${video.title}`);
    } catch (error) {
      console.error("Background Quiz Gen Error:", error);
    } finally {
      // We keep the promise in pendingRequests until consumed or overwritten, 
      // OR we can remove it here. If we remove it here, handleVideoComplete 
      // might miss it if it fires exactly now.
      // Better strategy: Remove it only if it failed? 
      // Actually, if we remove it here, and handleVideoComplete runs, 
      // it will check cache. Cache is updated BEFORE this runs (await finishes).
      // So checking cache first in handleVideoComplete is safe.
      delete pendingRequests.current[video._id];
    }
  };

  const handleVideoComplete = async () => {
    if (!currentVideo) return;
    if (currentVideo.watched) {
      handleNextVideo();
      return;
    }

    setQuizLoading(true);
    setShowQuiz(true);

    // 1. Check Cache
    if (quizCache[currentVideo._id]) {
      setCurrentQuiz(quizCache[currentVideo._id]);
      setQuizLoading(false);
      return;
    }

    // 2. Check Pending Requests (Deduplication)
    if (pendingRequests.current[currentVideo._id]) {
      console.log("Attaching to existing background request...");
      try {
        const { data } = await pendingRequests.current[currentVideo._id];
        setCurrentQuiz(data);
        // Cache is handled by the background function, but we set local state here
      } catch (error) {
        const errorMsg = error.response?.data?.message || "Error loading quiz";
        setCurrentQuiz([{ question: errorMsg, options: ["Try Again"], correctAnswer: "Try Again" }]);
      } finally {
        setQuizLoading(false);
      }
      return;
    }

    // 3. Fallback to new API call if neither
    try {
      const requestPromise = api.post('/ai/quiz', {
        videoTitle: currentVideo.title,
        description: "Coding tutorial",
        youtubeId: currentVideo.youtubeId
      });

      // Mark as pending
      pendingRequests.current[currentVideo._id] = requestPromise;

      const { data } = await requestPromise;
      setCurrentQuiz(data);
      setQuizCache(prev => ({ ...prev, [currentVideo._id]: data }));
    } catch (error) {
      console.error("Quiz Error:", error);
      const errorMsg = error.response?.data?.message || "Error loading quiz";
      setCurrentQuiz([{ question: errorMsg, options: ["Try Again"], correctAnswer: "Try Again" }]);
    } finally {
      delete pendingRequests.current[currentVideo._id];
      setQuizLoading(false);
    }
  };

  const handleNextVideo = () => {
    if (!goal || !currentVideo) return;
    const currentIndex = goal.videos.findIndex(v => v._id === currentVideo._id);
    if (currentIndex !== -1 && currentIndex < goal.videos.length - 1) {
      const nextVid = goal.videos[currentIndex + 1];
      setCurrentVideo(nextVid);
      setFlashcards([]);

      // Try to generate ahead for the one AFTER next if strictly sequential? 
      // Or just ensure current one is generated (which it should have been by handleLevelUp)
    }
  };

  const handleLevelUp = async () => {
    setTriggerConfetti(true);
    try {
      const { data } = await api.patch(`/goals/${goal._id}/progress`, { videoId: currentVideo._id });

      setGoal(data);
      const nextVid = data.videos.find(v => v.isCurrent);
      if (nextVid) {
        setCurrentVideo(nextVid);
        setFlashcards([]);

        // 🚀 TRIGGER BACKGROUND GENERATION FOR THE NEW VIDEO
        generateQuizInBackground(nextVid);
      }

      // Refresh user data (Streak/Level)
      await refreshUser();
    } catch (error) {
      console.error(error);
    }
  };

  const handleGenerateFlashcards = async () => {
    setFlashcardLoading(true);
    try {
      const { data } = await api.post('/ai/flashcards', {
        videoTitle: currentVideo.title,
        description: "Coding tutorial",
        youtubeId: currentVideo.youtubeId
      });
      setFlashcards(data);
    } catch (error) {
      console.error(error);
    } finally {
      setFlashcardLoading(false);
    }
  };

  const handleSaveNotes = async (notesContent) => {
    if (!currentVideo || !goal) return;
    try {
      await api.patch(`/goals/${goal._id}/notes`, {
        videoId: currentVideo._id,
        notes: notesContent
      });
      setGoal(prev => ({
        ...prev,
        videos: prev.videos.map(v =>
          v._id === currentVideo._id ? { ...v, notes: notesContent } : v
        )
      }));
      setCurrentVideo(prev => ({ ...prev, notes: notesContent }));
    } catch (error) {
      console.error('Failed to save notes:', error);
    }
  };


  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
    </div>
  );
  if (!goal) return <div>Goal not found</div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar user={user} />
      <ConfettiManager trigger={triggerConfetti} setTrigger={setTriggerConfetti} />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-6">
          <ArrowLeft className="w-5 h-5" /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-black rounded-2xl overflow-hidden shadow-2xl aspect-video">
              {currentVideo?.youtubeId ? (
                <VideoPlayer url={`https://www.youtube.com/watch?v=${currentVideo.youtubeId}`} />
              ) : <div className="text-white p-10">Video Unavailable</div>}
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <div>
                <h1 className="text-xl font-bold dark:text-white">{currentVideo?.title}</h1>
                <span className="text-sm text-slate-500 dark:text-slate-400">{goal.completedVideos} / {goal.totalVideos} Completed</span>
              </div>
              <button onClick={handleVideoComplete} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex gap-2">
                {currentVideo?.watched ? <>Next <ChevronRight /></> : <>Complete <CheckCircle /></>}
              </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden min-h-[400px] flex flex-col">
              <div className="flex border-b border-slate-200 dark:border-slate-700">
                <button onClick={() => setActiveTab('notes')} className={`flex-1 py-4 font-bold ${activeTab === 'notes' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 dark:text-slate-400'}`}>Notes</button>
                <button onClick={() => setActiveTab('flashcards')} className={`flex-1 py-4 font-bold ${activeTab === 'flashcards' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 dark:text-slate-400'}`}>Flashcards</button>
              </div>

              <div className="flex-1 bg-slate-50/50 dark:bg-slate-900/50 p-6">
                {activeTab === 'notes' ? (
                  <NotesEditor note={currentVideo?.notes || ""} onSave={handleSaveNotes} />
                ) : (
                  <div className="flex flex-col items-center">
                    {flashcards.length === 0 ? (
                      <div className="text-center py-12">
                        <Zap className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                        <h3 className="font-bold text-xl mb-2 dark:text-white">Study Mode</h3>
                        <button onClick={handleGenerateFlashcards} disabled={flashcardLoading} className="bg-slate-900 dark:bg-blue-600 text-white px-8 py-3 rounded-xl font-bold">
                          {flashcardLoading ? "Generating..." : "Generate AI Flashcards"}
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                        {flashcards.map((c, i) => <Flashcard key={i} index={i} front={c.front} back={c.back} />)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <RoadmapView videos={goal.videos} currentVideoId={currentVideo?._id} onVideoSelect={(id) => setCurrentVideo(goal.videos.find(v => v._id === id))} />
          </div>
        </div>
      </div>
      <QuizModal isOpen={showQuiz} onClose={() => setShowQuiz(false)} onPass={handleLevelUp} questions={currentQuiz} loading={quizLoading} />
    </div>
  );
};

export default GoalDetail;
