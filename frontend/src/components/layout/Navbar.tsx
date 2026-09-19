import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, Sparkles, ShieldCheck } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-6">
      <div className="flex items-center space-x-3">
        <Link to="/" className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-wide text-white">EAGLE VISION</span>
            <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 font-medium border border-indigo-500/30">
              AI Platform
            </span>
          </div>
        </Link>
      </div>

      <div className="flex items-center space-x-4">
        {/* Quick Link to HR Talent Management Center */}
        <Link
          to="/hr/dashboard"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 text-xs font-semibold transition-colors shadow-sm"
        >
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span>HR Talent Studio</span>
        </Link>

        <button className="relative p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
        </button>

        <div className="flex items-center space-x-3 pl-3 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-semibold text-sm">
            JD
          </div>
          <div className="hidden md:block text-left text-xs">
            <div className="font-medium text-slate-200">Jane Doe</div>
            <div className="text-slate-400">Senior Engineer</div>
          </div>
        </div>
      </div>
    </header>
  );
};
