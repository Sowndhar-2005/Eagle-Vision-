import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { CurrentWorkDetail } from '../../types';
import { X, Activity } from 'lucide-react';

interface EditCurrentWorkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditCurrentWorkModal: React.FC<EditCurrentWorkModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateCurrentWork } = useApp();
  const cw = currentUser.currentWork;

  const [projectName, setProjectName] = useState(cw.projectName);
  const [role, setRole] = useState(cw.role);
  const [team, setTeam] = useState(cw.team);
  const [sprintPeriod, setSprintPeriod] = useState(cw.sprintPeriod);
  const [status, setStatus] = useState(cw.status);
  const [responsibilitiesText, setResponsibilitiesText] = useState(cw.responsibilities.join('\n'));
  const [tasksText, setTasksText] = useState(cw.currentTasks.join('\n'));
  const [skillsUsedText, setSkillsUsedText] = useState(cw.skillsBeingUsed.join(', '));
  const [skillsDevelopingText, setSkillsDevelopingText] = useState(cw.skillsCurrentlyDeveloping.join(', '));
  const [blockers, setBlockers] = useState(cw.blockers || '');

  useEffect(() => {
    if (currentUser.currentWork) {
      const c = currentUser.currentWork;
      setProjectName(c.projectName);
      setRole(c.role);
      setTeam(c.team);
      setSprintPeriod(c.sprintPeriod);
      setStatus(c.status);
      setResponsibilitiesText(c.responsibilities.join('\n'));
      setTasksText(c.currentTasks.join('\n'));
      setSkillsUsedText(c.skillsBeingUsed.join(', '));
      setSkillsDevelopingText(c.skillsCurrentlyDeveloping.join(', '));
      setBlockers(c.blockers || '');
    }
  }, [currentUser.currentWork, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const responsibilities = responsibilitiesText
      .split('\n')
      .map((r) => r.trim().replace(/^[-•*]\s*/, ''))
      .filter(Boolean);

    const currentTasks = tasksText
      .split('\n')
      .map((t) => t.trim().replace(/^[-•*]\s*/, ''))
      .filter(Boolean);

    const skillsBeingUsed = skillsUsedText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const skillsCurrentlyDeveloping = skillsDevelopingText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const updatedCurrentWork: CurrentWorkDetail = {
      projectName: projectName.trim(),
      role: role.trim(),
      team: team.trim(),
      teamLeaderName: currentUser.teamLeaderName,
      sprintPeriod: sprintPeriod.trim(),
      status: status.trim(),
      responsibilities: responsibilities.length > 0 ? responsibilities : ['Core system development and delivery'],
      currentTasks: currentTasks.length > 0 ? currentTasks : ['Active sprint delivery items'],
      skillsBeingUsed: skillsBeingUsed.length > 0 ? skillsBeingUsed : ['Python', 'TypeScript', 'Git'],
      skillsCurrentlyDeveloping: skillsCurrentlyDeveloping.length > 0 ? skillsCurrentlyDeveloping : ['MLOps'],
      blockers: blockers.trim() || undefined,
    };

    updateCurrentWork(updatedCurrentWork);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Update Current Work</h3>
              <p className="text-xs text-slate-400">Maintain live sprint assignments, responsibilities, and tasks</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Current Project Name</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Current Role</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Sprint / Work Period</label>
              <input
                type="text"
                value={sprintPeriod}
                onChange={(e) => setSprintPeriod(e.target.value)}
                placeholder="e.g. Sprint 14 (Q1 2025)"
                required
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Status</label>
              <input
                type="text"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                placeholder="e.g. Active Sprint Execution"
                required
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Current Responsibilities (One item per line)
            </label>
            <textarea
              rows={3}
              value={responsibilitiesText}
              onChange={(e) => setResponsibilitiesText(e.target.value)}
              placeholder="Skill extraction pipeline&#10;Resume ingestion&#10;Semantic matching&#10;RAG recommendation engine"
              required
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white text-xs leading-relaxed focus:outline-none focus:border-cyan-500 resize-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Active Sprint Tasks (One item per line)
            </label>
            <textarea
              rows={3}
              value={tasksText}
              onChange={(e) => setTasksText(e.target.value)}
              placeholder="Implement Redis cache for text-embedding-004 vectors&#10;Refine structured prompt schema for Gemini 2.5 Flash&#10;Collaborate with Cloud Team on staging namespace"
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white text-xs leading-relaxed focus:outline-none focus:border-cyan-500 resize-none font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Skills Being Used (comma-separated)
              </label>
              <input
                type="text"
                value={skillsUsedText}
                onChange={(e) => setSkillsUsedText(e.target.value)}
                placeholder="Python, FastAPI, React, PostgreSQL, Gemini SDK"
                required
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Skills Currently Developing (comma-separated)
              </label>
              <input
                type="text"
                value={skillsDevelopingText}
                onChange={(e) => setSkillsDevelopingText(e.target.value)}
                placeholder="MLOps, Kubernetes, Distributed Model Serving"
                required
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Blockers / Dependencies (Optional)
            </label>
            <input
              type="text"
              value={blockers}
              onChange={(e) => setBlockers(e.target.value)}
              placeholder="e.g. Awaiting cloud team provisioning of staging Kubernetes namespace."
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold transition shadow-md shadow-cyan-600/30"
            >
              Save Current Work
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
