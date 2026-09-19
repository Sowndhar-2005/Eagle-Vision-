// Eagle Vision — HR Quick Actions Component
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Sparkles, UserSearch, Users, ArrowRight } from 'lucide-react';

export const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  const actions = [
    {
      title: 'Create Project',
      description: 'Define opportunity and team headcount',
      icon: Plus,
      path: '/hr/projects/new',
      highlight: 'from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-300 hover:border-amber-500/50',
      iconColor: 'text-amber-400',
    },
    {
      title: 'Analyze Requirement',
      description: 'AI extracts skills & roles from raw text',
      icon: Sparkles,
      path: '/hr/projects',
      highlight: 'from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-300 hover:border-blue-500/50',
      iconColor: 'text-blue-400',
    },
    {
      title: 'Find Internal Talent',
      description: 'Run hybrid matching across employees',
      icon: UserSearch,
      path: '/hr/candidates',
      highlight: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-300 hover:border-emerald-500/50',
      iconColor: 'text-emerald-400',
    },
    {
      title: 'View Candidates',
      description: 'Inspect profiles, skill gaps & diagnostics',
      icon: Users,
      path: '/hr/candidates',
      highlight: 'from-indigo-500/20 to-indigo-600/10 border-indigo-500/30 text-indigo-300 hover:border-indigo-500/50',
      iconColor: 'text-indigo-400',
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          Talent Discovery Workflow & Quick Actions
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {actions.map((act, idx) => (
          <button
            key={idx}
            onClick={() => navigate(act.path)}
            className={`p-4 rounded-xl bg-gradient-to-br ${act.highlight} border text-left transition-all duration-200 flex flex-col justify-between group hover:shadow-lg`}
          >
            <div className="flex items-start justify-between w-full">
              <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                <act.icon className={`w-4 h-4 ${act.iconColor}`} />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </div>

            <div className="mt-3">
              <div className="text-sm font-bold text-white group-hover:text-amber-200 transition-colors">
                {act.title}
              </div>
              <div className="text-xs text-slate-400 mt-0.5 leading-snug">
                {act.description}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
