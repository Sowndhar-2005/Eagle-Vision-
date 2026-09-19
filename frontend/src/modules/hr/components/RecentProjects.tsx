// Eagle Vision — Recent Projects Table Component
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderKanban, ChevronRight, ArrowRight } from 'lucide-react';
import type { DashboardProjectItem } from '../types/dashboard';

interface RecentProjectsProps {
  projects: DashboardProjectItem[];
  onViewAll?: () => void;
}

const STATUS_BADGES: Record<DashboardProjectItem['status'], { bg: string; text: string; border: string }> = {
  Active: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/20',
  },
  Analysis: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    border: 'border-blue-500/20',
  },
  Draft: {
    bg: 'bg-slate-500/10',
    text: 'text-slate-400',
    border: 'border-slate-500/20',
  },
  Completed: {
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    border: 'border-purple-500/20',
  },
};

export const RecentProjects: React.FC<RecentProjectsProps> = ({ projects, onViewAll }) => {
  const navigate = useNavigate();

  const handleRowClick = (project: DashboardProjectItem) => {
    navigate(`/hr/projects/${project.id}/analysis`);
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 backdrop-blur-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FolderKanban className="w-4 h-4 text-amber-400" />
            Recent Projects & Requirements
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Active opportunities undergoing candidate matching and skill discovery
          </p>
        </div>

        <button
          onClick={onViewAll || (() => navigate('/hr/projects'))}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
        >
          View All Projects
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[640px]">
          <thead>
            <tr className="border-b border-slate-800/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <th className="py-2.5 px-3">Project</th>
              <th className="py-2.5 px-3">Department</th>
              <th className="py-2.5 px-3">Required Role</th>
              <th className="py-2.5 px-3">Candidates</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3">Created</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {projects.map((p) => {
              const badge = STATUS_BADGES[p.status] || STATUS_BADGES.Draft;
              return (
                <tr
                  key={p.id}
                  onClick={() => handleRowClick(p)}
                  className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
                >
                  <td className="py-3 px-3 font-semibold text-white group-hover:text-amber-300 transition-colors">
                    {p.name}
                  </td>
                  <td className="py-3 px-3 text-slate-300">{p.department}</td>
                  <td className="py-3 px-3 text-slate-300 font-medium">{p.requiredRole}</td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono text-[11px]">
                      {p.candidateCount} Matches
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${badge.bg} ${badge.text} ${badge.border}`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">{p.createdAt}</td>
                  <td className="py-3 px-3 text-right">
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 transition-colors inline-block" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentProjects;
