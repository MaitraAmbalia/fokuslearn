import axios from 'axios';

// 1. Determine the Base URL dynamically
// Vercel will provide VITE_API_URL; Localhost will fall back to port 5000
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// 2. Create the Axios instance
const isProduction = import.meta.env.MODE === 'production';

const api = axios.create({
  // In Vercel, the frontend and backend share the same domain (monorepo).
  // So we just hit `/api` in production. Local dev still uses localhost:5000.
  baseURL: import.meta.env.VITE_API_URL || (isProduction ? '/api' : 'http://localhost:5000/api'),
  withCredentials: true, // ✅ SECURITY: Relies solely on httpOnly cookies for auth
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ SECURITY: Removed localStorage token interceptor
// Authentication is now handled entirely via httpOnly cookies,
// which are automatically sent with every request via withCredentials: true.
// This eliminates the XSS attack vector of tokens stored in localStorage.

export default api;