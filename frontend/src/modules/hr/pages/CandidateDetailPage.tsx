// Eagle Vision — Candidate Profile & Match Deep-Dive Page
import React, { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Briefcase,
  MapPin,
  AlertTriangle,
  BookOpen,
  ChevronLeft,
  Sparkles,
  Zap,
  Award,
  Clock,
  Send,
  Loader2,
  Check,
} from 'lucide-react';
import { hrApi } from '../services/hrApi';

export const CandidateDetailPage: React.FC = () => {
  const { employeeId } = useParams<{ employeeId: string }>();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId') || undefined;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [assignedSuccess, setAssignedSuccess] = useState(false);

  // Fetch candidate details
  const { data: candidate, isLoading, error } = useQuery({
    queryKey: ['hr-candidate-detail', employeeId, projectId],
    queryFn: () => hrApi.getCandidateDetail(employeeId!, projectId),
    enabled: !!employeeId,
  });

  // Assign candidate mutation
  const assignMutation = useMutation({
    mutationFn: async () => {
      if (!projectId || !employeeId) return;
      return hrApi.assignCandidate(projectId, employeeId);
    },
    onSuccess: () => {
      setAssignedSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['hr-candidate-detail', employeeId, projectId] });
      queryClient.invalidateQueries({ queryKey: ['hr-candidates', projectId] });
      queryClient.invalidateQueries({ queryKey: ['hr-dashboard'] });
      setTimeout(() => setAssignedSuccess(false), 5000);
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-3" />
        <p>Loading candidate profile and AI match diagnostics...</p>
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 text-center text-red-400 max-w-lg mx-auto">
        <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-red-400" />
        <h3 className="font-semibold text-lg">Candidate Not Found</h3>
        <p className="text-sm mt-1 text-slate-400">Could not retrieve candidate information.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  const match = candidate.match_analysis;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Back & Top Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Go Back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Candidate Profile</h1>
            <p className="text-slate-400 text-xs">
              ID: <span className="font-mono text-slate-300">{candidate.employee_id}</span>
            </p>
          </div>
        </div>

        {projectId && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => assignMutation.mutate()}
              disabled={assignMutation.isPending || assignedSuccess}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                assignedSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25'
              } disabled:opacity-50`}
            >
              {assignMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : assignedSuccess ? (
                <Check className="w-4 h-4" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {assignedSuccess ? 'Candidate Assigned!' : 'Assign to Opportunity'}
            </button>
          </div>
        )}
      </div>

      {/* Main Profile Header Card */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-500/20 flex-shrink-0">
              {candidate.first_name ? candidate.first_name[0] : candidate.full_name[0]}
              {candidate.last_name ? candidate.last_name[0] : ''}
            </div>

            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl font-bold text-white">{candidate.full_name}</h2>
                <span className="px-3 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
                  {candidate.department}
                </span>
                {candidate.open_to_remote && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
                    Remote Ready
                  </span>
                )}
              </div>

              <p className="text-slate-300 font-medium text-sm mt-1">{candidate.job_title}</p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-2">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  {candidate.location || 'Location Not Specified'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                  {candidate.years_of_experience} Years Total Experience
                </span>
              </div>
            </div>
          </div>

          {/* If Match Analysis Exists: Show Big Match Score Ring */}
          {match && (
            <div className="flex items-center gap-4 bg-slate-900/80 border border-slate-700/80 rounded-xl p-4 self-start md:self-auto">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  AI Fit Score
                </span>
                <span className="text-xs text-blue-400 font-medium">Project Match</span>
              </div>
              <div className="w-14 h-14 rounded-full border-2 border-emerald-500 bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-black text-lg">
                {Math.round(match.overall_score)}%
              </div>
            </div>
          )}
        </div>

        {candidate.bio && (
          <p className="mt-4 pt-4 border-t border-slate-700/40 text-sm text-slate-300 leading-relaxed">
            {candidate.bio}
          </p>
        )}
      </div>

      {/* If viewing within project context: Match Diagnostics & AI Explanation */}
      {match && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Match Score Matrix */}
          <div className="lg:col-span-8 bg-slate-800/60 border border-slate-700/60 rounded-xl p-5 backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
              <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                Match Diagnostics & Score Breakdown
              </h3>
              <span className="text-xs text-slate-400">Weighted Hybrid Model</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-900/80 border border-slate-700 rounded-lg text-center">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Required Skills</span>
                <span className="text-lg font-bold text-blue-400 mt-1 block">
                  {Math.round(match.required_skill_score)}%
                </span>
                <span className="text-[10px] text-slate-500">Weight: 40%</span>
              </div>
              <div className="p-3 bg-slate-900/80 border border-slate-700 rounded-lg text-center">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Semantic Fit</span>
                <span className="text-lg font-bold text-cyan-400 mt-1 block">
                  {Math.round(match.semantic_score)}%
                </span>
                <span className="text-[10px] text-slate-500">Weight: 20%</span>
              </div>
              <div className="p-3 bg-slate-900/80 border border-slate-700 rounded-lg text-center">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Proficiency</span>
                <span className="text-lg font-bold text-purple-400 mt-1 block">
                  {Math.round(match.proficiency_score)}%
                </span>
                <span className="text-[10px] text-slate-500">Weight: 20%</span>
              </div>
              <div className="p-3 bg-slate-900/80 border border-slate-700 rounded-lg text-center">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Experience</span>
                <span className="text-lg font-bold text-amber-400 mt-1 block">
                  {Math.round(match.experience_score)}%
                </span>
                <span className="text-[10px] text-slate-500">Weight: 10%</span>
              </div>
            </div>

            {/* AI Explanation Paragraph */}
            {match.explanation && (
              <div className="p-4 bg-slate-900/90 border border-slate-700/80 rounded-xl space-y-1.5">
                <span className="text-xs font-semibold text-cyan-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Matching Rationale:
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">{match.explanation}</p>
              </div>
            )}
          </div>

          {/* Matched vs Missing Skills */}
          <div className="lg:col-span-4 bg-slate-800/60 border border-slate-700/60 rounded-xl p-5 backdrop-blur-sm space-y-4">
            <h3 className="font-semibold text-white text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              Skill Compatibility
            </h3>

            <div>
              <span className="text-xs text-emerald-400 font-semibold block mb-2">
                ✓ Matched Skills ({match.matched_skills.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {match.matched_skills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-lg font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {match.skill_gaps.length > 0 && (
              <div className="pt-3 border-t border-slate-700/60">
                <span className="text-xs text-rose-400 font-semibold block mb-2">
                  ! Skill Gaps ({match.skill_gaps.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {match.skill_gaps.map((gap, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-lg font-medium"
                    >
                      {gap}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Candidate Verified Skills Inventory */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5 backdrop-blur-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
          <h3 className="font-semibold text-white text-sm flex items-center gap-2">
            <Award className="w-4 h-4 text-blue-400" />
            Verified Skill Inventory ({candidate.skills?.length || 0})
          </h3>
          <span className="text-xs text-slate-400">Scale 1-5</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {candidate.skills?.map((s, idx) => (
            <div
              key={idx}
              className="p-3 bg-slate-900/80 border border-slate-700/70 rounded-lg flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{s.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-medium">
                  Lvl {s.proficiency_level}/5
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2">
                <div
                  className="bg-blue-500 h-1.5 rounded-full"
                  style={{ width: `${(s.proficiency_level / 5) * 100}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1.5">
                {s.years_of_experience} yrs practical exp
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Learning Recommendations & Upskilling Path */}
      {candidate.learning_recommendations && candidate.learning_recommendations.length > 0 && (
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5 backdrop-blur-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
            <h3 className="font-semibold text-white text-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              AI Upskilling Path & Learning Recommendations
            </h3>
            <span className="text-xs text-slate-400">
              {candidate.learning_recommendations.length} recommended actions
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {candidate.learning_recommendations.map((rec, idx) => {
              const skillTitle = rec.skill || rec.skill_name || 'Competency Enhancement';
              const priority = rec.priority || 'High';
              const duration = rec.estimated_weeks
                ? `~${rec.estimated_weeks} weeks`
                : rec.duration_hours
                ? `${rec.duration_hours} hrs`
                : '~2 weeks';
              return (
                <div
                  key={idx}
                  className="p-4 bg-slate-900/80 border border-slate-700/70 rounded-xl flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white">{skillTitle}</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          priority === 'High'
                            ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                            : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {priority} Priority
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-medium">{rec.course_title}</p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {duration}
                    </span>
                    <span className="text-blue-400 font-medium">{rec.provider || 'Internal Academy'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
