// Eagle Vision — HR KPI Metric Cards
import React from 'react';
import { FolderKanban, FileText, Users, AlertTriangle, ArrowUpRight } from 'lucide-react';
import type { DashboardKPIData } from '../types/dashboard';

interface HRKpiCardsProps {
  stats: DashboardKPIData;
}

export const HRKpiCards: React.FC<HRKpiCardsProps> = ({ stats }) => {
  const cards = [
    {
      title: 'Active Projects',
      value: stats.activeProjects,
      detail: stats.activeProjectsChange || '+3 this month',
      detailColor: 'text-emerald-400',
      icon: FolderKanban,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/10 border-amber-500/20',
    },
    {
      title: 'Open Requirements',
      value: stats.openRequirements,
      detail: stats.openRequirementsDetail || '4 in analysis',
      detailColor: 'text-blue-400',
      icon: FileText,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/10 border-blue-500/20',
    },
    {
      title: 'Internal Talent Matches',
      value: stats.internalMatches,
      detail: stats.internalMatchesChange || '+14% mobility',
      detailColor: 'text-emerald-400',
      icon: Users,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      title: 'Critical Skill Gaps',
      value: stats.criticalSkillGaps,
      detail: stats.criticalSkillGapsDetail || 'Across 4 divisions',
      detailColor: 'text-rose-400',
      icon: AlertTriangle,
      iconColor: 'text-rose-400',
      iconBg: 'bg-rose-500/10 border-rose-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors backdrop-blur-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {card.title}
            </span>
            <div className={`p-2 rounded-lg border ${card.iconBg}`}>
              <card.icon className={`w-4 h-4 ${card.iconColor}`} />
            </div>
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <div className="text-3xl font-bold text-white tracking-tight">{card.value}</div>
            <div className="flex items-center gap-1 text-xs font-medium">
              <span className={card.detailColor}>{card.detail}</span>
              <ArrowUpRight className={`w-3.5 h-3.5 ${card.detailColor}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HRKpiCards;
