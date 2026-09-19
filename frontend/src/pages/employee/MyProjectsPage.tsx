import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const MyProjectsPage: React.FC = () => {
  const { currentUser } = useApp();
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState<'all' | 'current' | 'completed'>('all');

  const filteredProjects =
    filterStatus === 'all'
      ? currentUser.projects
      : currentUser.projects.filter((p) => p.status === filterStatus);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">My Projects & Gigs</h1>
          <p className="text-slate-400 text-xs mt-1">
            Current active projects, cross-functional sprints, and historical project contributions.
          </p>
        </div>

        <button
          onClick={() => navigate('/opportunities')}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl transition shadow-md shadow-indigo-600/30 flex items-center space-x-1.5 self-start md:self-auto"
        >
          <span>Discover Open Projects</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2">
        {(['all', 'current', 'completed'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition border ${
              filterStatus === s
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {s === 'all' ? 'All Projects' : `${s} Projects`}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredProjects.map((proj) => (
          <div
            key={proj.id}
            className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700/60 backdrop-blur-sm space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center space-x-3">
                  <h2 className="text-base font-bold text-white">{proj.name}</h2>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      proj.status === 'current'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {proj.status === 'current' ? 'Active Project' : 'Completed'}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-1 flex items-center space-x-3">
                  <span>
                    Role: <span className="text-slate-200 font-semibold">{proj.role}</span>
                  </span>
                  <span>•</span>
                  <span className="text-indigo-300">{proj.team}</span>
                  <span>•</span>
                  <span>{proj.startDate} – {proj.endDate}</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{proj.description}</p>

            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Key Responsibilities:
              </div>
              <ul className="space-y-1 text-xs text-slate-300">
                {proj.responsibilities.map((r, i) => (
                  <li key={i} className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Technologies:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {proj.technologies.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[11px] font-bold text-violet-400 uppercase tracking-wider mb-1.5">
                  Demonstrated Competencies:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {proj.skillsDemonstrated.map((s) => (
                    <span
                      key={s}
                      className="text-[10px] px-2 py-0.5 rounded bg-violet-950/40 text-violet-300 border border-violet-800/40 font-medium"
                    >
                      {s}
                    </span>
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
