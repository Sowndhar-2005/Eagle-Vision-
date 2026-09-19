// Eagle Vision — Project List & Create Project Page
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Plus, FolderKanban, Loader2, ChevronRight,
  Sparkles, ArrowLeft
} from 'lucide-react';
import { hrApi } from '../services/hrApi';
import type { HRProject, ProjectCreate } from '../types';

// ── Project List ─────────────────────────────────────────────────────────────
export const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: projects, isLoading } = useQuery<HRProject[]>({
    queryKey: ['hr-projects'],
    queryFn: () => hrApi.listProjects(),
  });

  const STATUS_COLORS: Record<string, string> = {
    active: 'bg-emerald-500/10 text-emerald-400',
    draft: 'bg-slate-500/10 text-slate-400',
    completed: 'bg-blue-500/10 text-blue-400',
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Projects</h1>
          <p className="text-sm text-slate-400 mt-0.5">Manage internal projects and talent requirements</p>
        </div>
        <button
          onClick={() => navigate('/hr/projects/new')}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 font-semibold rounded-lg hover:from-amber-400 hover:to-amber-500 transition-all text-sm"
        >
          <Plus className="w-4 h-4" /> Create Project
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
        </div>
      ) : (
        <div className="grid gap-3">
          {(projects || []).map((p) => (
            <div
              key={p.id}
              onClick={() => navigate(`/hr/projects/${p.id}/analysis`)}
              className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 hover:border-slate-700/60 cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                  <FolderKanban className="w-5 h-5 text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{p.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {p.department} • {p.headcount} position{p.headcount > 1 ? 's' : ''} • {p.work_mode}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2.5 py-1 rounded-full ${STATUS_COLORS[p.status] || STATUS_COLORS.draft}`}>
                  {p.status}
                </span>
                {p.candidate_count > 0 && (
                  <span className="text-xs text-slate-400 bg-slate-800/60 px-2 py-1 rounded-full">
                    {p.candidate_count} candidates
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Create Project ────────────────────────────────────────────────────────────
export const CreateProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<ProjectCreate>({
    name: '',
    department: 'Engineering',
    description: '',
    business_objective: '',
    duration_months: 6,
    location: '',
    work_mode: 'hybrid',
    headcount: 1,
    priority: 'medium',
  });
  const [rawRequirement, setRawRequirement] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState('');

  const createMutation = useMutation({
    mutationFn: (data: ProjectCreate) => hrApi.createProject(data),
    onSuccess: async (project) => {
      queryClient.invalidateQueries({ queryKey: ['hr-projects'] });
      queryClient.invalidateQueries({ queryKey: ['hr-dashboard'] });

      if (rawRequirement.trim()) {
        setAnalyzing(true);
        setAnalyzeError('');
        try {
          await hrApi.analyzeRequirement(project.id, {
            raw_description: rawRequirement,
            project_name: project.name,
            department: project.department,
            duration_months: formData.duration_months ?? undefined,
            headcount: formData.headcount,
          });
          navigate(`/hr/projects/${project.id}/analysis`);
        } catch (err: any) {
          setAnalyzeError(err.response?.data?.detail || 'AI analysis failed. You can retry from the project page.');
          navigate(`/hr/projects/${project.id}/analysis`);
        } finally {
          setAnalyzing(false);
        }
      } else {
        navigate(`/hr/projects/${project.id}/analysis`);
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const fillDemoRequirement = () => {
    setFormData({ ...formData, name: 'AI Talent Platform', department: 'Engineering' });
    setRawRequirement(
      'We need an AI backend developer. Python and FastAPI are mandatory. ' +
      'PostgreSQL and REST API experience are required. Docker is preferred. ' +
      'The candidate should have at least 2 years of experience.'
    );
  };

  const isSubmitting = createMutation.isPending || analyzing;

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={() => navigate('/hr/projects')} className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-200 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Projects
      </button>

      <h1 className="text-xl font-bold text-white mb-1">Create New Project</h1>
      <p className="text-sm text-slate-400 mb-6">Define project details and let AI analyze your requirements</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-300 mb-2">Project Details</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Project Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Department *</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              >
                {['Engineering', 'Data & AI', 'Product', 'Operations', 'Human Resources'].map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 h-20 resize-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Duration (months)</label>
              <input
                type="number"
                value={formData.duration_months || ''}
                onChange={(e) => setFormData({ ...formData, duration_months: parseInt(e.target.value) || undefined })}
                className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Positions</label>
              <input
                type="number"
                min={1}
                value={formData.headcount}
                onChange={(e) => setFormData({ ...formData, headcount: parseInt(e.target.value) || 1 })}
                className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Work Mode</label>
              <select
                value={formData.work_mode}
                onChange={(e) => setFormData({ ...formData, work_mode: e.target.value })}
                className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              >
                <option value="hybrid">Hybrid</option>
                <option value="remote">Remote</option>
                <option value="onsite">Onsite</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        {/* Requirement Input — the KEY field */}
        <div className="bg-slate-900/60 border border-amber-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-amber-400">Project Requirement / Job Description</h3>
            </div>
            <button
              type="button"
              onClick={fillDemoRequirement}
              className="text-xs text-amber-400/70 hover:text-amber-400 transition-colors"
            >
              Fill demo example
            </button>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            Describe your project needs in natural language. AI will extract skills, roles, and requirements automatically.
          </p>
          <textarea
            value={rawRequirement}
            onChange={(e) => setRawRequirement(e.target.value)}
            placeholder={`Example:\nWe need a backend developer for a 6-month AI platform project.\nThe employee should have Python, FastAPI, PostgreSQL, REST API development and basic machine-learning knowledge.\nExperience with Docker is preferred.`}
            className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/30 h-36 resize-none"
          />
          {analyzeError && (
            <p className="text-xs text-red-400 mt-2">{analyzeError}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting || !formData.name}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 font-semibold rounded-lg hover:from-amber-400 hover:to-amber-500 transition-all disabled:opacity-50 text-sm"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {analyzing ? 'Analyzing with AI...' : isSubmitting ? 'Creating...' : rawRequirement.trim() ? 'Create & Analyze Requirement' : 'Create Project'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/hr/projects')}
            className="px-4 py-2.5 text-sm text-slate-400 hover:text-slate-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectsPage;
