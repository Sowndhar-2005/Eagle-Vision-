import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SkillItem, DevelopingSkillItem, ExperienceItem, ProjectHistoryItem, OpportunityItem } from '../../types';
import {
  MapPin,
  Briefcase,
  Award,
  CheckCircle2,
  Building,
  Sparkles,
  GraduationCap,
  FolderGit2,
  Activity,
  Edit3,
  Plus,
  Users,
  Target,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Clock,
  Check,
  AlertCircle,
  HelpCircle,
  Send,
} from 'lucide-react';
import { EditProfileModal } from '../../components/modals/EditProfileModal';
import { EditAboutModal } from '../../components/modals/EditAboutModal';
import { AddEditSkillModal } from '../../components/modals/AddEditSkillModal';
import { AddEditDevelopingSkillModal } from '../../components/modals/AddEditDevelopingSkillModal';
import { EditCurrentWorkModal } from '../../components/modals/EditCurrentWorkModal';
import { AddEditExperienceModal } from '../../components/modals/AddEditExperienceModal';
import { AddEditProjectModal } from '../../components/modals/AddEditProjectModal';
import { ResumeIngestionModal } from '../../components/modals/ResumeIngestionModal';
import { RequestModal } from '../../components/modals/RequestModal';

export const MyProfilePage: React.FC = () => {
  const {
    currentUser,
    allOpportunities,
    submitRequest,
    addToast,
  } = useApp();

  // Modals state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isEditAboutOpen, setIsEditAboutOpen] = useState(false);
  const [isAddEditSkillOpen, setIsAddEditSkillOpen] = useState(false);
  const [skillToEdit, setSkillToEdit] = useState<SkillItem | null>(null);
  const [isAddEditDevSkillOpen, setIsAddEditDevSkillOpen] = useState(false);
  const [devSkillToEdit, setDevSkillToEdit] = useState<DevelopingSkillItem | null>(null);
  const [isEditCurrentWorkOpen, setIsEditCurrentWorkOpen] = useState(false);
  const [isAddEditExpOpen, setIsAddEditExpOpen] = useState(false);
  const [expToEdit, setExpToEdit] = useState<ExperienceItem | null>(null);
  const [isAddEditProjOpen, setIsAddEditProjOpen] = useState(false);
  const [projToEdit, setProjToEdit] = useState<ProjectHistoryItem | null>(null);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  // Selected skill filter in skills section
  const [selectedSkillCategory, setSelectedSkillCategory] = useState<string>('All');

  // Filter skills
  const categories = ['All', ...Array.from(new Set(currentUser.skills.map((s) => s.category)))];
  const filteredSkills =
    selectedSkillCategory === 'All'
      ? currentUser.skills
      : currentUser.skills.filter((s) => s.category === selectedSkillCategory);

  // Filter relevant internal opportunities
  const matchedOpportunities = allOpportunities.slice(0, 3);

  const handleOpenAddSkill = () => {
    setSkillToEdit(null);
    setIsAddEditSkillOpen(true);
  };

  const handleOpenEditSkill = (skill: SkillItem) => {
    setSkillToEdit(skill);
    setIsAddEditSkillOpen(true);
  };

  const handleOpenAddDevSkill = () => {
    setDevSkillToEdit(null);
    setIsAddEditDevSkillOpen(true);
  };

  const handleOpenEditDevSkill = (skill: DevelopingSkillItem) => {
    setDevSkillToEdit(skill);
    setIsAddEditDevSkillOpen(true);
  };

  const handleOpenAddExp = () => {
    setExpToEdit(null);
    setIsAddEditExpOpen(true);
  };

  const handleOpenEditExp = (exp: ExperienceItem) => {
    setExpToEdit(exp);
    setIsAddEditExpOpen(true);
  };

  const handleOpenAddProj = () => {
    setProjToEdit(null);
    setIsAddEditProjOpen(true);
  };

  const handleOpenEditProj = (proj: ProjectHistoryItem) => {
    setProjToEdit(proj);
    setIsAddEditProjOpen(true);
  };

  const handleApplyOpportunity = (opp: OpportunityItem) => {
    submitRequest({
      requesterId: currentUser.id,
      requesterName: currentUser.name,
      requesterAvatar: currentUser.avatar,
      requesterRole: currentUser.title,
      requesterTeamId: currentUser.teamId,
      requesterTeamName: currentUser.teamName,
      type: 'project',
      targetId: opp.id,
      targetTitle: `${opp.title} (${opp.team})`,
      reason: `Matched with ${(opp.matchScore * 100).toFixed(0)}% profile alignment. Expressing strong interest to join project initiative.`,
      desiredRoleOrSkill: opp.title,
      expectedBenefit: 'Expand technical domain contribution and cross-team mobility.',
    });
    addToast(
      'Interest Expressed!',
      `Submitted internal request for ${opp.title}. Team leader notified.`,
      'success'
    );
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* 1. PROFILE HEADER CARD */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-indigo-950/40 border border-slate-700/60 shadow-2xl p-6 sm:p-8 backdrop-blur-md">
        {/* Glow accent */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Avatar & Core Identity */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative group">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-2 border-indigo-500/60 shadow-2xl shadow-indigo-500/30 group-hover:scale-105 transition duration-300"
              />
              <span
                className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-slate-900 flex items-center justify-center ${
                  currentUser.employmentStatus === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                title={`Status: ${currentUser.employmentStatus}`}
              />
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {currentUser.name}
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                  {currentUser.employeeId}
                </span>
                <span className="text-xs px-3 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold">
                  {currentUser.personaTitle}
                </span>
              </div>

              <div className="text-base font-semibold text-indigo-200 flex items-center space-x-2">
                <Briefcase className="w-4 h-4 text-indigo-400" />
                <span>{currentUser.title}</span>
              </div>

              {/* Meta pills */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-300 pt-1">
                <span className="flex items-center space-x-1.5 font-medium text-slate-200">
                  <Building className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{currentUser.teamName}</span>
                </span>
                <span className="flex items-center space-x-1.5 text-indigo-300">
                  <Users className="w-3.5 h-3.5 text-violet-400" />
                  <span>
                    Team Leader: <strong className="text-white font-semibold">{currentUser.teamLeaderName}</strong>
                  </span>
                </span>
                <span className="flex items-center space-x-1.5 text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{currentUser.location}</span>
                </span>
                <span className="flex items-center space-x-1.5 text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{currentUser.yearsOfExperience} Experience</span>
                </span>
                <span className="flex items-center space-x-1.5 text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Status: {currentUser.employmentStatus}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right Action buttons & Profile Completion */}
          <div className="w-full lg:w-auto flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-800">
            {/* Completion Meter */}
            <div className="w-full sm:w-56 p-3 rounded-2xl bg-slate-800/80 border border-slate-700/70 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Profile Completion</span>
                <span className="font-bold text-indigo-400">{currentUser.profileCompletion}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-400 transition-all duration-700"
                  style={{ width: `${currentUser.profileCompletion}%` }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => setIsEditProfileOpen(true)}
                className="px-4 py-2 bg-slate-800/90 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition border border-slate-700/80 flex items-center space-x-1.5 shadow-sm"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-300" />
                <span>Edit Profile</span>
              </button>

              <button
                onClick={() => setIsResumeModalOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold transition shadow-lg shadow-violet-600/30 flex items-center space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Sync / Ingest Resume</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2 & 3: GRID OF ABOUT SUMMARY & CURRENT TEAM/ROLE ORGANIZATIONAL CONTEXT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 2. ABOUT / PROFESSIONAL SUMMARY (2 Cols) */}
        <div className="lg:col-span-2 p-6 sm:p-7 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 rounded-lg bg-violet-500/20 text-violet-400 border border-violet-500/30">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-white">About / Professional Summary</h2>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 font-medium flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3 text-violet-400" />
                <span>Gemini Continuous Talent Engine</span>
              </span>
              <button
                onClick={() => setIsEditAboutOpen(true)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                title="Edit Professional Summary"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/90 text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            {currentUser.professionalSummary}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Primary Focus</div>
              <div className="text-xs font-semibold text-white mt-0.5">{currentUser.department}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Specialization</div>
              <div className="text-xs font-semibold text-indigo-300 mt-0.5">
                {currentUser.skills[0]?.name || 'Full-Stack & Systems'}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Development Focus</div>
              <div className="text-xs font-semibold text-violet-300 mt-0.5">
                {currentUser.skillsDeveloping[0]?.name || 'MLOps & Kubernetes'}
              </div>
            </div>
          </div>
        </div>

        {/* 3. CURRENT TEAM & ROLE CONTEXT (1 Col) */}
        <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  <Building className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-white">Current Team & Role</h2>
              </div>
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                Active Assignment
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-800/40 space-y-1">
                <div className="text-[11px] text-indigo-300 uppercase font-bold tracking-wider">Team</div>
                <div className="text-sm font-black text-white">{currentUser.teamName}</div>
                <div className="text-[11px] text-slate-400 pt-0.5">
                  Department: <span className="text-slate-200 font-medium">{currentUser.department}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                <div className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Team Leader</div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">{currentUser.teamLeaderName}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono">
                    Team Lead
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Core Team Responsibilities:
                </div>
                <ul className="space-y-1 text-[11px] text-slate-300 pl-1">
                  {currentUser.currentWork.responsibilities.slice(0, 4).map((r, i) => (
                    <li key={i} className="flex items-start space-x-1.5">
                      <span className="text-indigo-400 font-bold">•</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={() => setIsEditCurrentWorkOpen(true)}
              className="w-full py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl transition text-xs flex items-center justify-center space-x-1.5 border border-slate-700"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Update Responsibilities & Role</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. CURRENT SKILLS (MAJOR SECTION) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white">Current Skills</h2>
                <p className="text-xs text-slate-400">
                  Verified competencies, proficiency ratings, evidence sources, and experience depth
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleOpenAddSkill}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition shadow-md shadow-indigo-600/30 flex items-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Skill</span>
            </button>
          </div>
        </div>

        {/* Categories filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedSkillCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                selectedSkillCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-800/70 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSkills.map((s) => (
            <div
              key={s.id}
              className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-3 group"
            >
              <div className="space-y-2">
                {/* Name & Badges */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-bold text-white text-sm flex items-center space-x-1.5">
                      <span>{s.name}</span>
                      {s.isVerified && (
                        <span title="Verified Skill">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400">{s.category}</div>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                        s.levelLabel === 'Expert'
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                          : s.levelLabel === 'Advanced'
                          ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                          : s.levelLabel === 'Intermediate'
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {s.levelLabel}
                    </span>
                    <button
                      onClick={() => handleOpenEditSkill(s)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
                      title="Edit Skill"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Proficiency</span>
                    <span>{s.proficiency}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        s.levelLabel === 'Expert'
                          ? 'bg-purple-500'
                          : s.levelLabel === 'Advanced'
                          ? 'bg-indigo-500'
                          : s.levelLabel === 'Intermediate'
                          ? 'bg-cyan-500'
                          : 'bg-slate-500'
                      }`}
                      style={{ width: `${s.proficiency}%` }}
                    />
                  </div>
                </div>

                {/* Meta */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                  <span>{s.yearsOfExperience} yrs experience</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {s.evidenceSource || 'Project Deliverable'}
                  </span>
                </div>

                {/* Evidence snippet */}
                <div className="text-[11px] text-slate-300 italic bg-slate-900/80 p-2 rounded-xl border border-slate-800/80 line-clamp-2">
                  "{s.evidence}"
                </div>
              </div>

              {s.isTransferable && (
                <div className="pt-1">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-violet-500/10 text-violet-300 border border-violet-500/20 font-medium">
                    ✓ Cross-Domain Transferable
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 5. SKILLS DEVELOPING (SEPARATE SECTION) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-violet-500/20 text-violet-400 border border-violet-500/30">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Skills Developing</h2>
              <p className="text-xs text-slate-400">
                Emerging competencies, ongoing certifications, and career target skills in active learning
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenAddDevSkill}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-semibold transition shadow-md shadow-violet-600/30 flex items-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Developing Skill</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {currentUser.skillsDeveloping.map((dev) => (
            <div
              key={dev.id}
              className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-3 group"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-white text-sm">{dev.name}</h3>
                    <span className="text-[11px] text-slate-400">{dev.category}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                      {dev.status}
                    </span>
                    <button
                      onClick={() => handleOpenEditDevSkill(dev)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
                      title="Edit Developing Skill"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Progress to Competency</span>
                    <span className="font-bold text-violet-300">{dev.progressPercentage}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-400"
                      style={{ width: `${dev.progressPercentage}%` }}
                    />
                  </div>
                </div>

                <div className="text-[11px] text-slate-300 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Target Relevance:</div>
                  <div>{dev.targetRoleRelevance}</div>
                </div>

                {dev.associatedCourseOrGig && (
                  <div className="text-[10px] text-indigo-300 flex items-center space-x-1">
                    <GraduationCap className="w-3 h-3 text-indigo-400" />
                    <span className="truncate">{dev.associatedCourseOrGig}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. CURRENT WORK (DISTINCT FROM HISTORICAL PROJECTS) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Current Work</h2>
              <p className="text-xs text-slate-400">
                Live sprint assignments, active deliverables, and real-time skill application
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEditCurrentWorkOpen(true)}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold transition shadow-md shadow-cyan-600/30 flex items-center space-x-1.5"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Update Current Work</span>
          </button>
        </div>

        <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-5">
          {/* Top banner: Project & Sprint */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900 border border-slate-800">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                Active Project Assignment
              </div>
              <div className="text-base sm:text-lg font-black text-white mt-0.5">
                {currentUser.currentWork.projectName}
              </div>
              <div className="text-xs text-slate-400">
                Role: <span className="text-white font-semibold">{currentUser.currentWork.role}</span> •{' '}
                {currentUser.currentWork.team}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold font-mono">
                {currentUser.currentWork.sprintPeriod}
              </span>
              <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                {currentUser.currentWork.status}
              </span>
            </div>
          </div>

          {/* 2-col responsibilities and tasks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Responsibilities */}
            <div className="space-y-2">
              <div className="font-bold text-white flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                <span>Current Responsibilities</span>
              </div>
              <ul className="space-y-1.5 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 text-slate-300">
                {currentUser.currentWork.responsibilities.map((r, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-indigo-400 font-bold">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Active Sprint Tasks */}
            <div className="space-y-2">
              <div className="font-bold text-white flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>Active Sprint Tasks</span>
              </div>
              <ul className="space-y-1.5 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 text-slate-300">
                {currentUser.currentWork.currentTasks.map((t, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-cyan-400 font-bold">→</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Skills in current work */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800 text-xs">
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Skills Being Used:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {currentUser.currentWork.skillsBeingUsed.map((s) => (
                  <span
                    key={s}
                    className="text-xs px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Skills Currently Being Developed in this Sprint:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {currentUser.currentWork.skillsCurrentlyDeveloping.map((s) => (
                  <span
                    key={s}
                    className="text-xs px-2.5 py-1 rounded-lg bg-violet-500/20 text-violet-300 border border-violet-500/30 font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {currentUser.currentWork.blockers && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>
                <strong>Sprint Note / Blocker:</strong> {currentUser.currentWork.blockers}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 7. WORK EXPERIENCE (CHRONOLOGICAL HISTORY) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Work Experience</h2>
              <p className="text-xs text-slate-400">
                Complete internal and verified previous organizational history
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenAddExp}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition shadow-md shadow-indigo-600/30 flex items-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Experience</span>
          </button>
        </div>

        <div className="space-y-4">
          {currentUser.experience.map((exp) => (
            <div
              key={exp.id}
              className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition space-y-3 group"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-white text-base">{exp.role}</h3>
                  <div className="text-xs text-slate-400 mt-0.5">
                    <span className="text-slate-200 font-semibold">{exp.company}</span> •{' '}
                    <span className="text-indigo-300">{exp.team}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                    {exp.duration}
                  </span>
                  <button
                    onClick={() => handleOpenEditExp(exp)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
                    title="Edit Experience"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Responsibilities list */}
              <div className="space-y-1">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Responsibilities:
                </div>
                <ul className="space-y-1 text-xs text-slate-300 pl-1">
                  {exp.responsibilities.map((r, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <span className="text-indigo-400 font-bold">•</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Achievements if any */}
              {exp.achievements && exp.achievements.length > 0 && (
                <div className="space-y-1 pt-1">
                  <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                    Key Achievements & Impact:
                  </div>
                  <ul className="space-y-1 text-xs text-slate-300 pl-1">
                    {exp.achievements.map((ach, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span>{ach}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Skills Used */}
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800/80">
                {exp.skillsUsed.map((t) => (
                  <span
                    key={t}
                    className="text-[11px] px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 8. PROJECTS (ACTIVE, COMPLETED & CROSS-TEAM GIGS) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Projects & Internal Gigs</h2>
              <p className="text-xs text-slate-400">
                Contributions across company products, cross-team initiatives, and core systems
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenAddProj}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition shadow-md shadow-indigo-600/30 flex items-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Project</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentUser.projects.map((proj) => (
            <div
              key={proj.id}
              className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-white text-base">{proj.name}</h3>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Role: <span className="text-indigo-300 font-semibold">{proj.role}</span> • {proj.team}
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                        proj.status === 'current'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : proj.status === 'cross_team'
                          ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {proj.status.replace('_', ' ')}
                    </span>
                    <button
                      onClick={() => handleOpenEditProj(proj)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
                      title="Edit Project"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  {proj.description}
                </p>

                {/* Responsibilities */}
                <div className="space-y-1">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Key Responsibilities:
                  </div>
                  <ul className="space-y-1 text-xs text-slate-300 pl-1">
                    {proj.responsibilities.map((r, i) => (
                      <li key={i} className="flex items-start space-x-1.5">
                        <span className="text-indigo-400">•</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Outcome */}
                {proj.projectOutcome && (
                  <div className="text-xs text-slate-300 bg-emerald-950/20 border border-emerald-800/30 p-2.5 rounded-xl">
                    <strong className="text-emerald-400">Outcome:</strong> {proj.projectOutcome}
                  </div>
                )}
              </div>

              {/* Technologies */}
              <div className="pt-2 border-t border-slate-800/80">
                <div className="text-[10px] font-bold text-slate-400 uppercase mb-1.5">
                  Demonstrated Technologies:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {proj.technologies.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] px-2 py-0.5 rounded bg-indigo-950/40 text-indigo-300 border border-indigo-800/40"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 9. LEARNING & DEVELOPMENT */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-violet-500/20 text-violet-400 border border-violet-500/30">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Learning & Development</h2>
              <p className="text-xs text-slate-400">
                Ongoing courses, completed certifications, and skill expansion pathways
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsRequestModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold transition shadow-md shadow-violet-600/30 flex items-center space-x-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Request Course or Development</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
          {/* Active Courses */}
          <div className="space-y-3">
            <div className="font-bold text-white flex items-center justify-between">
              <span>Active Courses & Progress</span>
              <span className="text-violet-400 text-[11px]">In Progress</span>
            </div>

            <div className="space-y-3">
              {currentUser.learningHistory.currentLearning.map((cl) => (
                <div key={cl.id} className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="font-semibold text-white">{cl.title}</div>
                  <div className="text-[11px] text-slate-400">
                    Provider: {cl.provider} • Target: <span className="text-indigo-300">{cl.targetSkill}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Progress</span>
                      <span className="font-bold text-violet-300">{cl.progressPercentage}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-400"
                        style={{ width: `${cl.progressPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Completed Courses */}
          <div className="space-y-3">
            <div className="font-bold text-white flex items-center justify-between">
              <span>Completed Courses</span>
              <span className="text-emerald-400 text-[11px]">✓ Verified</span>
            </div>

            <div className="space-y-3">
              {currentUser.learningHistory.completedCourses.map((cc) => (
                <div key={cc.id} className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                  <div className="font-semibold text-white flex items-center justify-between">
                    <span>{cc.title}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {cc.provider} • Completed {cc.completionDate}
                  </div>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {cc.skillsGained.map((sg) => (
                      <span
                        key={sg}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                      >
                        +{sg}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div className="space-y-3">
            <div className="font-bold text-white flex items-center justify-between">
              <span>Official Certifications</span>
              <span className="text-indigo-400 text-[11px]">Accredited</span>
            </div>

            <div className="space-y-3">
              {currentUser.learningHistory.certifications.map((cert) => (
                <div
                  key={cert.id}
                  className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-900/40 space-y-1"
                >
                  <div className="font-semibold text-indigo-200">{cert.name}</div>
                  <div className="text-[11px] text-indigo-400">{cert.issuer}</div>
                  <div className="text-[10px] text-slate-400">Issued: {cert.issueDate}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 10. INTERNAL OPPORTUNITIES (EMPLOYEE-MATCHED) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Internal Opportunities & Matched Gigs</h2>
              <p className="text-xs text-slate-400">
                Confidential company project initiatives, 20% innovation gigs, and cross-team roles
              </p>
            </div>
          </div>

          <span className="text-xs px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
            Internal Mobility Only
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {matchedOpportunities.map((opp) => (
            <div
              key={opp.id}
              className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-white text-sm">{opp.title}</h3>
                    <div className="text-xs text-indigo-300">{opp.team}</div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {(opp.matchScore * 100).toFixed(0)}% Match
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{opp.description}</p>

                {/* Skill Match Breakdown */}
                <div className="space-y-2 pt-1 text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-emerald-400 flex items-center space-x-1">
                      <Check className="w-3 h-3" />{' '}
                      <span>Matching Skills ({opp.matchExplanation.matchedSkills.length})</span>
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {opp.matchExplanation.matchedSkills.map((m) => (
                        <span
                          key={m}
                          className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                        >
                          ✓ {m}
                        </span>
                      ))}
                    </div>
                  </div>

                  {opp.matchExplanation.developingSkills &&
                    opp.matchExplanation.developingSkills.length > 0 && (
                      <div>
                        <span className="text-[10px] font-bold uppercase text-amber-400 flex items-center space-x-1">
                          <TrendingUp className="w-3 h-3" />{' '}
                          <span>Developing Skills ({opp.matchExplanation.developingSkills.length})</span>
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {opp.matchExplanation.developingSkills.map((d) => (
                            <span
                              key={d}
                              className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30"
                            >
                              △ {d}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  {opp.matchExplanation.missingSkills &&
                    opp.matchExplanation.missingSkills.length > 0 && (
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center space-x-1">
                          <HelpCircle className="w-3 h-3" />{' '}
                          <span>Missing Skills ({opp.matchExplanation.missingSkills.length})</span>
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {opp.matchExplanation.missingSkills.map((gap) => (
                            <span
                              key={gap}
                              className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700"
                            >
                              ○ {gap}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                </div>

                <div className="text-[11px] text-slate-300 italic bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                  {opp.matchExplanation.rationale}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <button
                  onClick={() => handleApplyOpportunity(opp)}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition shadow-md shadow-indigo-600/30 flex items-center justify-center space-x-1.5"
                >
                  <span>Express Interest</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODALS */}
      <EditProfileModal isOpen={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)} />
      <EditAboutModal isOpen={isEditAboutOpen} onClose={() => setIsEditAboutOpen(false)} />
      <AddEditSkillModal
        isOpen={isAddEditSkillOpen}
        onClose={() => setIsAddEditSkillOpen(false)}
        skillToEdit={skillToEdit}
      />
      <AddEditDevelopingSkillModal
        isOpen={isAddEditDevSkillOpen}
        onClose={() => setIsAddEditDevSkillOpen(false)}
        skillToEdit={devSkillToEdit}
      />
      <EditCurrentWorkModal
        isOpen={isEditCurrentWorkOpen}
        onClose={() => setIsEditCurrentWorkOpen(false)}
      />
      <AddEditExperienceModal
        isOpen={isAddEditExpOpen}
        onClose={() => setIsAddEditExpOpen(false)}
        experienceToEdit={expToEdit}
      />
      <AddEditProjectModal
        isOpen={isAddEditProjOpen}
        onClose={() => setIsAddEditProjOpen(false)}
        projectToEdit={projToEdit}
      />
      <ResumeIngestionModal
        isOpen={isResumeModalOpen}
        onClose={() => setIsResumeModalOpen(false)}
      />
      <RequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        defaultType="course"
      />
    </div>
  );
};
