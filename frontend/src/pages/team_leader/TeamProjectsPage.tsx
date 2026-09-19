import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Plus,
  Users,
  Compass,
  UserPlus,
  Trash2,
} from 'lucide-react';
import { CreateProjectModal } from '../../components/modals/CreateProjectModal';
import { useNavigate } from 'react-router-dom';

export const TeamProjectsPage: React.FC = () => {
  const { allProjects, currentUser, removeTeamMember } = useApp();
  const navigate = useNavigate();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Projects managed by this Team Leader or team
  const myTeamProjects = allProjects.filter(
    (p) => p.teamId === currentUser.teamId || p.teamLeaderId === currentUser.id
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Team Projects & Resource Staffing</h1>
          <p className="text-slate-400 text-xs mt-1">
            Manage projects for <span className="text-violet-300 font-semibold">{currentUser.teamName}</span>, define required competencies, and assign internal talent.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/tl/talent-discovery')}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl border border-slate-700 transition flex items-center space-x-1.5"
          >
            <Compass className="w-4 h-4 text-violet-400" />
            <span>Discover Talent</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs rounded-xl transition shadow-lg shadow-violet-600/30 flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {myTeamProjects.map((proj) => (
          <div
            key={proj.id}
            className="p-6 sm:p-8 rounded-3xl bg-slate-800/40 border border-slate-700/60 backdrop-blur-sm space-y-5 shadow-xl"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center space-x-3">
                  <h2 className="text-lg font-bold text-white">{proj.name}</h2>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      proj.status === 'active'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : proj.status === 'recruiting'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {proj.status}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-1 flex items-center space-x-3">
                  <span>{proj.teamName}</span>
                  <span>•</span>
                  <span>Duration: {proj.duration}</span>
                  <span>•</span>
                  <span>
                    {proj.startDate} – {proj.endDate}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigate('/tl/talent-discovery')}
                  className="px-3.5 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 font-semibold text-xs rounded-xl border border-indigo-500/30 transition flex items-center space-x-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Staff / Invite Talent</span>
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{proj.description}</p>

            {/* Required & Preferred Skills */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Required Competencies:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {proj.requiredSkills.map((s) => (
                    <span
                      key={s}
                      className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Preferred / Adjacency Skills:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {proj.preferredSkills.map((s) => (
                    <span
                      key={s}
                      className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700/80 font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Assigned Project Members */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-white flex items-center space-x-2">
                  <Users className="w-4 h-4 text-violet-400" />
                  <span>Current Project Members ({proj.members.length})</span>
                </div>
                <span className="text-xs text-amber-400 font-semibold">
                  {proj.openPositionsCount} Open Positions Remaining
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {proj.members.map((member) => (
                  <div
                    key={member.employeeId}
                    className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-10 h-10 rounded-xl object-cover border border-violet-500/30"
                      />
                      <div>
                        <div className="font-bold text-white">{member.name}</div>
                        <div className="text-[11px] text-slate-400">{member.role}</div>
                        <div className="text-[10px] text-emerald-400 font-medium">{member.allocation}</div>
                      </div>
                    </div>

                    {member.employeeId !== currentUser.id && (
                      <button
                        onClick={() => removeTeamMember(proj.id, member.employeeId)}
                        title="Remove member"
                        className="p-1.5 text-slate-500 hover:text-rose-400 transition rounded-lg hover:bg-rose-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};
