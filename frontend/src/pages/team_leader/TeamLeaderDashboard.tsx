import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  FolderGit2,
  FileCheck,
  Layers,
  ChevronRight,
  Plus,
  Compass,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CreateProjectModal } from '../../components/modals/CreateProjectModal';
import { ReviewRequestModal } from '../../components/modals/ReviewRequestModal';
import { DevelopmentRequest } from '../../types';

export const TeamLeaderDashboard: React.FC = () => {
  const { currentUser, allEmployees, allProjects, requests } = useApp();
  const navigate = useNavigate();

  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<DevelopmentRequest | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Employees in this leader's team
  const teamMembers = allEmployees.filter(
    (e) => e.teamId === currentUser.teamId && e.id !== currentUser.id
  );

  // Projects owned by this team
  const teamProjects = allProjects.filter((p) => p.teamId === currentUser.teamId);

  // Pending requests from team members
  const pendingRequests = requests.filter(
    (r) => r.requesterTeamId === currentUser.teamId && r.status === 'pending'
  );

  const handleReview = (req: DevelopmentRequest) => {
    setSelectedRequest(req);
    setIsReviewModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Team Leader Welcome & Team Scope Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-violet-950/40 to-slate-900 border border-slate-700/80 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center space-x-4">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-violet-500/50 shadow-xl shadow-violet-500/20"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-black text-white">{currentUser.name}</h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/40">
                Team Leader
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="text-slate-200 font-semibold">{currentUser.teamName}</span>
              <span>•</span>
              <span>{teamMembers.length} Direct Members</span>
              <span>•</span>
              <span>{teamProjects.length} Active Team Projects</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigate('/tl/talent-discovery')}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl border border-slate-700 transition flex items-center space-x-1.5"
          >
            <Compass className="w-4 h-4 text-violet-400" />
            <span>Talent Discovery</span>
          </button>

          <button
            onClick={() => setIsCreateProjectOpen(true)}
            className="px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs rounded-xl transition shadow-lg shadow-violet-600/30 flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create Team Project</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60 backdrop-blur-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Team Members</span>
            <Users className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-2xl font-black text-white">{teamMembers.length} Engineers</div>
          <div className="text-[11px] text-emerald-400">100% Retained & Tracked</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60 backdrop-blur-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Team Projects</span>
            <FolderGit2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">{teamProjects.length} Active</div>
          <div className="text-[11px] text-indigo-300">
            {teamProjects.reduce((acc, p) => acc + p.openPositionsCount, 0)} open positions
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60 backdrop-blur-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Pending Requests</span>
            <FileCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">{pendingRequests.length} Pending</div>
          <div className="text-[11px] text-amber-400">Development reviews needed</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60 backdrop-blur-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Team Skill Matrix</span>
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">92% Coverage</div>
          <div className="text-[11px] text-slate-400">2 Critical Gaps identified</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Team Members & Active Projects */}
        <div className="lg:col-span-2 space-y-6">
          {/* Team Members Roster */}
          <div className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700/60 backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-violet-400" />
                <h2 className="text-base font-bold text-white">Team Members & Availability</h2>
              </div>
              <button
                onClick={() => navigate('/tl/team')}
                className="text-xs text-violet-400 hover:text-violet-300 font-semibold flex items-center"
              >
                <span>View Full Team</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>

            <div className="space-y-3">
              {teamMembers.map((emp) => (
                <div
                  key={emp.id}
                  className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-violet-500/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center space-x-3.5">
                    <img
                      src={emp.avatar}
                      alt={emp.name}
                      className="w-11 h-11 rounded-xl object-cover border border-violet-500/30"
                    />
                    <div>
                      <div className="font-bold text-white text-sm flex items-center space-x-2">
                        <span>{emp.name}</span>
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-normal">
                          {emp.title}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Target Goal: <span className="text-slate-200 font-medium">{emp.careerAspiration.targetRole}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 self-start sm:self-auto">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        emp.availability === '20% Gig Available'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {emp.availability}
                    </span>

                    <button
                      onClick={() => navigate('/tl/employees')}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition"
                    >
                      Inspect Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Team Projects */}
          <div className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700/60 backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FolderGit2 className="w-5 h-5 text-indigo-400" />
                <h2 className="text-base font-bold text-white">Team Projects & Open Positions</h2>
              </div>
              <button
                onClick={() => navigate('/tl/projects')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center"
              >
                <span>Manage Projects</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>

            <div className="space-y-3">
              {teamProjects.map((proj) => (
                <div
                  key={proj.id}
                  className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-white text-sm">{proj.name}</div>
                      <div className="text-xs text-slate-400">{proj.duration} • {proj.status}</div>
                    </div>
                    {proj.openPositionsCount > 0 ? (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {proj.openPositionsCount} Open Roles
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                        Fully Staffed
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {proj.requiredSkills.map((s) => (
                      <span
                        key={s}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700"
                      >
                        {s}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-xs">
                    <div className="flex items-center space-x-1.5 text-slate-400 text-[11px]">
                      <span>Members:</span>
                      <div className="flex -space-x-1.5">
                        {proj.members.map((m) => (
                          <img
                            key={m.employeeId}
                            src={m.avatar}
                            alt={m.name}
                            className="w-5 h-5 rounded-full border border-slate-900"
                          />
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => navigate('/tl/talent-discovery')}
                      className="text-xs text-violet-400 hover:underline font-semibold flex items-center space-x-1"
                    >
                      <span>Find Talent</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Pending Requests & Team Skill Shortages */}
        <div className="space-y-6">
          {/* Pending Development Requests */}
          <div className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700/60 backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileCheck className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-bold text-white">Pending Requests</h2>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                {pendingRequests.length} Action Items
              </span>
            </div>

            <div className="space-y-3">
              {pendingRequests.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs">No pending requests</div>
              ) : (
                pendingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <img
                          src={req.requesterAvatar}
                          alt={req.requesterName}
                          className="w-6 h-6 rounded-lg object-cover"
                        />
                        <span className="font-bold text-white">{req.requesterName}</span>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                        {req.type}
                      </span>
                    </div>

                    <div className="text-slate-200 font-semibold">{req.targetTitle}</div>

                    <p className="text-[11px] text-slate-400 line-clamp-2 italic">
                      "{req.reason}"
                    </p>

                    <button
                      onClick={() => handleReview(req)}
                      className="w-full py-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs rounded-xl transition shadow-md shadow-violet-600/30 flex items-center justify-center space-x-1.5"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>Review & Take Action</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Identified Team Skill Shortages */}
          <div className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700/60 backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Layers className="w-5 h-5 text-rose-400" />
                <h2 className="text-base font-bold text-white">Team Skill Deficits</h2>
              </div>
              <button
                onClick={() => navigate('/tl/team-skills')}
                className="text-xs text-violet-400 hover:underline"
              >
                Matrix
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-2xl bg-slate-900/60 border border-rose-500/20 space-y-1">
                <div className="flex items-center justify-between font-semibold text-white">
                  <span>Kubernetes & Cloud Deployments</span>
                  <span className="text-[10px] text-rose-400 font-bold">Deficit (35%)</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Critical for autonomous model registry deployments.
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900/60 border border-amber-500/20 space-y-1">
                <div className="flex items-center justify-between font-semibold text-white">
                  <span>MLOps Continuous Integration</span>
                  <span className="text-[10px] text-amber-400 font-bold">Developing (50%)</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Currently closing via Jane Doe's enrolled course.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
      />

      <ReviewRequestModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        request={selectedRequest}
      />
    </div>
  );
};
