// Eagle Vision — HR Dashboard Header Component
import React from 'react';
import { Bell, ShieldCheck } from 'lucide-react';
import type { HRUserData } from '../types/dashboard';

interface HRDashboardHeaderProps {
  user?: HRUserData;
  notificationCount?: number;
  onNotificationsClick?: () => void;
}

export const HRDashboardHeader: React.FC<HRDashboardHeaderProps> = ({
  user = {
    fullName: 'Sarah Jenkins',
    role: 'Senior Talent Lead',
    email: 'sarah.jenkins@eaglevision.ai',
    avatarInitials: 'SJ',
  },
  notificationCount = 3,
  onNotificationsClick,
}) => {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-bold text-white tracking-tight">HR Dashboard</h1>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            Talent Studio
          </span>
        </div>
        <p className="text-slate-400 text-sm mt-1">
          Talent intelligence overview and internal mobility command center
        </p>
      </div>

      <div className="flex items-center gap-4 self-start sm:self-auto">
        {/* Notifications Button */}
        <button
          onClick={onNotificationsClick}
          className="relative p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
          title="View Notifications"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          {notificationCount > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-amber-400 rounded-full ring-2 ring-slate-950" />
          )}
        </button>

        {/* HR Profile Area */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-bold text-sm shadow-md shadow-amber-500/10">
            {user.avatarInitials}
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold text-white leading-tight">{user.fullName}</div>
            <div className="text-xs text-slate-400 mt-0.5">{user.role}</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HRDashboardHeader;
