// Eagle Vision — HR Layout Shell
import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  BarChart3,
  LogOut,
  Search,
  Bell,
  Eye,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';
import { hrApi } from '../services/hrApi';

const NAV_ITEMS = [
  { path: '/hr/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/hr/projects', label: 'Projects', icon: FolderKanban },
  { path: '/hr/candidates', label: 'Talent Pool', icon: Users },
  { path: '/hr/analytics', label: 'Analytics', icon: BarChart3 },
];

export const HRLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = hrApi.getStoredUser();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogout = () => {
    hrApi.logout();
    navigate('/hr/login');
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarCollapsed ? 'w-16' : 'w-60'
        } flex flex-col border-r border-slate-800/60 bg-slate-900/70 backdrop-blur transition-all duration-200`}
      >
        {/* Logo & Toggle */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-slate-800/60">
          <div className="flex items-center gap-2">
            <Eye className="w-7 h-7 text-amber-400 flex-shrink-0" />
            {!sidebarCollapsed && (
              <span className="text-base font-bold tracking-tight">
                Eagle <span className="text-amber-400">Vision</span>
              </span>
            )}
          </div>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/60 transition-colors"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                }`}
              >
                <item.icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-amber-400' : ''}`} />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User / Logout */}
        <div className="border-t border-slate-800/60 p-3">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 w-full text-sm text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800/50 transition-all"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-slate-800/60 bg-slate-900/40 backdrop-blur">
          <div>
            <h2 className="text-sm font-medium text-slate-400">
              {greeting()}, <span className="text-slate-100">{user?.full_name || 'HR Team'}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Talent intelligence overview</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search talent, projects..."
                className="bg-slate-800/60 border border-slate-700/50 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 w-64"
              />
            </div>
            <button className="relative p-2 rounded-lg hover:bg-slate-800/50 transition-colors">
              <Bell className="w-5 h-5 text-slate-400" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-amber-400 rounded-full"></span>
            </button>
            <div className="flex items-center gap-2 pl-4 border-l border-slate-800/60">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-xs font-bold text-slate-900">
                {(user?.full_name || 'HR')[0]}
              </div>
              {user && (
                <div className="text-xs">
                  <p className="font-medium text-slate-200">{user.full_name}</p>
                  <p className="text-slate-500 capitalize">{user.role.replace('_', ' ')}</p>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default HRLayout;
