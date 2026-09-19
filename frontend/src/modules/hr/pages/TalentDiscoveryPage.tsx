// Eagle Vision — Talent Discovery & Matching Studio
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  Search,
  Filter,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  ChevronLeft,
  Loader2,
  Scale,
} from 'lucide-react';
import { hrApi } from '../services/hrApi';
import type { CandidateMatch } from '../types';

export const TalentDiscoveryPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [minScore, setMinScore] = useState(0);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Load project
  const { data: project } = useQuery({
    queryKey: ['hr-project', projectId],
    queryFn: () => hrApi.getProject(projectId!),
    enabled: !!projectId,
  });

  // Load matches
  const {
    data: matchData,
    isLoading: matchesLoading,
    isRefetching,
  } = useQuery({
    queryKey: ['hr-candidates', projectId],
    queryFn: () => hrApi.getCandidates(projectId!),
    enabled: !!projectId,
  });

  // Trigger match computation mutation
  const runMatchMutation = useMutation({
    mutationFn: () => hrApi.matchTalent(projectId!),
    onSuccess: (data) => {
      queryClient.setQueryData(['hr-candidates', projectId], data);
      const list = data.candidates || data.matches || [];
      setSuccessToast(`Found and ranked ${list.length} candidate matches!`);
      setTimeout(() => setSuccessToast(null), 4000);
    },
  });

  const candidates: CandidateMatch[] = matchData?.candidates || matchData?.matches || [];

  // Filter candidates
  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch =
      c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.job_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.matched_skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDept = selectedDept === 'ALL' || c.department === selectedDept;
    const matchesScore = c.overall_score >= minScore;

    return matchesSearch && matchesDept && matchesScore;
  });

  // Unique departments for filter
  const departments = Array.from(new Set(candidates.map((c) => c.department))).filter(Boolean);

  const toggleCompare = (employeeId: string) => {
    if (selectedForCompare.includes(employeeId)) {
      setSelectedForCompare(selectedForCompare.filter((id) => id !== employeeId));
    } else {
      if (selectedForCompare.length >= 4) {
        alert('You can compare a maximum of 4 candidates at once.');
        return;
      }
      setSelectedForCompare([...selectedForCompare, employeeId]);
    }
  };

  const handleGoToCompare = () => {
    if (selectedForCompare.length < 2) {
      alert('Please select at least 2 candidates to compare.');
      return;
    }
    navigate(`/hr/projects/${projectId}/compare?candidates=${selectedForCompare.join(',')}`);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (score >= 65) return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
    if (score >= 50) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/hr/projects/${projectId}/analysis`)}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Back to Requirement Studio"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Talent Discovery & Match Ranking
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
                {candidates.length} Ranked
              </span>
            </div>
            <p className="text-slate-400 text-sm mt-0.5">
              Project:{' '}
              <span className="text-blue-400 font-medium">{project?.name || 'Loading...'}</span>{' '}
              • Department:{' '}
              <span className="text-slate-300">{project?.department || '—'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => runMatchMutation.mutate()}
            disabled={runMatchMutation.isPending || isRefetching}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-medium transition-colors disabled:opacity-50"
          >
            {runMatchMutation.isPending || isRefetching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 text-cyan-400" />
            )}
            Re-Compute AI Matches
          </button>

          {selectedForCompare.length > 0 && (
            <button
              onClick={handleGoToCompare}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors shadow-lg shadow-indigo-500/20"
            >
              <Scale className="w-4 h-4" />
              Compare ({selectedForCompare.length}) Candidates
            </button>
          )}
        </div>
      </div>

      {/* Toast */}
      {successToast && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 backdrop-blur-sm flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search candidates by name, job title, or matched skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          {/* Department Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Min Score Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Min Score:</span>
            <select
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value={0}>All Scores (0%+)</option>
              <option value={50}>50% & above</option>
              <option value={70}>70% & above (Strong)</option>
              <option value={85}>85% & above (Ideal)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Candidate List / Cards */}
      {matchesLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-3" />
          <p>Analyzing internal talent pool and computing hybrid scores...</p>
        </div>
      ) : filteredCandidates.length === 0 ? (
        <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-12 text-center">
          <Users className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white">No candidate matches found</h3>
          <p className="text-slate-400 text-sm mt-1 max-w-md mx-auto">
            {candidates.length === 0
              ? 'Click "Re-Compute AI Matches" above to trigger the talent discovery algorithm.'
              : 'Try relaxing your search query or lowering the minimum match score threshold.'}
          </p>
          {candidates.length === 0 && (
            <button
              onClick={() => runMatchMutation.mutate()}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Run AI Matching Now
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredCandidates.map((candidate, idx) => {
            const isSelected = selectedForCompare.includes(candidate.employee_id);
            return (
              <div
                key={candidate.employee_id}
                className={`bg-slate-800/60 border ${
                  isSelected ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-slate-700/60'
                } rounded-xl p-5 backdrop-blur-sm hover:border-slate-600 transition-all`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Info & Rank */}
                  <div className="flex items-start gap-4">
                    {/* Rank Badge */}
                    <div className="flex flex-col items-center justify-center w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 font-bold text-sm">
                      #{idx + 1}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3
                          className="font-bold text-white text-base hover:text-blue-400 cursor-pointer transition-colors"
                          onClick={() =>
                            navigate(`/hr/candidates/${candidate.employee_id}?projectId=${projectId}`)
                          }
                        >
                          {candidate.full_name}
                        </h3>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-700 text-slate-300 font-medium">
                          {candidate.department}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span>{candidate.job_title}</span>
                        <span>•</span>
                        <span>{candidate.years_of_experience} yrs experience</span>
                      </div>

                      {/* AI Explanation Snippet */}
                      {candidate.explanation && (
                        <p className="text-xs text-slate-300 bg-slate-900/60 p-2 rounded-lg border border-slate-800/80 mt-2 max-w-3xl leading-relaxed">
                          <Sparkles className="w-3 h-3 text-cyan-400 inline mr-1.5" />
                          {candidate.explanation}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Center/Right: Score Breakdown & Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-6 lg:justify-end">
                    {/* Scores Matrix */}
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="bg-slate-900/80 border border-slate-700/80 rounded-lg p-2 min-w-[70px]">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Skills</span>
                        <span className="text-sm font-bold text-blue-400">
                          {Math.round(candidate.required_skill_score || 0)}%
                        </span>
                      </div>
                      <div className="bg-slate-900/80 border border-slate-700/80 rounded-lg p-2 min-w-[70px]">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Semantic</span>
                        <span className="text-sm font-bold text-cyan-400">
                          {Math.round(candidate.semantic_score || 0)}%
                        </span>
                      </div>
                      <div className="bg-slate-900/80 border border-slate-700/80 rounded-lg p-2 min-w-[70px]">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Exp/Prof</span>
                        <span className="text-sm font-bold text-purple-400">
                          {Math.round(candidate.proficiency_score || 0)}%
                        </span>
                      </div>
                    </div>

                    {/* Overall Match Circle / Score */}
                    <div className="flex flex-col items-center justify-center">
                      <div
                        className={`w-14 h-14 rounded-full border-2 flex flex-col items-center justify-center ${getScoreColor(
                          candidate.overall_score
                        )}`}
                      >
                        <span className="text-base font-extrabold leading-tight">
                          {Math.round(candidate.overall_score)}%
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 font-semibold">OVERALL</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleCompare(candidate.employee_id)}
                        className={`p-2 rounded-lg border text-xs font-medium transition-colors ${
                          isSelected
                            ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                            : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:border-slate-500'
                        }`}
                        title="Select for comparison"
                      >
                        <Scale className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() =>
                          navigate(`/hr/candidates/${candidate.employee_id}?projectId=${projectId}`)
                        }
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
                      >
                        View Profile
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Skills Tags Bottom Row */}
                <div className="mt-4 pt-3 border-t border-slate-700/40 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-slate-400 text-[11px] font-medium mr-1">Matched Skills:</span>
                    {candidate.matched_skills?.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[11px]"
                      >
                        ✓ {skill}
                      </span>
                    ))}
                    {candidate.skill_gaps && candidate.skill_gaps.length > 0 && (
                      <>
                        <span className="text-slate-500 mx-1">|</span>
                        <span className="text-slate-400 text-[11px] font-medium mr-1">Skill Gaps:</span>
                        {candidate.skill_gaps.map((gap, gIdx) => (
                          <span
                            key={gIdx}
                            className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20 text-[11px]"
                          >
                            ! {gap}
                          </span>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
