// Eagle Vision — HR Login Page
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';
import { hrApi } from '../services/hrApi';

export const HRLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('hr@eaglevision.ai');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await hrApi.login({ email, password });
      navigate('/hr/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('hr@eaglevision.ai');
    setPassword('password123');
    setError('');
    setLoading(true);
    try {
      await hrApi.login({ email: 'hr@eaglevision.ai', password: 'password123' });
      navigate('/hr/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Demo login failed. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <Eye className="w-7 h-7 text-slate-900" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-white">
                Eagle <span className="text-amber-400">Vision</span>
              </h1>
              <p className="text-xs text-slate-500 tracking-wide">HR Talent Intelligence</p>
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-8 backdrop-blur">
          <h2 className="text-lg font-semibold text-white mb-1">Sign in to HR Portal</h2>
          <p className="text-sm text-slate-400 mb-6">Access talent discovery and internal mobility tools</p>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-4">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span className="text-sm text-red-400">{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50"
                  placeholder="hr@eaglevision.ai"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 font-semibold py-2.5 rounded-lg hover:from-amber-400 hover:to-amber-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800/60"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-slate-900/60 text-slate-500">or</span>
            </div>
          </div>

          <button
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full border border-amber-500/30 text-amber-400 font-medium py-2.5 rounded-lg hover:bg-amber-500/10 transition-all disabled:opacity-50"
          >
            🚀 Quick Demo Login (HR Admin)
          </button>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          Eagle Vision © 2026 • AI-Powered Talent Discovery
        </p>
      </div>
    </div>
  );
};

export default HRLoginPage;
