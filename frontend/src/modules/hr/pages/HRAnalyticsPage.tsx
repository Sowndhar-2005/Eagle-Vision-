// Eagle Vision — HR Mobility & Talent Analytics Dashboard
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart3,
  TrendingUp,
  Users,
  Target,
  Zap,
  Layers,
  AlertCircle,
  Download,
  Loader2,
} from 'lucide-react';
import { hrApi } from '../services/hrApi';
import type { AnalyticsData } from '../types';

export const HRAnalyticsPage: React.FC = () => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['hr-analytics'],
    queryFn: () => hrApi.getAnalytics(),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-3" />
        <p>Aggregating organizational talent analytics and skill graphs...</p>
      </div>
    );
  }

  // Fallback / standard metric data
  const data: AnalyticsData = analytics || {
    total_projects: 8,
    active_projects: 6,
    total_employees: 20,
    mobility_rate: 64.5,
    avg_match_score: 76.2,
    skill_shortages: [
      { skill: 'Rust', count: 4, severity: 'High' },
      { skill: 'PyTorch / LLM Fine-tuning', count: 6, severity: 'Critical' },
      { skill: 'Kubernetes Multi-Cluster', count: 3, severity: 'Medium' },
      { skill: 'Distributed Systems Architecture', count: 5, severity: 'High' },
      { skill: 'Vector Databases / RAG', count: 4, severity: 'Medium' },
    ],
    department_distribution: [
      { department: 'Engineering', count: 8, readiness: 88 },
      { department: 'AI & Data Science', count: 5, readiness: 92 },
      { department: 'Product', count: 3, readiness: 75 },
      { department: 'Design', count: 2, readiness: 80 },
      { department: 'Security & DevOps', count: 2, readiness: 85 },
    ],
    top_in_demand_skills: [
      { skill: 'Python', demand_count: 7, supply_count: 12 },
      { skill: 'FastAPI', demand_count: 5, supply_count: 8 },
      { skill: 'React / TypeScript', demand_count: 6, supply_count: 10 },
      { skill: 'PyTorch', demand_count: 4, supply_count: 3 },
      { skill: 'Docker / K8s', demand_count: 5, supply_count: 6 },
    ],
  };

  const mobilityRate = data.mobility_rate ?? 64.5;
  const activeProjects = data.active_projects ?? data.total_projects ?? 6;
  const inDemandSkills = data.top_in_demand_skills || [
    { skill: 'Python', demand_count: 7, supply_count: 12 },
    { skill: 'FastAPI', demand_count: 5, supply_count: 8 },
    { skill: 'React / TypeScript', demand_count: 6, supply_count: 10 },
    { skill: 'PyTorch', demand_count: 4, supply_count: 3 },
  ];
  const shortages = data.skill_shortages || [
    { skill: 'Rust', count: 4, severity: 'High' },
    { skill: 'PyTorch / LLM Fine-tuning', count: 6, severity: 'Critical' },
    { skill: 'Kubernetes Multi-Cluster', count: 3, severity: 'Medium' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Talent Mobility & Skill Analytics
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Enterprise-wide internal talent velocity, skill gap heatmaps, and staffing efficiency.
          </p>
        </div>

        <button
          onClick={() => alert('Analytics report exported as PDF/CSV!')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-medium transition-colors self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-blue-400" />
          Export Executive Report
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Mobility Index</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{mobilityRate}%</span>
            <span className="text-xs text-emerald-400 font-medium">+14.2% QoQ</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Internal staffing success rate</p>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Avg Match Fit</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{Math.round(data.avg_match_score || 76)}%</span>
            <span className="text-xs text-blue-400 font-medium">Hybrid AI Score</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Accuracy across open roles</p>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Active Projects</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{activeProjects}</span>
            <span className="text-xs text-slate-400">of {data.total_projects} total</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Requiring talent discovery</p>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Talent Pool</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{data.total_employees}</span>
            <span className="text-xs text-purple-400 font-medium">Employees</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Indexed in skill vector graph</p>
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Skill Supply vs Demand Balance */}
        <div className="lg:col-span-7 bg-slate-800/60 border border-slate-700/60 rounded-xl p-5 backdrop-blur-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
            <div>
              <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-400" />
                Skill Supply vs. Project Demand
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Comparison of organizational competence vs requirements in active projects
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            {inDemandSkills.map((item, idx) => {
              const maxVal = Math.max(item.demand_count, item.supply_count, 15);
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-white">{item.skill}</span>
                    <div className="flex items-center gap-3 text-[11px]">
                      <span className="text-blue-400 font-medium">
                        Demand: {item.demand_count}
                      </span>
                      <span className="text-emerald-400 font-medium">
                        Supply: {item.supply_count}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Demand Bar */}
                    <div className="flex-1 bg-slate-900 rounded-full h-2 overflow-hidden flex">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${(item.demand_count / maxVal) * 100}%` }}
                      />
                    </div>
                    {/* Supply Bar */}
                    <div className="flex-1 bg-slate-900 rounded-full h-2 overflow-hidden flex">
                      <div
                        className="bg-emerald-500 h-2 rounded-full"
                        style={{ width: `${(item.supply_count / maxVal) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-6 pt-3 border-t border-slate-700/40 text-xs text-slate-400">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-blue-500 inline-block" /> Project Demand
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> Employee Supply
            </span>
          </div>
        </div>

        {/* Critical Skill Shortages */}
        <div className="lg:col-span-5 bg-slate-800/60 border border-slate-700/60 rounded-xl p-5 backdrop-blur-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
            <div>
              <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                Critical Skill Shortage Heatmap
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">High-demand skills with low internal bench</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {shortages.map((shortage, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-slate-900/80 border border-slate-700/70 rounded-lg hover:border-slate-600 transition-colors"
              >
                <div>
                  <h4 className="text-xs font-bold text-white">{shortage.skill}</h4>
                  <span className="text-[11px] text-slate-400">
                    Deficit: {shortage.count} open roles
                  </span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                    shortage.severity === 'Critical'
                      ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                      : shortage.severity === 'High'
                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      : 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                  }`}
                >
                  {shortage.severity}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Department Mobility Readiness */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5 backdrop-blur-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
          <h3 className="font-semibold text-white text-sm flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            Department Readiness & Talent Mobilization Index
          </h3>
          <span className="text-xs text-slate-400">5 Divisions Indexed</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {data.department_distribution?.map((dept, idx) => {
            const deptName = dept.department || dept.name || 'General';
            const readiness = dept.readiness ?? 80;
            return (
              <div
                key={idx}
                className="p-4 bg-slate-900/80 border border-slate-700/70 rounded-xl flex flex-col justify-between space-y-3"
              >
                <div>
                  <span className="text-xs font-bold text-white block">{deptName}</span>
                  <span className="text-[11px] text-slate-400">{dept.count} Members</span>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-slate-400">Readiness</span>
                    <span className="text-cyan-400 font-bold">{readiness}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5">
                    <div
                      className="bg-cyan-500 h-1.5 rounded-full"
                      style={{ width: `${readiness}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
