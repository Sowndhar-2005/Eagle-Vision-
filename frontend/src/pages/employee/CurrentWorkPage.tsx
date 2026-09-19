import React from 'react';
import { useApp } from '../../context/AppContext';
import { Activity, CheckCircle2, AlertCircle, Target } from 'lucide-react';

export const CurrentWorkPage: React.FC = () => {
  const { currentUser } = useApp();
  const { currentWork } = currentUser;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Current Work & Sprint Focus</h1>
        <p className="text-slate-400 text-xs mt-1">
          Active project deliverables, sprint milestones, key responsibilities, and team alignment.
        </p>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl bg-slate-800/40 border border-slate-700/60 backdrop-blur-md space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="space-y-1">
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
              {currentWork.status}
            </span>
            <h2 className="text-xl font-black text-white mt-2">{currentWork.projectName}</h2>
            <div className="text-xs text-slate-400 flex items-center space-x-3">
              <span>
                Role: <span className="text-slate-200 font-bold">{currentWork.role}</span>
              </span>
              <span>•</span>
              <span className="text-indigo-400">{currentWork.team}</span>
              <span>•</span>
              <span>Team Leader: {currentUser.teamLeaderName}</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-center sm:text-right">
            <div className="text-[10px] text-slate-400 font-medium">Sprint Capacity</div>
            <div className="text-sm font-black text-emerald-400 mt-0.5">{currentUser.availability}</div>
          </div>
        </div>

        {/* Sprint Goals */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-white font-bold text-sm">
            <Target className="w-4 h-4 text-indigo-400" />
            <span>Active Sprint Goals & Milestones</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentWork.currentTasks.map((goal, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-start space-x-3"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-slate-200 leading-relaxed">{goal}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Assigned Responsibilities */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-white font-bold text-sm">
            <Activity className="w-4 h-4 text-violet-400" />
            <span>Core Architectural & Delivery Responsibilities</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
            {currentWork.responsibilities.map((resp, idx) => (
              <div key={idx} className="flex items-center space-x-3 text-xs text-slate-300">
                <span className="w-2 h-2 rounded-full bg-violet-400 flex-shrink-0" />
                <span className="leading-relaxed">{resp}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Blockers or Dependencies */}
        {currentWork.blockers && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start space-x-3 text-amber-300 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-white">Sprint Dependency / Blocker:</div>
              <div className="mt-0.5 text-slate-300 leading-relaxed">{currentWork.blockers}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
