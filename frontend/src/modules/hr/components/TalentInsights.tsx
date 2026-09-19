// Eagle Vision — Talent Insights & Skill Intelligence Component
import React from 'react';
import { Award, Zap, AlertTriangle, TrendingUp } from 'lucide-react';
import type { TalentInsightsData } from '../types/dashboard';

interface TalentInsightsProps {
  insights: TalentInsightsData;
}

export const TalentInsights: React.FC<TalentInsightsProps> = ({ insights }) => {
  const maxInternalCount = Math.max(
    ...insights.topInternalSkills.map((s) => s.count),
    100
  );

  const maxRequestedCount = Math.max(
    ...insights.mostRequestedSkills.map((s) => s.count),
    25
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Talent & Skill Intelligence
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Internal capability distribution, hiring demand, and skill shortage heatmaps
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Top Internal Skills */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 backdrop-blur-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-blue-400" />
                Top Internal Skills
              </h3>
              <span className="text-[10px] text-slate-500 font-medium">Headcount</span>
            </div>

            <div className="mt-3.5 space-y-3">
              {insights.topInternalSkills.map((item, idx) => {
                const pct = Math.round((item.count / maxInternalCount) * 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-200">{item.skill}</span>
                      <span className="text-slate-400 font-mono text-[11px]">{item.detail || `${item.count} emps`}</span>
                    </div>
                    <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Most Requested Skills */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 backdrop-blur-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Most Requested Skills
              </h3>
              <span className="text-[10px] text-slate-500 font-medium">Demand</span>
            </div>

            <div className="mt-3.5 space-y-3">
              {insights.mostRequestedSkills.map((item, idx) => {
                const pct = Math.round((item.count / maxRequestedCount) * 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-200">{item.skill}</span>
                      <span className="text-amber-400 font-mono text-[11px]">{item.detail || `${item.count} roles`}</span>
                    </div>
                    <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-amber-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Critical Skill Gaps */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 backdrop-blur-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                Critical Skill Gaps
              </h3>
              <span className="text-[10px] text-slate-500 font-medium">Severity</span>
            </div>

            <div className="mt-3.5 space-y-2.5">
              {insights.criticalSkillGaps.map((item, idx) => {
                const severityStyle =
                  item.severity === 'Critical'
                    ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                    : item.severity === 'High'
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    : 'bg-blue-500/15 text-blue-300 border-blue-500/30';

                return (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-semibold text-white">{item.skill}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Deficit: {item.deficitCount} open positions
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${severityStyle}`}
                    >
                      {item.severity}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TalentInsights;
