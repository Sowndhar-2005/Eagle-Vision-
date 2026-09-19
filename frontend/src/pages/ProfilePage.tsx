import React from 'react';
import { Mail, MapPin, Briefcase, Award, CheckCircle } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-indigo-500/20">
            JD
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Jane Doe</h1>
            <div className="text-xs text-slate-400 mt-1 flex flex-wrap gap-x-4 gap-y-1">
              <span className="flex items-center"><Briefcase className="w-3.5 h-3.5 mr-1 text-slate-400" /> Senior Full-Stack Engineer</span>
              <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" /> New York, NY (Open to Remote)</span>
              <span className="flex items-center"><Mail className="w-3.5 h-3.5 mr-1 text-slate-400" /> jane.doe@company.internal</span>
            </div>
          </div>
        </div>

        <button className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition self-start md:self-center shadow-md shadow-indigo-600/30">
          Edit Mobility Preferences
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Skills Section */}
        <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Verified & Detected Skills</h2>
            <Award className="w-4 h-4 text-indigo-400" />
          </div>

          <div className="space-y-2">
            {[
              { name: 'Python / FastAPI', level: 'Level 5 (Expert)', verified: true },
              { name: 'PostgreSQL & pgvector', level: 'Level 4 (Advanced)', verified: true },
              { name: 'React / TypeScript', level: 'Level 4 (Advanced)', verified: true },
              { name: 'Kubernetes & Docker', level: 'Level 3 (Intermediate)', verified: true },
              { name: 'Prompt Engineering & LLM APIs', level: 'Level 3 (Intermediate)', verified: false, isTransferable: true },
            ].map((s, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white flex items-center">
                    {s.name}
                    {s.verified && <CheckCircle className="w-3.5 h-3.5 ml-1 text-emerald-400" />}
                    {s.isTransferable && (
                      <span className="ml-1.5 text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        Transferable
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{s.level}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobility Preferences */}
        <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50 space-y-4">
          <h2 className="text-base font-semibold text-white">Career Mobility Settings</h2>
          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-medium text-white">Open to Internal Gigs & Sprints</div>
                <div className="text-slate-400 text-[11px]">Allow managers to recommend 10-20% time projects</div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold text-[11px]">Enabled</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-medium text-white">Open to Role Transfers</div>
                <div className="text-slate-400 text-[11px]">Receive confidential recommendations for open internal positions</div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold text-[11px]">Enabled</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-medium text-white">Mentorship Participation</div>
                <div className="text-slate-400 text-[11px]">Available to mentor junior talent in Distributed Systems</div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 font-semibold text-[11px]">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
