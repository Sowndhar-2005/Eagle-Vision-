import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const MyTeamPage: React.FC = () => {
  const { currentUser, allEmployees } = useApp();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Team members under this Team Leader
  const teamMembers = allEmployees.filter(
    (e) => e.teamId === currentUser.teamId && e.id !== currentUser.id
  );

  const filteredMembers = teamMembers.filter((m) => {
    return (
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.skills.some((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">My Team Roster</h1>
          <p className="text-slate-400 text-xs mt-1">
            Manage your direct engineering reports in <span className="text-violet-300 font-semibold">{currentUser.teamName}</span>, inspect verified capabilities, and track sprint allocations.
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search team members or skills..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800/60 border border-slate-700/60 rounded-2xl text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-violet-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredMembers.map((emp) => (
          <div
            key={emp.id}
            className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700/60 hover:border-violet-500/50 transition duration-200 flex flex-col justify-between space-y-4 shadow-lg backdrop-blur-sm"
          >
            <div className="space-y-3 text-xs">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={emp.avatar}
                    alt={emp.name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-violet-500/30"
                  />
                  <div>
                    <h3 className="font-bold text-white text-sm">{emp.name}</h3>
                    <div className="text-[11px] text-slate-400">{emp.title}</div>
                    <span className="text-[10px] text-indigo-300 font-medium">ID: {emp.employeeId}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Current Work:</span>
                  <span className="font-semibold text-white">{emp.currentWork.projectName}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Availability:</span>
                  <span
                    className={`font-bold ${
                      emp.availability === '20% Gig Available' ? 'text-emerald-400' : 'text-slate-300'
                    }`}
                  >
                    {emp.availability}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Career Goal:</span>
                  <span className="font-semibold text-violet-300">{emp.careerAspiration.targetRole}</span>
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Top Skills:
                </div>
                <div className="flex flex-wrap gap-1">
                  {emp.skills.slice(0, 4).map((s) => (
                    <span
                      key={s.id}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800 flex items-center space-x-1"
                    >
                      <span>{s.name}</span>
                      {s.isVerified && <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/tl/employees')}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs rounded-xl border border-slate-700 transition flex items-center justify-center space-x-1.5"
            >
              <span>Inspect Detailed Profile</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
