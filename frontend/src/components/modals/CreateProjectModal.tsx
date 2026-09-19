import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Plus, FolderPlus, Sparkles } from 'lucide-react';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, allTeams, createProject } = useApp();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [teamId, setTeamId] = useState(currentUser.teamId || 'team-ai-ml');
  const [duration, setDuration] = useState('8 weeks (20% Gig)');
  const [startDate, setStartDate] = useState('2024-10-01');
  const [endDate, setEndDate] = useState('2024-11-30');
  const [status, setStatus] = useState<'recruiting' | 'active' | 'planning'>('recruiting');
  const [requiredSkillsInput, setRequiredSkillsInput] = useState('Python, FastAPI, pgvector');
  const [preferredSkillsInput, setPreferredSkillsInput] = useState('Docker, Kubernetes');
  const [rolesInput, setRolesInput] = useState('AI Contributor (20% Gig), Backend Engineer');
  const [openPositionsCount, setOpenPositionsCount] = useState(2);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedTeam = allTeams.find((t) => t.id === teamId) || allTeams[0];

    const requiredSkills = requiredSkillsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const preferredSkills = preferredSkillsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const availableRoles = rolesInput
      .split(',')
      .map((r) => r.trim())
      .filter(Boolean);

    createProject({
      name,
      description,
      teamId: selectedTeam.id,
      teamName: selectedTeam.name,
      teamLeaderId: currentUser.id,
      teamLeaderName: currentUser.name,
      status,
      duration,
      startDate,
      endDate,
      requiredSkills,
      preferredSkills,
      availableRoles,
      openPositionsCount,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Create New Team Project</h2>
              <p className="text-xs text-slate-400">
                Staff project using AI semantic talent discovery across company teams
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Project Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Graph-Based Cross-Team Talent Recommendation Engine"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500 placeholder-slate-500"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Description & Scope</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe deliverables, technical architecture, and cross-functional objectives..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-indigo-500 placeholder-slate-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Owning Team</label>
              <select
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                {allTeams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Initial Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="recruiting">Recruiting / Open for Talent</option>
                <option value="planning">Planning & Architecture</option>
                <option value="active">Active Execution</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Duration / Commitment</label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 8 weeks (20% Gig)"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Required Skills <span className="text-slate-500 font-normal">(Comma separated)</span>
            </label>
            <input
              type="text"
              value={requiredSkillsInput}
              onChange={(e) => setRequiredSkillsInput(e.target.value)}
              placeholder="e.g. Python, FastAPI, pgvector, Vector Search"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Preferred / Transferable Skills <span className="text-slate-500 font-normal">(Comma separated)</span>
            </label>
            <input
              type="text"
              value={preferredSkillsInput}
              onChange={(e) => setPreferredSkillsInput(e.target.value)}
              placeholder="e.g. Docker, NetworkX, Graph Theory"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Open Roles Needed <span className="text-slate-500 font-normal">(Comma separated)</span>
              </label>
              <input
                type="text"
                value={rolesInput}
                onChange={(e) => setRolesInput(e.target.value)}
                placeholder="e.g. ML Contributor, Backend Lead"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Open Positions Count</label>
              <input
                type="number"
                min={1}
                max={10}
                value={openPositionsCount}
                onChange={(e) => setOpenPositionsCount(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-900/40 text-[11px] text-indigo-300 flex items-start space-x-2">
            <Sparkles className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
            <span>
              Once created, Eagle Vision will automatically calculate semantic match percentages against all internal
              company employees to assist your talent discovery.
            </span>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition shadow-lg shadow-indigo-600/30 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Publish & Create Project</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
