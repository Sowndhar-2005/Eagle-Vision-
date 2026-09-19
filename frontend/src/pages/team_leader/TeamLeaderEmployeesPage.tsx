import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Award,
  Sparkles,
  CheckCircle2,
  Target,
} from 'lucide-react';

export const TeamLeaderEmployeesPage: React.FC = () => {
  const { allEmployees, currentUser } = useApp();

  // Team members under this leader
  const teamMembers = allEmployees.filter(
    (e) => e.teamId === currentUser.teamId && e.id !== currentUser.id
  );

  const [selectedEmpId, setSelectedEmpId] = useState<string>(
    teamMembers[0]?.id || 'emp-growth-jane'
  );

  const selectedEmployee =
    allEmployees.find((e) => e.id === selectedEmpId) || teamMembers[0] || allEmployees[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Team Employee Capabilities</h1>
        <p className="text-slate-400 text-xs mt-1">
          Review detailed employee capability profiles, verified skills, learning history, and development goals for your team members.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Member Selector Sidebar */}
        <div className="space-y-3">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
            Team Members ({teamMembers.length})
          </div>

          <div className="space-y-2">
            {teamMembers.map((emp) => (
              <div
                key={emp.id}
                onClick={() => setSelectedEmpId(emp.id)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center space-x-3 text-xs ${
                  selectedEmpId === emp.id
                    ? 'bg-violet-600/20 border-violet-500/50 shadow-md'
                    : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800'
                }`}
              >
                <img
                  src={emp.avatar}
                  alt={emp.name}
                  className="w-10 h-10 rounded-xl object-cover border border-violet-500/30"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white truncate">{emp.name}</div>
                  <div className="text-[11px] text-slate-400 truncate">{emp.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 3 Cols: Detailed Read-Only Profile View for Leader */}
        <div className="lg:col-span-3 space-y-6">
          {/* Header Card */}
          <div className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700/60 backdrop-blur-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <img
                src={selectedEmployee.avatar}
                alt={selectedEmployee.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-violet-500/50"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-black text-white">{selectedEmployee.name}</h2>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 font-medium">
                    ID: {selectedEmployee.employeeId}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-1 flex flex-wrap gap-x-3">
                  <span>{selectedEmployee.title}</span>
                  <span>•</span>
                  <span>{selectedEmployee.teamName}</span>
                  <span>•</span>
                  <span>Joined {selectedEmployee.joiningDate}</span>
                </div>
              </div>
            </div>

            <span
              className={`text-xs font-bold px-3 py-1 rounded-full self-start sm:self-auto ${
                selectedEmployee.availability === '20% Gig Available'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-300 border border-slate-700'
              }`}
            >
              {selectedEmployee.availability}
            </span>
          </div>

          {/* AI Capability Summary */}
          <div className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700/60 backdrop-blur-sm space-y-2">
            <div className="flex items-center space-x-2 text-violet-300 font-bold text-xs">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span>AI Capability Summary</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
              {selectedEmployee.professionalSummary}
            </p>
          </div>

          {/* Skills Grid */}
          <div className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700/60 backdrop-blur-sm space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Award className="w-4 h-4 text-violet-400" />
              <span>Verified Competencies & Evidence</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {selectedEmployee.skills.map((s) => (
                <div key={s.id} className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between font-semibold text-white">
                    <span className="flex items-center space-x-1.5">
                      <span>{s.name}</span>
                      {s.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    </span>
                    <span className="text-indigo-400 text-[11px]">{s.levelLabel} ({s.proficiency}%)</span>
                  </div>
                  <div className="text-[11px] text-slate-400">{s.yearsOfExperience} yrs • {s.category}</div>
                  <div className="text-[10px] text-slate-300 italic pt-0.5">"{s.evidence}"</div>
                </div>
              ))}
            </div>
          </div>

          {/* Development Goals & Skill Gaps */}
          <div className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700/60 backdrop-blur-sm space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Target className="w-4 h-4 text-amber-400" />
              <span>Development Goals & Target Readiness</span>
            </h3>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-[11px]">Career Aspiration:</span>
                  <div className="font-bold text-white text-sm mt-0.5">
                    {selectedEmployee.careerAspiration.targetRole}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-slate-400 text-[11px]">Readiness Score</div>
                  <div className="font-black text-amber-400 text-sm">
                    {selectedEmployee.careerAspiration.readinessScore}%
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Missing Competencies to Support:
                  </div>
                  <div className="space-y-1">
                    {selectedEmployee.careerAspiration.missingSkills.map((sk) => (
                      <span
                        key={sk}
                        className="inline-block mr-1 mb-1 text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-medium"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Developing in Progress:
                  </div>
                  <div className="space-y-1">
                    {selectedEmployee.careerAspiration.developingSkills.map((sk) => (
                      <span
                        key={sk}
                        className="inline-block mr-1 mb-1 text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-medium"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
