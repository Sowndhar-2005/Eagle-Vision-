import React, { useState } from 'react';
import { Search, MapPin, Building } from 'lucide-react';

export const OpportunitiesPage: React.FC = () => {
  const [filterType, setFilterType] = useState('all');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Internal Opportunity Marketplace</h1>
        <p className="text-slate-400 text-sm mt-1">
          Explore permanent open roles, cross-functional gigs, mentorships, and project shadowing.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search roles, projects, or required skills..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800/60 border border-slate-700/60 rounded-xl text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="flex space-x-2">
          {['all', 'role', 'gig', 'mentorship'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-xl capitalize transition ${
                filterType === t
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-800/70 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {t === 'all' ? 'All Types' : t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          {
            title: 'Platform Infrastructure Architect',
            team: 'Core Platform Engineering',
            loc: 'Remote / Bangalore',
            type: 'Permanent Role',
            match: 91,
            desc: 'Looking for senior engineer with distributed systems knowledge to migrate services to Kubernetes and event-driven patterns.',
            skills: ['Kubernetes', 'Go / Python', 'PostgreSQL', 'Kafka'],
          },
          {
            title: 'AI Mobility Copilot Innovation Project',
            team: 'Internal AI Incubator',
            loc: 'Remote (Flexible)',
            type: '15% Gig (6 weeks)',
            match: 96,
            desc: 'Collaborate with the AI core team to refine transferable skill extraction algorithms using Gemini 2.5 Flash embeddings.',
            skills: ['Gemini API', 'pgvector', 'FastAPI', 'Data Analysis'],
          },
        ].map((item, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60 hover:border-indigo-500/50 transition duration-200 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    {item.type}
                  </span>
                  <h3 className="text-base font-semibold text-white mt-2">{item.title}</h3>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-emerald-400">{item.match}%</div>
                  <div className="text-[10px] text-slate-400">Match Score</div>
                </div>
              </div>

              <div className="flex items-center space-x-4 text-xs text-slate-400 pt-1">
                <span className="flex items-center"><Building className="w-3.5 h-3.5 mr-1 text-slate-400" /> {item.team}</span>
                <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" /> {item.loc}</span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed pt-1">{item.desc}</p>
            </div>

            <div>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {item.skills.map((s) => (
                  <span key={s} className="text-[11px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                    {s}
                  </span>
                ))}
              </div>
              <button className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl transition shadow-md shadow-indigo-600/30">
                Apply / Express Interest
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
