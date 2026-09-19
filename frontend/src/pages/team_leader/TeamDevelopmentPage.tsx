import React from 'react';
import { useApp } from '../../context/AppContext';
import { Target, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TeamDevelopmentPage: React.FC = () => {
  const { currentUser, allEmployees } = useApp();
  const navigate = useNavigate();

  // Team members under this leader
  const teamMembers = allEmployees.filter(
    (e) => e.teamId === currentUser.teamId && e.id !== currentUser.id
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Team Career Development & Roadmaps</h1>
          <p className="text-slate-400 text-xs mt-1">
            Track individual career progression milestones, active upskilling pathways, and support team career mobility.
          </p>
        </div>

        <button
          onClick={() => navigate('/tl/requests')}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs rounded-xl transition shadow-md shadow-violet-600/30 flex items-center space-x-1.5 self-start md:self-auto"
        >
          <BookOpen className="w-4 h-4" />
          <span>Review Development Requests</span>
        </button>
      </div>

      <div className="space-y-5">
        {teamMembers.map((emp) => (
          <div
            key={emp.id}
            className="p-6 sm:p-8 rounded-3xl bg-slate-800/40 border border-slate-700/60 backdrop-blur-sm space-y-5 shadow-xl"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-4">
                <img
                  src={emp.avatar}
                  alt={emp.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-violet-500/30"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-base font-bold text-white">{emp.name}</h2>
                    <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-800 text-slate-300 font-medium">
                      {emp.title}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Target Milestone: <span className="text-violet-300 font-bold">{emp.careerAspiration.targetRole}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 self-start sm:self-auto">
                <div className="text-right">
                  <div className="text-[10px] text-slate-400">Target Readiness</div>
                  <div className="text-sm font-black text-emerald-400">
                    {emp.careerAspiration.readinessScore}%
                  </div>
                </div>
                <button
                  onClick={() => navigate('/tl/employees')}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition"
                >
                  View Profile
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Active Learning & Upskilling */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="text-[11px] font-bold text-violet-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Active Learning & Enrolled Courses</span>
                </div>

                {emp.learningHistory.currentLearning.length === 0 ? (
                  <div className="text-[11px] text-slate-500 italic py-2">
                    No active course enrollment at this moment.
                  </div>
                ) : (
                  emp.learningHistory.currentLearning.map((c) => (
                    <div key={c.id} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1.5">
                      <div className="font-semibold text-white">{c.title}</div>
                      <div className="text-[10px] text-slate-400">{c.provider} • Target: {c.targetSkill}</div>
                      <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
                          style={{ width: `${c.progressPercentage}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Skill Deficits to Support */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <Target className="w-3.5 h-3.5" />
                  <span>Identified Skill Gaps for Target Role</span>
                </div>

                <div className="space-y-1.5">
                  {emp.careerAspiration.missingSkills.map((sk) => (
                    <div
                      key={sk}
                      className="p-2.5 rounded-xl bg-slate-800/50 border border-rose-500/20 flex items-center justify-between text-xs"
                    >
                      <span className="text-slate-200">{sk}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-semibold">
                        Needs Course / Gig
                      </span>
                    </div>
                  ))}

                  {emp.careerAspiration.developingSkills.map((sk) => (
                    <div
                      key={sk}
                      className="p-2.5 rounded-xl bg-slate-800/50 border border-amber-500/20 flex items-center justify-between text-xs"
                    >
                      <span className="text-slate-200">{sk}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold">
                        In Progress
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
