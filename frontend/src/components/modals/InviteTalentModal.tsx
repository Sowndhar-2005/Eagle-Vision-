import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, UserPlus, Sparkles } from 'lucide-react';
import { EmployeeProfile } from '../../types';

interface InviteTalentModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: EmployeeProfile | null;
}

export const InviteTalentModal: React.FC<InviteTalentModalProps> = ({ isOpen, onClose, candidate }) => {
  const { allProjects, addTeamMember, currentUser } = useApp();
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [assignedRole, setAssignedRole] = useState('Project Contributor (20% Gig)');
  const [allocation, setAllocation] = useState('20% Gig Allocation');

  if (!isOpen || !candidate) return null;

  // Projects managed by this Team Leader or team
  const eligibleProjects = allProjects.filter(
    (p) => p.teamId === currentUser.teamId || p.teamLeaderId === currentUser.id
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) return;

    addTeamMember(selectedProjectId, candidate.id, assignedRole, allocation);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Invite Talent to Project</h2>
              <p className="text-xs text-slate-400">
                Staffing candidate: <span className="text-indigo-300 font-semibold">{candidate.name}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Candidate Mini Card */}
        <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700 flex items-center space-x-3">
          <img src={candidate.avatar} alt={candidate.name} className="w-12 h-12 rounded-xl object-cover border border-indigo-500/30" />
          <div className="text-xs">
            <div className="font-bold text-white text-sm">{candidate.name}</div>
            <div className="text-slate-400">{candidate.title} • {candidate.teamName}</div>
            <div className="text-emerald-400 font-medium mt-0.5">{candidate.availability}</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">Select Team Project</label>
            <select
              value={selectedProjectId}
              onChange={(e) => {
                setSelectedProjectId(e.target.value);
                const proj = allProjects.find((p) => p.id === e.target.value);
                if (proj && proj.availableRoles.length > 0) {
                  setAssignedRole(proj.availableRoles[0]);
                }
              }}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
              required
            >
              <option value="">-- Choose a project --</option>
              {eligibleProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.openPositionsCount} open positions)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1.5">Assigned Role</label>
            <input
              type="text"
              value={assignedRole}
              onChange={(e) => setAssignedRole(e.target.value)}
              placeholder="e.g. Lead AI Specialist / ML Contributor"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1.5">Sprint Capacity Allocation</label>
            <select
              value={allocation}
              onChange={(e) => setAllocation(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              <option value="20% Gig Allocation">20% Gig Allocation (1 day/week)</option>
              <option value="50% Shared Allocation">50% Shared Allocation</option>
              <option value="100% Full Project Member">100% Full Project Member</option>
              <option value="10% Advisory & Mentorship">10% Advisory & Mentorship</option>
            </select>
          </div>

          <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-900/40 text-[11px] text-indigo-300 flex items-start space-x-2">
            <Sparkles className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
            <span>
              Inviting talent will notify the employee and adjust team availability accordingly in Eagle Vision.
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
              disabled={!selectedProjectId}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl transition shadow-lg shadow-indigo-600/30 flex items-center space-x-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Assign to Project</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
