// Eagle Vision — Requirement Analysis & Editor Page
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Sparkles,
  Save,
  CheckCircle2,
  ArrowRight,
  Plus,
  Trash2,
  Briefcase,
  AlertCircle,
  Loader2,
  Layers,
  ChevronLeft,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { hrApi } from '../services/hrApi';
import type { StructuredRequirement, RequiredSkill, ProjectRole } from '../types';

export const RequirementAnalysisPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Load project details
  const { data: project, isLoading: projectLoading, error: projectError } = useQuery({
    queryKey: ['hr-project', projectId],
    queryFn: () => hrApi.getProject(projectId!),
    enabled: !!projectId,
  });

  const [rawText, setRawText] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [roles, setRoles] = useState<ProjectRole[]>([]);
  const [requiredSkills, setRequiredSkills] = useState<RequiredSkill[]>([]);
  const [preferredSkills, setPreferredSkills] = useState<string[]>([]);
  const [experienceYears, setExperienceYears] = useState<number>(3);
  const [responsibilities, setResponsibilities] = useState<string[]>([]);
  const [durationMonths, setDurationMonths] = useState<number>(6);
  const [workMode, setWorkMode] = useState<string>('hybrid');
  const [location, setLocation] = useState<string>('Remote / Hybrid');
  const [headcount, setHeadcount] = useState<number>(1);

  // New item input states
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState('Intermediate');
  const [newSkillImportance, setNewSkillImportance] = useState('High');
  const [newPrefSkill, setNewPrefSkill] = useState('');
  const [newResp, setNewResp] = useState('');
  const [newRoleTitle, setNewRoleTitle] = useState('');
  const [newRoleHeadcount, setNewRoleHeadcount] = useState(1);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Initialize form when project and requirement are fetched
  useEffect(() => {
    if (project) {
      const req = project.requirement;
      if (req) {
        setRawText(req.raw_description || project.description || '');
        setProjectTitle(req.project_title || project.name || '');
        setRoles(req.roles && req.roles.length > 0 ? req.roles : [{ title: project.name, headcount: project.headcount || 1 }]);
        setRequiredSkills(req.required_skills || []);
        setPreferredSkills(req.preferred_skills || []);
        setExperienceYears(req.experience_years || 3);
        setResponsibilities(req.responsibilities || []);
        setDurationMonths(req.constraints?.duration_months || project.duration_months || 6);
        setWorkMode(req.constraints?.work_mode || project.work_mode || 'hybrid');
        setLocation(req.constraints?.location || project.location || 'Remote / Hybrid');
        setHeadcount(project.headcount || 1);
      } else {
        setRawText(project.description || '');
        setProjectTitle(project.name || '');
        setRoles([{ title: project.name, headcount: project.headcount || 1 }]);
        setDurationMonths(project.duration_months || 6);
        setWorkMode(project.work_mode || 'hybrid');
        setLocation(project.location || 'Remote / Hybrid');
        setHeadcount(project.headcount || 1);
      }
    }
  }, [project]);

  // AI Re-Analyze Mutation
  const analyzeMutation = useMutation({
    mutationFn: () =>
      hrApi.analyzeRequirement(projectId!, {
        raw_description: rawText,
        project_name: projectTitle || project?.name,
        department: project?.department,
        duration_months: durationMonths,
        headcount: headcount,
      }),
    onSuccess: (analyzedReq: StructuredRequirement) => {
      setProjectTitle(analyzedReq.project_title || projectTitle);
      setRoles(analyzedReq.roles || []);
      setRequiredSkills(analyzedReq.required_skills || []);
      setPreferredSkills(analyzedReq.preferred_skills || []);
      setExperienceYears(analyzedReq.experience_years || 3);
      setResponsibilities(analyzedReq.responsibilities || []);
      if (analyzedReq.constraints) {
        setDurationMonths(analyzedReq.constraints.duration_months || durationMonths);
        setWorkMode(analyzedReq.constraints.work_mode || workMode);
        setLocation(analyzedReq.constraints.location || location);
      }
      queryClient.invalidateQueries({ queryKey: ['hr-project', projectId] });
      setSuccessMessage('AI successfully analyzed and extracted requirements!');
      setTimeout(() => setSuccessMessage(null), 4000);
    },
  });

  // Save / Publish Mutation
  const saveMutation = useMutation({
    mutationFn: async (publish: boolean = false) => {
      const payload = {
        project_title: projectTitle,
        roles: roles,
        required_skills: requiredSkills,
        preferred_skills: preferredSkills,
        experience_years: experienceYears,
        responsibilities: responsibilities,
        constraints: {
          duration_months: durationMonths,
          work_mode: workMode,
          location: location,
        },
      };

      const reqId = project?.requirement?.id;
      if (reqId) {
        await hrApi.updateRequirement(reqId, payload);
        if (publish) {
          await hrApi.publishRequirement(reqId);
        }
      } else {
        // Run analyze to persist first
        await hrApi.analyzeRequirement(projectId!, {
          raw_description: rawText,
          project_name: projectTitle,
          department: project?.department,
        });
      }
    },
    onSuccess: (_, publish) => {
      queryClient.invalidateQueries({ queryKey: ['hr-project', projectId] });
      setSuccessMessage(publish ? 'Requirement published successfully!' : 'Changes saved successfully!');
      setTimeout(() => setSuccessMessage(null), 4000);
    },
  });

  // Skill manipulations
  const addRequiredSkill = () => {
    if (!newSkillName.trim()) return;
    setRequiredSkills([
      ...requiredSkills,
      { name: newSkillName.trim(), level: newSkillLevel, importance: newSkillImportance },
    ]);
    setNewSkillName('');
  };

  const removeRequiredSkill = (index: number) => {
    setRequiredSkills(requiredSkills.filter((_, i) => i !== index));
  };

  const addPreferredSkill = () => {
    if (!newPrefSkill.trim()) return;
    if (!preferredSkills.includes(newPrefSkill.trim())) {
      setPreferredSkills([...preferredSkills, newPrefSkill.trim()]);
    }
    setNewPrefSkill('');
  };

  const removePreferredSkill = (index: number) => {
    setPreferredSkills(preferredSkills.filter((_, i) => i !== index));
  };

  const addResponsibility = () => {
    if (!newResp.trim()) return;
    setResponsibilities([...responsibilities, newResp.trim()]);
    setNewResp('');
  };

  const removeResponsibility = (index: number) => {
    setResponsibilities(responsibilities.filter((_, i) => i !== index));
  };

  const addRole = () => {
    if (!newRoleTitle.trim()) return;
    setRoles([...roles, { title: newRoleTitle.trim(), headcount: newRoleHeadcount }]);
    setNewRoleTitle('');
    setNewRoleHeadcount(1);
  };

  const removeRole = (index: number) => {
    setRoles(roles.filter((_, i) => i !== index));
  };

  if (projectLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-3" />
        <p>Loading requirement details...</p>
      </div>
    );
  }

  if (projectError || !project) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center text-red-400">
        <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-400" />
        <p className="font-medium">Failed to load project requirements.</p>
        <button
          onClick={() => navigate('/hr/projects')}
          className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm transition-colors"
        >
          Back to Projects
        </button>
      </div>
    );
  }

  const isPublished = project.requirement?.status === 'published';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/hr/projects')}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Back to Projects"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                AI Requirement Studio
              </h1>
              <span
                className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
                  isPublished
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}
              >
                {isPublished ? 'Published' : 'Draft / Analyzed'}
              </span>
            </div>
            <p className="text-slate-400 text-sm mt-0.5">
              Project: <span className="text-blue-400 font-medium">{project.name}</span> • Department:{' '}
              <span className="text-slate-300">{project.department}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => saveMutation.mutate(false)}
            disabled={saveMutation.isPending}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-medium transition-colors disabled:opacity-50"
          >
            {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Draft
          </button>

          {!isPublished && (
            <button
              onClick={() => saveMutation.mutate(true)}
              disabled={saveMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              Publish Requirement
            </button>
          )}

          <button
            onClick={() => navigate(`/hr/projects/${projectId}/candidates`)}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold transition-all shadow-lg shadow-blue-500/25"
          >
            <Zap className="w-4 h-4 text-amber-300" />
            Discover & Match Talent
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Two Column Layout: Raw Input (Left) & AI Structured Extracted Schema (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Natural Language Input & Controls */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5 backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <h3 className="font-semibold text-white text-sm">Natural Language Prompt / JD</h3>
              </div>
              <span className="text-xs text-slate-400">Gemini / Claude NLP</span>
            </div>

            <p className="text-xs text-slate-400">
              Type or paste the project description, deliverables, or required tech stack. The AI extractor will parse and update structured attributes automatically.
            </p>

            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              rows={12}
              className="w-full bg-slate-900/80 border border-slate-700 rounded-lg p-3 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono leading-relaxed"
              placeholder="e.g. We are building a high-throughput recommendation microservice for our mobile app. We need a Senior Backend Engineer with at least 4 years of experience in Python, FastAPI, PostgreSQL, Redis, and vector search..."
            />

            <button
              onClick={() => analyzeMutation.mutate()}
              disabled={analyzeMutation.isPending || !rawText.trim()}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-medium text-sm transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {analyzeMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing with AI Engine...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Re-Extract & Analyze with AI
                </>
              )}
            </button>
          </div>

          {/* Quick Constraints & Metadata */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5 backdrop-blur-sm space-y-4">
            <h3 className="font-semibold text-white text-sm flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-400" />
              Project Constraints
            </h3>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Duration (Months)</label>
                <input
                  type="number"
                  value={durationMonths}
                  onChange={(e) => setDurationMonths(parseInt(e.target.value) || 1)}
                  min={1}
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Headcount</label>
                <input
                  type="number"
                  value={headcount}
                  onChange={(e) => setHeadcount(parseInt(e.target.value) || 1)}
                  min={1}
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Work Mode</label>
                <select
                  value={workMode}
                  onChange={(e) => setWorkMode(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-blue-500"
                >
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="onsite">On-Site</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Min. Experience (Yrs)</label>
                <input
                  type="number"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(parseInt(e.target.value) || 0)}
                  min={0}
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium text-xs">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:ring-1 focus:ring-blue-500"
                placeholder="e.g. San Francisco, CA / Remote"
              />
            </div>
          </div>
        </div>

        {/* Right Column: AI Extracted Structured Fields & Edit Chips */}
        <div className="lg:col-span-7 space-y-6">
          {/* Project Title & Target Roles */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5 backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
              <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                Extracted Roles & Headcount
              </h3>
              <span className="text-xs text-slate-400">{roles.length} role(s)</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Standardized Role Title</label>
                <input
                  type="text"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. Senior Backend AI Engineer"
                />
              </div>

              {/* Roles List */}
              <div className="flex flex-wrap gap-2 pt-1">
                {roles.map((role, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/90 border border-slate-700 rounded-lg text-xs text-slate-200"
                  >
                    <span className="font-medium text-white">{role.title}</span>
                    <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-300 rounded text-[10px]">
                      {role.headcount} seat{role.headcount > 1 ? 's' : ''}
                    </span>
                    <button
                      onClick={() => removeRole(idx)}
                      className="text-slate-400 hover:text-red-400 transition-colors ml-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Role Inline */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Add role title..."
                  value={newRoleTitle}
                  onChange={(e) => setNewRoleTitle(e.target.value)}
                  className="flex-1 bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                />
                <input
                  type="number"
                  min={1}
                  value={newRoleHeadcount}
                  onChange={(e) => setNewRoleHeadcount(parseInt(e.target.value) || 1)}
                  className="w-16 bg-slate-900/80 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white text-center"
                />
                <button
                  type="button"
                  onClick={addRole}
                  className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Required Skills Matrix */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5 backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
              <div>
                <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Mandatory Required Skills
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Extracted competencies with proficiency and weight requirements.
                </p>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {requiredSkills.length} Skills
              </span>
            </div>

            {/* Required Skills Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {requiredSkills.map((skill, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 bg-slate-900/80 border border-slate-700/70 rounded-lg hover:border-slate-600 transition-colors"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-white text-xs">{skill.name}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-medium">
                        {skill.level}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-medium">
                        {skill.importance}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeRequiredSkill(idx)}
                    className="p-1 text-slate-500 hover:text-red-400 transition-colors rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Skill Row */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-700/40">
              <input
                type="text"
                placeholder="Skill name (e.g. PyTorch)..."
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                className="flex-1 bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
              />
              <select
                value={newSkillLevel}
                onChange={(e) => setNewSkillLevel(e.target.value)}
                className="bg-slate-900/80 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-200"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
              <select
                value={newSkillImportance}
                onChange={(e) => setNewSkillImportance(e.target.value)}
                className="bg-slate-900/80 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-200"
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
              </select>
              <button
                type="button"
                onClick={addRequiredSkill}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Preferred / Nice-to-have Skills */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5 backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
              <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Preferred / Bonus Skills
              </h3>
              <span className="text-xs text-slate-400">{preferredSkills.length} skill(s)</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {preferredSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-full text-xs font-medium"
                >
                  {skill}
                  <button
                    onClick={() => removePreferredSkill(idx)}
                    className="text-emerald-400 hover:text-red-400 transition-colors"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="Add preferred skill (e.g. Docker, GraphQL)..."
                value={newPrefSkill}
                onChange={(e) => setNewPrefSkill(e.target.value)}
                className="flex-1 bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
              />
              <button
                type="button"
                onClick={addPreferredSkill}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-medium transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Key Deliverables & Responsibilities */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5 backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
              <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                Responsibilities & Deliverables
              </h3>
              <span className="text-xs text-slate-400">{responsibilities.length} items</span>
            </div>

            <div className="space-y-2">
              {responsibilities.map((resp, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between gap-3 p-2.5 bg-slate-900/70 border border-slate-700/60 rounded-lg text-xs text-slate-200"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-blue-400 font-bold">•</span>
                    <span>{resp}</span>
                  </div>
                  <button
                    onClick={() => removeResponsibility(idx)}
                    className="text-slate-500 hover:text-red-400 transition-colors p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="Add key responsibility..."
                value={newResp}
                onChange={(e) => setNewResp(e.target.value)}
                className="flex-1 bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
              />
              <button
                type="button"
                onClick={addResponsibility}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-medium transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
