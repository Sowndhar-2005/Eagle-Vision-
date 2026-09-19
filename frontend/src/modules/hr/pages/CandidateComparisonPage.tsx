// Eagle Vision — Multi-Candidate Side-by-Side Comparison Studio
import React from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Scale,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  Award,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { hrApi } from '../services/hrApi';
import type { CandidateDetail } from '../types';

export const CandidateComparisonPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [searchParams] = useSearchParams();
  const candidateIdsParam = searchParams.get('candidates') || '';
  const navigate = useNavigate();

  const candidateIds = candidateIdsParam.split(',').filter(Boolean);

  // Load project details
  const { data: project } = useQuery({
    queryKey: ['hr-project', projectId],
    queryFn: () => hrApi.getProject(projectId!),
    enabled: !!projectId,
  });

  // Fetch candidate profiles for each selected candidate
  const candidateQueries = useQuery({
    queryKey: ['hr-candidates-compare', candidateIds, projectId],
    queryFn: async () => {
      const promises = candidateIds.map((id) => hrApi.getCandidateDetail(id, projectId));
      return Promise.all(promises);
    },
    enabled: candidateIds.length > 0,
  });

  const candidates: CandidateDetail[] = candidateQueries.data || [];

  if (candidateQueries.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-3" />
        <p>Loading candidate comparison matrix...</p>
      </div>
    );
  }

  if (candidateIds.length === 0 || candidates.length === 0) {
    return (
      <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-12 text-center max-w-lg mx-auto">
        <Scale className="w-12 h-12 text-slate-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-white">No candidates selected</h3>
        <p className="text-slate-400 text-sm mt-1">
          Select 2 or more candidates from the talent discovery page to compare them side-by-side.
        </p>
        <button
          onClick={() =>
            projectId ? navigate(`/hr/projects/${projectId}/candidates`) : navigate('/hr/projects')
          }
          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Go to Talent Discovery
        </button>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
    if (score >= 65) return 'text-blue-400 border-blue-500/40 bg-blue-500/10';
    if (score >= 50) return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/40 bg-rose-500/10';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              projectId ? navigate(`/hr/projects/${projectId}/candidates`) : navigate(-1)
            }
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Back to Discovery"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Candidate Comparison Matrix
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                {candidates.length} Profiles
              </span>
            </div>
            {project && (
              <p className="text-slate-400 text-sm mt-0.5">
                Comparing candidates for project:{' '}
                <span className="text-blue-400 font-medium">{project.name}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Side-by-Side Grid Container */}
      <div className="overflow-x-auto pb-4">
        <div
          className="grid gap-6 min-w-[800px]"
          style={{ gridTemplateColumns: `repeat(${candidates.length}, minmax(280px, 1fr))` }}
        >
          {candidates.map((c) => {
            const match = c.match_analysis;
            return (
              <div
                key={c.employee_id}
                className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 backdrop-blur-sm flex flex-col justify-between space-y-6 hover:border-slate-600 transition-colors"
              >
                {/* Header & Overall Score */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-white">{c.full_name}</h3>
                      <p className="text-xs text-blue-400 font-medium mt-0.5">{c.job_title}</p>
                      <span className="inline-block mt-1.5 text-[11px] px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                        {c.department}
                      </span>
                    </div>

                    {match && (
                      <div
                        className={`w-14 h-14 rounded-2xl border-2 flex flex-col items-center justify-center flex-shrink-0 ${getScoreColor(
                          match.overall_score
                        )}`}
                      >
                        <span className="text-base font-extrabold leading-none">
                          {Math.round(match.overall_score)}%
                        </span>
                        <span className="text-[9px] font-bold mt-1 uppercase">Match</span>
                      </div>
                    )}
                  </div>

                  {/* Quick Metrics */}
                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-2 bg-slate-900/80 border border-slate-700/80 rounded-lg">
                      <span className="text-[10px] text-slate-400 block font-semibold">EXPERIENCE</span>
                      <span className="font-bold text-white mt-0.5 block">{c.years_of_experience} Years</span>
                    </div>
                    <div className="p-2 bg-slate-900/80 border border-slate-700/80 rounded-lg">
                      <span className="text-[10px] text-slate-400 block font-semibold">WORK MODE</span>
                      <span className="font-bold text-white mt-0.5 block">
                        {c.open_to_remote ? 'Remote' : 'On-Site'}
                      </span>
                    </div>
                  </div>

                  {/* Match Diagnostics Breakdown */}
                  {match && (
                    <div className="p-3 bg-slate-900/90 border border-slate-700/70 rounded-xl space-y-2 text-xs">
                      <span className="font-semibold text-slate-300 text-[11px] block">
                        Score Breakdown:
                      </span>
                      <div className="space-y-1.5">
                        <div>
                          <div className="flex justify-between text-[11px] mb-0.5">
                            <span className="text-slate-400">Required Skills</span>
                            <span className="text-blue-400 font-bold">
                              {Math.round(match.required_skill_score)}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-1">
                            <div
                              className="bg-blue-500 h-1 rounded-full"
                              style={{ width: `${match.required_skill_score}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] mb-0.5">
                            <span className="text-slate-400">Semantic Fit</span>
                            <span className="text-cyan-400 font-bold">
                              {Math.round(match.semantic_score)}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-1">
                            <div
                              className="bg-cyan-500 h-1 rounded-full"
                              style={{ width: `${match.semantic_score}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] mb-0.5">
                            <span className="text-slate-400">Proficiency</span>
                            <span className="text-purple-400 font-bold">
                              {Math.round(match.proficiency_score)}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-1">
                            <div
                              className="bg-purple-500 h-1 rounded-full"
                              style={{ width: `${match.proficiency_score}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Matched Skills */}
                  {match && match.matched_skills && (
                    <div className="space-y-1.5">
                      <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Matched Skills ({match.matched_skills.length})
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {match.matched_skills.map((s, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded text-[10px]"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skill Gaps */}
                  {match && match.skill_gaps && match.skill_gaps.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-xs font-semibold text-rose-400 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Missing Competencies ({match.skill_gaps.length})
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {match.skill_gaps.map((g, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded text-[10px]"
                          >
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* All Top Skills */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-700/60">
                    <span className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-blue-400" />
                      Top Profile Skills
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {c.skills?.slice(0, 6).map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-slate-900 border border-slate-700 text-slate-300 rounded text-[10px]"
                        >
                          {s.name} (L{s.proficiency_level})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Bottom CTA */}
                <div className="pt-4 border-t border-slate-700/60">
                  <button
                    onClick={() =>
                      navigate(
                        `/hr/candidates/${c.employee_id}${projectId ? `?projectId=${projectId}` : ''}`
                      )
                    }
                    className="w-full inline-flex items-center justify-center gap-2 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
                  >
                    View Full Profile & Diagnostics
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
