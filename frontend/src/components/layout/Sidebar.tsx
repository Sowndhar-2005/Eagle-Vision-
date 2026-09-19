import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  UserCircle,
  Award,
  History,
  FolderGit2,
  Activity,
  Briefcase,
  GraduationCap,
  Target,
  Inbox,
  Users,
  Compass,
  FileCheck,
  TrendingUp,
  Layers,
  Bot,
  Building,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { currentRole, requests, currentUser } = useApp();

  const employeeNavItems = [
    { to: '/', label: 'My Profile', icon: UserCircle },
    { to: '/skills', label: 'My Skills', icon: Award },
    { to: '/experience', label: 'My Experience', icon: History },
    { to: '/projects', label: 'My Projects', icon: FolderGit2 },
    { to: '/current-work', label: 'Current Work', icon: Activity },
    { to: '/learning', label: 'Learning & Courses', icon: GraduationCap },
    { to: '/skill-gaps', label: 'Skill Development', icon: Target },
    { to: '/opportunities', label: 'Internal Opportunities', icon: Briefcase },
    {
      to: '/requests',
      label: 'My Requests',
      icon: Inbox,
      badge: requests.filter((r) => r.requesterId === currentUser.id && r.status === 'pending').length,
    },
    { to: '/ai-assistant', label: 'AI Career Assistant', icon: Bot, isAi: true },
  ];

  const teamLeaderNavItems = [
    { to: '/tl/dashboard', label: 'Team Dashboard', icon: LayoutDashboard },
    { to: '/tl/team', label: 'Team Members', icon: Users },
    { to: '/tl/employees', label: 'Employee Profiles', icon: UserCircle },
    { to: '/tl/projects', label: 'Team Projects', icon: FolderGit2 },
    { to: '/tl/talent-discovery', label: 'Talent Discovery', icon: Compass },
    { to: '/tl/team-skills', label: 'Skill Overview', icon: Layers },
    { to: '/tl/development', label: 'Employee Development', icon: TrendingUp },
    {
      to: '/tl/requests',
      label: 'Requests',
      icon: FileCheck,
      badge: requests.filter((r) => r.status === 'pending').length,
    },
    { to: '/tl/ai-assistant', label: 'AI Talent Assistant', icon: Bot, isAi: true },
  ];

  const navItems = currentRole === 'team_leader' ? teamLeaderNavItems : employeeNavItems;

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/60 backdrop-blur-md flex flex-col justify-between p-4 sticky top-16 h-[calc(100vh-4rem)]">
      <div className="space-y-4">
        <div className="px-3 py-1 flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {currentRole === 'team_leader' ? 'Team Leader Navigation' : 'Employee Navigation'}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-medium">
            {currentRole === 'team_leader' ? 'Leader View' : 'Personal View'}
          </span>
        </div>

        <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-14rem)] pr-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all duration-200 ${
                  isActive
                    ? item.isAi
                      ? 'bg-gradient-to-r from-violet-600/30 to-indigo-600/30 text-white border border-violet-500/40 shadow-sm'
                      : 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm font-semibold'
                    : item.isAi
                    ? 'text-violet-300 hover:text-violet-100 hover:bg-violet-950/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`
              }
            >
              <div className="flex items-center space-x-3">
                <item.icon className={`w-4 h-4 ${item.isAi ? 'text-violet-400 animate-pulse' : ''}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-indigo-500 text-white text-[10px] font-bold">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Multi-Team context box */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 text-xs text-slate-400 space-y-1">
        <div className="flex items-center space-x-1.5 text-white font-semibold">
          <Building className="w-3.5 h-3.5 text-indigo-400" />
          <span className="truncate">{currentUser.teamName}</span>
        </div>
        <p className="text-[11px] text-slate-400">
          Leader: <span className="text-slate-300 font-medium">{currentUser.teamLeaderName}</span>
        </p>
      </div>
    </aside>
  );
};
