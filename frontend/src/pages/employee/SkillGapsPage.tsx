import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  BookOpen,
  Briefcase,
  ArrowRight,
} from 'lucide-react';
import { RequestModal } from '../../components/modals/RequestModal';

export const SkillGapsPage: React.FC = () => {
  const { currentUser } = useApp();
  const [targetRole, setTargetRole] = useState(currentUser.careerAspiration.targetRole);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'course' | 'project'>('course');
  const [modalTargetTitle, setModalTargetTitle] = useState('');
  const [modalTargetSkill, setModalTargetSkill] = useState('');

  const targetRoles = [
    'Staff ML Infrastructure Engineer',
    'Senior AI / Full-Stack Engineer',
    'Mid-Level AI / ML Engineer',
    'Principal Cloud & Distributed Architect',
  ];

  const handleRequestItem = (type: 'course' | 'project', title: string, skill: string) => {
    setModalType(type);
    setModalTargetTitle(title);
    setModalTargetSkill(skill);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">AI Skill Gap & Career Pathway Diagnostic</h1>
        <p className="text-slate-400 text-xs mt-1">
          Select your target milestone role to evaluate current competencies, detect skill deficits, and generate an actionable learning & project roadmap.
        </p>
      </div>

      {/* Target Selector Card */}
      <div className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700/60 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1">
          <div className="text-xs text-slate-400">Current Role:</div>
          <div className="text-lg font-bold text-white">{currentUser.title}</div>
          <div className="text-xs text-indigo-400">{currentUser.teamName}</div>
        </div>

        <div className="flex items-center space-x-3">
          <ArrowRight className="w-5 h-5 text-indigo-400 hidden md:block" />
          <div>
            <label className="block text-xs text-slate-400 mb-1">Select Aspirating Target Role:</label>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-indigo-500 shadow-md"
            >
              {targetRoles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Competency Gap Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Strong Skills */}
        <div className="p-6 rounded-3xl bg-slate-800/40 border border-emerald-500/20 backdrop-blur-sm space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>Strong Competencies</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
              ✓ Verified
            </span>
          </div>

          <div className="space-y-2">
            {currentUser.careerAspiration.strongSkills.map((sk) => (
              <div
                key={sk}
                className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
              >
                <span className="font-semibold text-white">{sk}</span>
                <span className="text-emerald-400 font-bold text-xs">✓ Strong</span>
              </div>
            ))}
          </div>
        </div>

        {/* Developing Skills */}
        <div className="p-6 rounded-3xl bg-slate-800/40 border border-amber-500/20 backdrop-blur-sm space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>Developing Skills</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
              ⚠ In Progress
            </span>
          </div>

          <div className="space-y-2">
            {currentUser.careerAspiration.developingSkills.map((sk) => (
              <div
                key={sk}
                className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
              >
                <span className="font-semibold text-white">{sk}</span>
                <span className="text-amber-400 font-bold text-xs">⚠ Developing</span>
              </div>
            ))}
          </div>
        </div>

        {/* Missing Skills */}
        <div className="p-6 rounded-3xl bg-slate-800/40 border border-rose-500/20 backdrop-blur-sm space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2 text-rose-400 font-bold text-sm">
              <XCircle className="w-4 h-4" />
              <span>Critical Deficit Gaps</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold">
              ✕ Missing
            </span>
          </div>

          <div className="space-y-2">
            {currentUser.careerAspiration.missingSkills.map((sk) => (
              <div
                key={sk}
                className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
              >
                <span className="font-semibold text-white">{sk}</span>
                <span className="text-rose-400 font-bold text-xs">✕ Missing</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommended Upskilling Pathway for Target Role */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-800/40 border border-slate-700/60 backdrop-blur-sm space-y-6 shadow-xl">
        <div className="flex items-center space-x-2 text-white font-bold text-base">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <span>Recommended AI Upskilling & Project Milestone Roadmap</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Step 1: Recommended Course */}
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3 flex flex-col justify-between">
            <div className="space-y-2 text-xs">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30 uppercase">
                Recommended Course
              </span>
              <h3 className="text-sm font-bold text-white">Production MLOps: Continuous Integration & Model Delivery</h3>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Closes the developing MLOps capability by mastering automated pipeline verification and registry rollouts.
              </p>
            </div>

            <button
              onClick={() =>
                handleRequestItem(
                  'course',
                  'Production MLOps: Continuous Integration & Model Delivery',
                  'MLOps & Model Deployment'
                )
              }
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl transition shadow-md shadow-indigo-600/30 flex items-center justify-center space-x-2"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Request Course Approval</span>
            </button>
          </div>

          {/* Step 2: Recommended Project */}
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3 flex flex-col justify-between">
            <div className="space-y-2 text-xs">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                Recommended Internal Gig
              </span>
              <h3 className="text-sm font-bold text-white">Cross-Functional Talent Matching ML Gig (20% Time)</h3>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Gain hands-on experience in graph-based recommendation systems with direct mentorship from Sarah Jenkins.
              </p>
            </div>

            <button
              onClick={() =>
                handleRequestItem(
                  'project',
                  'Cross-Functional Talent Matching ML Gig',
                  'Graph ML Contributor'
                )
              }
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition shadow-md shadow-emerald-600/30 flex items-center justify-center space-x-2"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Request Project Participation</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Request Modal */}
      <RequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultType={modalType}
        targetTitle={modalTargetTitle}
        targetSkillOrRole={modalTargetSkill}
      />
    </div>
  );
};
