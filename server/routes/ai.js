import express from 'express';
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import { YoutubeTranscript } from 'youtube-transcript';
import { protect } from '../middleware/authMiddleware.js';

dotenv.config();
const router = express.Router();
const isProduction = process.env.NODE_ENV === 'production';

// Helper function to extract JSON array from text
const cleanAndParseJSON = (text) => {
  try {
    // 1. Remove markdown code blocks (e.g., ```json ... ```)
    let cleanText = text.replace(/```\w*\n?/g, '').replace(/```/g, '').trim();

    // 2. Find the first '[' and last ']' to extract the array
    const firstBracket = cleanText.indexOf('[');
    const lastBracket = cleanText.lastIndexOf(']');

    if (firstBracket !== -1 && lastBracket !== -1) {
      cleanText = cleanText.substring(firstBracket, lastBracket + 1);
    }

    return JSON.parse(cleanText);
  } catch (e) {
    console.error("JSON Parse Error:", e);
    throw new Error("AI response was not valid JSON");
  }
};

// ==========================================
// 1. QUIZ GENERATION
// ==========================================
// ✅ SECURITY: Added `protect` middleware — requires authentication
router.post('/quiz', protect, async (req, res) => {
  const { videoTitle, description, youtubeId } = req.body;

  console.log(`\n📢 Generating Quiz for: ${videoTitle}`);

  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("MISSING API KEY in .env file");
    }

    // 1. Fetch Transcript if youtubeId is provided
    let transcriptText = "";
    if (youtubeId) {
      try {
        console.log(`🔍 Fetching transcript for ${youtubeId}...`);
        const transcriptItems = await YoutubeTranscript.fetchTranscript(youtubeId);
        // Take first 15,000 chars to avoid token limits (approx 3-4k tokens)
        transcriptText = transcriptItems.map(item => item.text).join(' ').substring(0, 15000);
        console.log("✅ Transcript fetched successfully");
      } catch (err) {
        console.warn("⚠️ Could not fetch transcript, falling back to description:", err.message);
      }
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      You are a Senior Technical Interviewer. 
      Video Title: "${videoTitle}"
      
      CONTEXT (Use this to create questions):
      ${transcriptText ? `Transcript: "${transcriptText}..."` : `Description: "${description ? description.substring(0, 1000) : ''}..."`}
      
      Task: Based strictly on the provided context, create 3 HARD multiple choice questions.
      
      CRITICAL GUIDELINES:
      - Questions must be purely technical and about the subject matter (e.g., "What is a semaphore?", "How does deadlock occur?").
      - Do NOT reference "the video", "the tutorial", "the speaker", or "the context" in the question body or options.
      - Do NOT ask what the video covers (e.g., "What does this video discuss?"). Ask about the CONCEPTS.
      - If the context is missing or irrelevant, generate generic hard coding questions about: ${videoTitle}.

      Output: PURE JSON Array only. No markdown.
      
      Requirements:
      1. 'options' must be an array of 4 distinct strings.
      2. 'correctAnswer' must be an EXACT copy of one of the strings from 'options'.
      3. Do NOT prefix options with "A)", "1.", etc. just the text.

      Example Format:
      [
        { 
          "question": "What is the complexity of binary search?", 
          "options": ["O(n)", "O(log n)", "O(1)", "O(n^2)"], 
          "correctAnswer": "O(log n)" 
        }
      ]
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("✅ AI Replied:", text.substring(0, 50) + "...");

    const quizData = cleanAndParseJSON(text);
    res.json(quizData);

  } catch (error) {
    console.error("❌ QUIZ ERROR:", error.message);
    res.status(500).json({
      error: true,
      message: isProduction ? 'Failed to generate quiz' : (error.message || 'Failed to generate quiz')
    });
  }
});

// ==========================================
// 2. FLASHCARD GENERATION
// ==========================================
// ✅ SECURITY: Added `protect` middleware — requires authentication
router.post('/flashcards', protect, async (req, res) => {
  const { videoTitle, description, youtubeId } = req.body;

  console.log(`\n📢 Generating Flashcards for: ${videoTitle}`);

  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("MISSING API KEY in .env file");
    }

    // 1. Fetch Transcript if youtubeId is provided
    let transcriptText = "";
    if (youtubeId) {
      try {
        const transcriptItems = await YoutubeTranscript.fetchTranscript(youtubeId);
        transcriptText = transcriptItems.map(item => item.text).join(' ').substring(0, 15000);
      } catch (err) {
        console.warn("⚠️ Could not fetch transcript for flashcards, using fallback.");
      }
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      You are an Expert Mentor.
      Topic: "${videoTitle}".
      
      CONTEXT:
      ${transcriptText ? `Transcript: "${transcriptText}..."` : `Description: "${description ? description.substring(0, 1000) : ''}..."`}

      Task: Create 5 ADVANCED flashcards based on the provided context.
      
      CRITICAL GUIDELINES:
      - Flashcards must be technical (Concept vs Definition/Appication).
      - Do NOT reference "the video", "covered in the tutorial", etc.
      - If context is poor, generate standard expert-level flashcards for the topic: ${videoTitle}.

      Output: PURE JSON Array only.
      Format: [{ "front": "Question", "back": "Answer" }]
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("✅ AI Replied:", text.substring(0, 50) + "...");

    const flashcards = cleanAndParseJSON(text);
    res.json(flashcards);

  } catch (error) {
    console.error("❌ FLASHCARD ERROR:", error.message);
    res.status(500).json({
      error: true,
      message: isProduction ? 'Failed to generate flashcards' : (error.message || 'Failed to generate flashcards')
    });
  }
});

export default router;
