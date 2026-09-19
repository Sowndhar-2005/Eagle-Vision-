import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  Bell,
  ChevronDown,
  Building,
  Shield,
  User,
  LogOut,
  Mail,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    currentRole,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useApp();

  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleLogout = () => {
    setShowUserMenu(false);
    navigate('/login');
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/85 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-6">
      {/* Brand & Team Context */}
      <div className="flex items-center space-x-4">
        <div
          onClick={() => navigate(currentRole === 'team_leader' ? '/tl/dashboard' : '/')}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-violet-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-base tracking-wider text-white">EAGLE VISION</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                Talent Mobility
              </span>
            </div>
            <span className="text-[11px] text-slate-400 flex items-center space-x-1">
              <Building className="w-3 3 text-slate-500" />
              <span>{currentUser.teamName}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Center Status Badge - Strictly Informational */}
      <div className="hidden md:flex items-center space-x-2">
        <div
          className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold border flex items-center space-x-2 ${
            currentRole === 'team_leader'
              ? 'bg-violet-950/40 text-violet-300 border-violet-800/50'
              : 'bg-indigo-950/40 text-indigo-300 border-indigo-800/50'
          }`}
        >
          {currentRole === 'team_leader' ? (
            <>
              <Shield className="w-3.5 h-3.5 text-violet-400" />
              <span>Team Leader Workspace</span>
            </>
          ) : (
            <>
              <User className="w-3.5 h-3.5 text-indigo-400" />
              <span>Employee Portal</span>
            </>
          )}
        </div>
      </div>

      {/* Right Actions & User Profile */}
      <div className="flex items-center space-x-3">
        {/* Quick Link to HR Talent Management Center */}
        <Link
          to="/hr/dashboard"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs font-semibold transition-colors shadow-sm"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">HR Studio</span>
        </Link>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="relative p-2.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 transition border border-transparent hover:border-slate-700"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 bg-indigo-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-4 space-y-3 z-50 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center space-x-1.5 font-bold text-xs text-white">
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px]">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-[11px] text-indigo-400 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 text-xs">No notifications</div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        markNotificationAsRead(notif.id);
                        if (notif.actionUrl) {
                          navigate(notif.actionUrl);
                          setShowNotifMenu(false);
                        }
                      }}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition ${
                        notif.read
                          ? 'bg-slate-800/30 border-slate-800/60 opacity-70'
                          : 'bg-indigo-950/30 border-indigo-800/40 text-slate-100 hover:bg-indigo-900/40'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="font-semibold text-white">{notif.title}</span>
                        <span className="text-[10px] text-slate-500">{notif.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">{notif.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Info & Logout Menu (Single Authenticated User) */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-3 p-1.5 pr-3 rounded-2xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 transition group"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-8 h-8 rounded-xl object-cover border border-indigo-500/30"
            />
            <div className="text-left hidden sm:block">
              <div className="text-xs font-semibold text-white flex items-center space-x-1">
                <span>{currentUser.name}</span>
                <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-white transition" />
              </div>
              <div className="text-[10px] text-indigo-300 font-medium">
                {currentUser.personaTitle}
              </div>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-4 space-y-4 z-50 animate-fadeIn">
              {/* Authenticated User Details */}
              <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-indigo-500/40"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white text-sm truncate">{currentUser.name}</div>
                  <div className="text-xs text-indigo-300 truncate">{currentUser.title}</div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    ID: {currentUser.employeeId}
                  </span>
                </div>
              </div>

              {/* Organizational Info */}
              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                  <Building className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                  <span className="truncate">{currentUser.teamName}</span>
                </div>
                <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                  <Mail className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                  <span className="truncate font-mono">{currentUser.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                  <span className="truncate">{currentUser.location}</span>
                </div>
              </div>

              {/* Log Out Button */}
              <div className="pt-2 border-t border-slate-800">
                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border border-rose-500/20 text-xs font-semibold transition flex items-center justify-center space-x-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
