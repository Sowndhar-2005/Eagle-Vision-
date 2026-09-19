import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Network,
  Briefcase,
  GraduationCap,
  UserCircle,
  ShieldCheck,
  ArrowUpRight,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/skills', label: 'Skills Graph', icon: Network },
    { to: '/opportunities', label: 'Opportunities', icon: Briefcase },
    { to: '/learning', label: 'Learning Paths', icon: GraduationCap },
    { to: '/profile', label: 'My Profile', icon: UserCircle },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/40 backdrop-blur-md flex flex-col justify-between p-4">
      <div className="space-y-6">
        <nav className="space-y-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* HR Hub Switcher Section */}
        <div className="pt-4 border-t border-slate-800/80">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3.5 block mb-2">
            HR & Management
          </span>
          <NavLink
            to="/hr/dashboard"
            className={({ isActive }) =>
              `flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-amber-400/90 hover:text-amber-300 hover:bg-amber-500/10'
              }`
            }
          >
            <div className="flex items-center space-x-3">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <span>HR Talent Hub</span>
            </div>
            <ArrowUpRight className="w-4 h-4 text-amber-400/70" />
          </NavLink>
        </div>
      </div>

      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-900/40 text-xs text-slate-400">
        <p className="font-semibold text-slate-200 mb-1">AI Mobility Active</p>
        <p>Semantic embeddings and graph matching powered by Gemini 2.5 Flash.</p>
      </div>
    </aside>
  );
};
