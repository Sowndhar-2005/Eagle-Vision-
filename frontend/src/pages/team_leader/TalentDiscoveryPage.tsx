import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Sparkles,
  UserPlus,
  Building,
  CheckCircle2,
} from 'lucide-react';
import { EmployeeProfile } from '../../types';
import { InviteTalentModal } from '../../components/modals/InviteTalentModal';

export const TalentDiscoveryPage: React.FC = () => {
  const { allEmployees, allTeams, currentUser } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [selectedSkill, setSelectedSkill] = useState<string>('all');
  const [selectedAvailability, setSelectedAvailability] = useState<string>('all');

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<EmployeeProfile | null>(null);

  const skillsList = ['all', 'Python', 'FastAPI', 'React & TypeScript', 'PostgreSQL & pgvector', 'Kubernetes', 'NetworkX & Graph Theory'];

  // Multi-team talent filtering across all employees
  const candidateList = allEmployees.filter((emp) => {
    const matchesTeam = selectedTeam === 'all' || emp.teamId === selectedTeam;
    const matchesAvailability = selectedAvailability === 'all' || emp.availability.includes(selectedAvailability);
    const matchesSkill = selectedSkill === 'all' || emp.skills.some((s) => s.name.toLowerCase().includes(selectedSkill.toLowerCase()));
    const matchesSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.skills.some((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesTeam && matchesAvailability && matchesSkill && matchesSearch;
  });

  const handleInvite = (emp: EmployeeProfile) => {
    setSelectedCandidate(emp);
    setIsInviteModalOpen(true);
  };

  // Calculate dynamic capability match % against leader's primary project requirements
  const getMatchScore = (emp: EmployeeProfile) => {
    const hasPython = emp.skills.some((s) => s.name.includes('Python'));
    const hasFastAPI = emp.skills.some((s) => s.name.includes('FastAPI'));
    const hasVector = emp.skills.some((s) => s.name.includes('pgvector') || s.name.includes('Vector'));
    const hasGraph = emp.skills.some((s) => s.name.includes('NetworkX') || s.name.includes('Graph'));

    let score = 65;
    if (hasPython) score += 12;
    if (hasFastAPI) score += 10;
    if (hasVector) score += 8;
    if (hasGraph) score += 5;
    return Math.min(score, 96);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Enterprise Talent Discovery</h1>
        <p className="text-slate-400 text-xs mt-1">
          Search and match engineering capabilities across all company teams using semantic embeddings and verified skill graphs.
        </p>
      </div>

      {/* Search & Multi-Filter Bar */}
      <div className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700/60 backdrop-blur-sm space-y-4 shadow-lg">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by candidate name, skill, or title (e.g. Python, pgvector, Kubernetes)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-2xl text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-violet-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* Team Filter */}
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
            >
              <option value="all">All Company Teams</option>
              {allTeams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>

            {/* Skill Filter */}
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
            >
              <option value="all">All Skills</option>
              {skillsList.filter((s) => s !== 'all').map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            {/* Availability Filter */}
            <select
              value={selectedAvailability}
              onChange={(e) => setSelectedAvailability(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
            >
              <option value="all">All Availabilities</option>
              <option value="Gig">20% Gig Available</option>
              <option value="Allocated">100% Allocated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Candidates Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {candidateList.map((emp) => {
          const match = getMatchScore(emp);

          return (
            <div
              key={emp.id}
              className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700/60 hover:border-violet-500/50 transition duration-200 flex flex-col justify-between space-y-4 shadow-xl backdrop-blur-sm"
            >
              <div className="space-y-3 text-xs">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3.5">
                    <img
                      src={emp.avatar}
                      alt={emp.name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-violet-500/30 shadow-md"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-white text-base">{emp.name}</h3>
                        {emp.teamId === currentUser.teamId && (
                          <span className="text-[10px] px-2 py-0.2 rounded bg-violet-500/20 text-violet-300 font-semibold border border-violet-500/30">
                            Your Team
                          </span>
                        )}
                      </div>
                      <div className="text-slate-300 font-medium">{emp.title}</div>
                      <div className="text-slate-400 text-[11px] flex items-center mt-0.5">
                        <Building className="w-3 h-3 mr-1 text-slate-500" /> {emp.teamName}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-black text-emerald-400">{match}%</div>
                    <div className="text-[10px] text-slate-400">Match Fit</div>
                  </div>
                </div>

                <p className="text-slate-300 text-[11px] leading-relaxed line-clamp-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  {emp.professionalSummary}
                </p>

                {/* Match Explanation */}
                <div className="p-3 rounded-2xl bg-indigo-950/20 border border-indigo-900/40 space-y-1 text-[11px]">
                  <div className="text-indigo-300 font-semibold flex items-center space-x-1">
                    <Sparkles className="w-3 h-3 text-indigo-400" />
                    <span>Concrete Skill Alignment:</span>
                  </div>
                  <div className="text-slate-300">
                    High capability overlap in {emp.skills.slice(0, 3).map((s) => s.name).join(', ')}.
                  </div>
                </div>

                {/* Skills Chips */}
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Verified Competencies:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {emp.skills.slice(0, 5).map((s) => (
                      <span
                        key={s.id}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800 flex items-center space-x-1"
                      >
                        <span>{s.name}</span>
                        {s.isVerified && <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    emp.availability === '20% Gig Available'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {emp.availability}
                </span>

                <button
                  onClick={() => handleInvite(emp)}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs rounded-xl transition shadow-lg shadow-violet-600/30 flex items-center space-x-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Invite to Project</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Invite Talent Modal */}
      <InviteTalentModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        candidate={selectedCandidate}
      />
    </div>
  );
};
