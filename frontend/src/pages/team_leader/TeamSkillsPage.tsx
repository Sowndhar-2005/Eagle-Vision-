import React from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TeamSkillsPage: React.FC = () => {
  const { currentUser } = useApp();
  const navigate = useNavigate();

  const teamSkillMatrix = [
    {
      skill: 'Python & Asynchronous Architecture',
      category: 'AI & Backend',
      coverage: 95,
      level: 'Strong (5/5 engineers)',
      status: 'optimal',
      engineers: ['Jane Doe (Expert)', 'Alex Chen (Advanced)', 'Priya Sharma (Advanced)'],
    },
    {
      skill: 'FastAPI & Microservices',
      category: 'Backend & Systems',
      coverage: 88,
      level: 'Strong (4/5 engineers)',
      status: 'optimal',
      engineers: ['Jane Doe (Expert)', 'Alex Chen (Intermediate)'],
    },
    {
      skill: 'pgvector & High-Dimensional Search',
      category: 'AI / Machine Learning',
      coverage: 75,
      level: 'Adequate (3/5 engineers)',
      status: 'adequate',
      engineers: ['Jane Doe (Advanced)', 'Alex Chen (Training)'],
    },
    {
      skill: 'NetworkX Graph Ontology',
      category: 'Data & Analytics',
      coverage: 80,
      level: 'Strong (3/5 engineers)',
      status: 'optimal',
      engineers: ['Priya Sharma (Expert)', 'Jane Doe (Intermediate)'],
    },
    {
      skill: 'Production MLOps & Model Serving',
      category: 'AI / Machine Learning',
      coverage: 45,
      level: 'Developing Shortage',
      status: 'shortage',
      engineers: ['Jane Doe (Enrolled in course)'],
    },
    {
      skill: 'Kubernetes & Helm Infrastructure',
      category: 'Cloud & DevOps',
      coverage: 30,
      level: 'Critical Deficit',
      status: 'critical',
      engineers: ['Needs cross-team staffing from Cloud Team'],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Team Skills Matrix & Shortages</h1>
          <p className="text-slate-400 text-xs mt-1">
            Aggregate competency distribution for <span className="text-violet-300 font-semibold">{currentUser.teamName}</span> to identify capability deficits and plan upskilling roadmaps.
          </p>
        </div>

        <button
          onClick={() => navigate('/tl/talent-discovery')}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs rounded-xl transition shadow-md shadow-violet-600/30 flex items-center space-x-1.5 self-start md:self-auto"
        >
          <span>Find Cross-Team Talent</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Skills Matrix Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {teamSkillMatrix.map((item, idx) => (
          <div
            key={idx}
            className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700/60 backdrop-blur-sm space-y-4 shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-white text-base">{item.skill}</h3>
                <div className="text-xs text-slate-400 mt-0.5">{item.category}</div>
              </div>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                  item.status === 'optimal'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : item.status === 'adequate'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : item.status === 'shortage'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}
              >
                {item.level}
              </span>
            </div>

            {/* Coverage Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Team Competency Coverage</span>
                <span className="font-bold text-white">{item.coverage}%</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    item.coverage >= 80
                      ? 'bg-gradient-to-r from-emerald-500 to-cyan-400'
                      : item.coverage >= 60
                      ? 'bg-gradient-to-r from-indigo-500 to-violet-500'
                      : item.coverage >= 40
                      ? 'bg-gradient-to-r from-amber-500 to-orange-400'
                      : 'bg-gradient-to-r from-rose-500 to-red-500'
                  }`}
                  style={{ width: `${item.coverage}%` }}
                />
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Qualified Team Engineers:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {item.engineers.map((eng, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 border border-slate-800"
                  >
                    {eng}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
