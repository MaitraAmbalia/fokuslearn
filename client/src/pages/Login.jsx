import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Play, Loader2, AlertCircle } from 'lucide-react';

const Login = () => {
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(location.pathname !== '/signup');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const { user, login, register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setIsLogin(location.pathname !== '/signup');
  }, [location.pathname]);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let result;

      if (isLogin) {
        result = await login(formData.email, formData.password);
      } else {
        result = await register(formData.name, formData.email, formData.password);
      }

      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message);
      }

    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-700 transition-colors duration-300">

        <div className="bg-blue-600 p-8 text-center">
          <div className="inline-flex bg-white/20 p-3 rounded-xl mb-4 backdrop-blur-sm">
            <Play className="w-8 h-8 text-white fill-current" />
          </div>
          <h2 className="text-2xl font-bold text-white">
            {isLogin ? 'Welcome Back' : 'Join Fokuslearn'}
          </h2>
          <p className="text-blue-100 mt-2">
            {isLogin ? 'Continue your learning streak.' : 'Start your journey today.'}
          </p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Input */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Name</label>
                <input
                  type="text" name="name" required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  placeholder="John Doe"
                  value={formData.name} onChange={handleChange}
                />
              </div>
            )}

            {/* Email Input */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Email</label>
              <input
                type="email" name="email" required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                placeholder="you@example.com"
                value={formData.email} onChange={handleChange}
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Password</label>
              <input
                type="password" name="password" required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                placeholder="••••••••"
                value={formData.password} onChange={handleChange}
              />
            </div>

            <button
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center"
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400">Or continue with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={loginWithGoogle}
            className="w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-white py-3 rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google
          </button>

          <div className="mt-6 text-center text-sm text-slate-500">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => setIsLogin(!isLogin)} className="text-blue-600 font-bold hover:underline">
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
