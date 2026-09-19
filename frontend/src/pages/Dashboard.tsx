import React from 'react';
import { Sparkles, TrendingUp, Target, Briefcase, ChevronRight } from 'lucide-react';

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Talent Mobility Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Discover internal growth paths, high-match opportunities, and transferable skill insights.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Role Fit Match', val: '92%', change: '+4% this month', icon: Target, color: 'text-indigo-400' },
          { label: 'Transferable Skills', val: '8 Detected', change: 'AI Knowledge Graph', icon: Sparkles, color: 'text-violet-400' },
          { label: 'Open Opportunities', val: '24 Roles / Gigs', change: '6 High Match', icon: Briefcase, color: 'text-emerald-400' },
          { label: 'Active Upskilling', val: '2 Roadmaps', change: '65% completed', icon: TrendingUp, color: 'text-amber-400' },
        ].map((kpi, idx) => (
          <div key={idx} className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>{kpi.label}</span>
              <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
            </div>
            <div className="text-2xl font-bold text-white mt-2">{kpi.val}</div>
            <div className="text-xs text-slate-400 mt-1">{kpi.change}</div>
          </div>
        ))}
      </div>

      {/* Top AI Matched Opportunities */}
      <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50 backdrop-blur-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Recommended Opportunities for You</h2>
          <span className="text-xs text-indigo-400 flex items-center cursor-pointer hover:underline">
            View all <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </span>
        </div>

        <div className="space-y-3">
          {[
            {
              title: 'Lead AI Application Engineer',
              team: 'AI Labs & Innovation',
              match: '94%',
              type: 'Full-time Role',
              skills: ['FastAPI', 'Gemini GenAI', 'Vector Search', 'pgvector'],
            },
            {
              title: 'Cross-Functional Gig: Internal Talent Matching ML',
              team: 'People Analytics',
              match: '89%',
              type: '20% Gig Project (8 weeks)',
              skills: ['Python', 'NetworkX', 'Algorithmic Matching'],
            },
          ].map((opp, i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center space-x-3">
                  <span className="font-semibold text-white">{opp.title}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-medium">
                    {opp.match} Match
                  </span>
                </div>
                <div className="text-xs text-slate-400">{opp.team} • <span className="text-indigo-300">{opp.type}</span></div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {opp.skills.map((s) => (
                    <span key={s} className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <button className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition self-start md:self-center shadow-md shadow-indigo-600/30">
                Explore Fit
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
