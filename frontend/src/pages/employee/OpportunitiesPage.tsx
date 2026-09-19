import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  MapPin,
  Building,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { RequestModal } from '../../components/modals/RequestModal';

export const OpportunitiesPage: React.FC = () => {
  const { allOpportunities } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'role' | 'gig' | 'project' | 'mentorship'>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOpp, setSelectedOpp] = useState<any>(null);

  const filteredOpportunities = allOpportunities.filter((opp) => {
    const matchesType = filterType === 'all' || opp.type === filterType;
    const matchesSearch =
      opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.team.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.requiredSkills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const handleApply = (opp: any) => {
    setSelectedOpp(opp);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Internal Opportunity Marketplace</h1>
        <p className="text-slate-400 text-xs mt-1">
          Explore cross-team gigs, open internal roles, project shadowing, and mentorship matched by AI embeddings.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search roles, internal gigs, teams, or skills (e.g. Python, Kubernetes)..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800/60 border border-slate-700/60 rounded-2xl text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'all', label: 'All Opportunities' },
            { id: 'gig', label: '20% Gigs' },
            { id: 'role', label: 'Permanent Roles' },
            { id: 'project', label: 'Projects' },
            { id: 'mentorship', label: 'Mentorship' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setFilterType(t.id as any)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-xl capitalize transition border ${
                filterType === t.id
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                  : 'bg-slate-800/70 text-slate-300 border-slate-700/60 hover:bg-slate-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Opportunities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredOpportunities.map((opp) => (
          <div
            key={opp.id}
            className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700/60 hover:border-indigo-500/50 transition duration-200 flex flex-col justify-between space-y-4 shadow-lg backdrop-blur-sm"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {opp.type} • {opp.duration}
                  </span>
                  <h3 className="text-base font-bold text-white mt-2">{opp.title}</h3>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-base font-black text-emerald-400">{opp.matchScore}%</div>
                  <div className="text-[10px] text-slate-400 font-medium">Match Fit</div>
                </div>
              </div>

              <div className="flex items-center space-x-4 text-xs text-slate-400">
                <span className="flex items-center text-slate-300">
                  <Building className="w-3.5 h-3.5 mr-1 text-slate-500" /> {opp.team}
                </span>
                <span className="flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-slate-500" /> {opp.location}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{opp.description}</p>

              {/* Explainable Match Box */}
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-indigo-900/40 space-y-2 text-xs">
                <div className="flex items-center space-x-1.5 text-indigo-300 font-bold text-[11px]">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Why This Matches You:</span>
                </div>

                <div className="space-y-1">
                  <div className="text-[11px] text-slate-300">
                    <span className="text-emerald-400 font-semibold">Matched Skills: </span>
                    {opp.matchExplanation.matchedSkills.join(', ')}
                  </div>

                  {opp.matchExplanation.missingSkills.length > 0 && (
                    <div className="text-[11px] text-slate-300">
                      <span className="text-amber-400 font-semibold">Skill Gap to Ramp: </span>
                      {opp.matchExplanation.missingSkills.join(', ')}
                    </div>
                  )}

                  <div className="text-[10px] text-slate-400 italic pt-0.5">
                    "{opp.matchExplanation.rationale}"
                  </div>
                </div>
              </div>

              {/* Required Skills Chips */}
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Required Competencies:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {opp.requiredSkills.map((s) => (
                    <span
                      key={s}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => handleApply(opp)}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl transition shadow-md shadow-indigo-600/30 flex items-center justify-center space-x-2"
            >
              <span>Request to Join / Express Interest</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Interactive Modal */}
      {selectedOpp && (
        <RequestModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          defaultType="project"
          targetId={selectedOpp.id}
          targetTitle={selectedOpp.title}
          targetSkillOrRole={selectedOpp.requiredSkills[0]}
        />
      )}
    </div>
  );
};
