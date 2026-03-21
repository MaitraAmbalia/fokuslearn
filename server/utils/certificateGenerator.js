import { createCanvas, GlobalFonts, loadImage } from '@napi-rs/canvas';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

// 1. Setup __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper: Get AI Theme
const getThemeFromAI = async (courseTitle) => {
  try {
    if (!process.env.GEMINI_API_KEY) throw new Error("No Gemini API Key");

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      You are a Design Director.
      Course Title: "${courseTitle}"
      
      Task: Generate a design theme for a certificate.
      1. Hex Color: A professional, vibrant accent color matching the topic (e.g., Python=Blue/Yellow, React=Cyan, Design=Pink).
      2. Emoji: A single representative emoji (e.g., 🐍, ⚛️, 🎨).
      3. Badge Text: A short 1-3 word classification (e.g., "PYTHON DEV", "WEB EXPERT").

      Output JSON ONLY: { "color": "#hex", "emoji": "👾", "badgeText": "CATEGORY" }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```\w*\n?/g, '').replace(/```/g, '').trim();

    return JSON.parse(text);
  } catch (error) {
    console.warn("⚠️ AI Theme generation failed, using fallback:", error.message);
    return { color: '#2563eb', emoji: '🎓', badgeText: 'CERTIFIED' };
  }
};

export const generateCertificate = async (userName, courseTitle, date) => {
  // 1. Get Theme from AI
  const theme = await getThemeFromAI(courseTitle);
  console.log(`🎨 Generating Certificate with Theme:`, theme);

  const width = 2000;
  const height = 1414; // A4 Aspect Ratio
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // 2. Draw Background (Very Light Radial Gradient)
  const gradient = ctx.createRadialGradient(width / 2, height / 2, 100, width / 2, height / 2, width);
  gradient.addColorStop(0, '#ffffff');
  gradient.addColorStop(1, '#f8fafc'); // Very faint gray/blue tint for cleanliness
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // 3. Draw Watermark (Giant Faded Emoji)
  ctx.save();
  ctx.globalAlpha = 0.03; // Even more subtle
  ctx.font = '800px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(theme.emoji, width / 2, height / 2);
  ctx.restore();

  // 4. Draw Premium Border (Double Line - High Contrast)
  ctx.strokeStyle = theme.color;

  ctx.lineWidth = 15;
  ctx.strokeRect(50, 50, width - 100, height - 100);

  ctx.lineWidth = 3;
  ctx.strokeRect(80, 80, width - 160, height - 160);

  // 5. Header (Official Title)
  ctx.fillStyle = '#0f172a'; // Slate-900 (Nearly Black)
  ctx.font = 'bold 80px sans-serif'; // Fallback to system fonts for now
  ctx.textAlign = 'center';
  ctx.fillText('CERTIFICATE OF COMPLETION', width / 2, 300);

  // 6. "Presented to"
  ctx.font = '40px sans-serif';
  ctx.fillStyle = '#1e293b'; // Slate-800
  ctx.fillText('This is to certify that', width / 2, 420);

  // 7. User Name (High Contrast)
  ctx.font = 'bold 120px sans-serif';
  ctx.fillStyle = '#000000'; // Pure Black
  ctx.fillText(userName, width / 2, 580);

  // Underline for name
  ctx.beginPath();
  ctx.moveTo(width / 2 - 400, 610);
  ctx.lineTo(width / 2 + 400, 610);
  ctx.strokeStyle = theme.color;
  ctx.lineWidth = 4;
  ctx.stroke();

  // 8. "Has successfully completed"
  ctx.font = '40px sans-serif';
  ctx.fillStyle = '#334155'; // Slate-700
  ctx.fillText('has successfully demonstrated proficiency in', width / 2, 720);

  // 9. Course Title
  ctx.font = 'bold 90px sans-serif';
  ctx.fillStyle = theme.color; // Theme Color
  // Add shadow for better readability
  ctx.fillStyle = '#0f172a'; // Use dark slate for text itself
  ctx.save();
  ctx.shadowColor = theme.color;
  ctx.shadowBlur = 0;
  ctx.fillStyle = theme.color; // Actually use color but maybe darker?
  ctx.fillText(courseTitle, width / 2, 850);
  ctx.restore();

  // 10. Date
  const dateStr = new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  ctx.font = '40px sans-serif';
  ctx.fillStyle = '#334155'; // Slate-700
  ctx.fillText(`Issued on ${dateStr}`, width / 2, 1050);

  return canvas.toDataURL('image/png');
};
