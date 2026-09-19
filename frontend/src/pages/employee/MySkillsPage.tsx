import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const MySkillsPage: React.FC = () => {
  const { currentUser } = useApp();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'AI / Machine Learning', 'Backend & Systems', 'Frontend & UI', 'Cloud & DevOps', 'Data & Analytics'];

  const filteredSkills =
    selectedCategory === 'All'
      ? currentUser.skills
      : currentUser.skills.filter((s) => s.category === selectedCategory);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">My Skills & Competencies</h1>
          <p className="text-slate-400 text-xs mt-1">
            Verified skills, detected transferable proficiencies, and AI ontology knowledge graph signals.
          </p>
        </div>

        <button
          onClick={() => navigate('/skill-gaps')}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl transition shadow-md shadow-indigo-600/30 flex items-center space-x-1.5 self-start md:self-auto"
        >
          <span>Diagnose Skill Gaps</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition border ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSkills.map((sk) => (
          <div
            key={sk.id}
            className="p-5 rounded-3xl bg-slate-800/40 border border-slate-700/60 backdrop-blur-sm space-y-3 hover:border-indigo-500/40 transition"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-white text-sm">{sk.name}</span>
                  {sk.isVerified && (
                    <span className="flex items-center text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium">
                      <ShieldCheck className="w-3 h-3 mr-1" /> Verified
                    </span>
                  )}
                  {sk.isTransferable && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 font-medium flex items-center">
                      <Sparkles className="w-3 h-3 mr-1" /> Transferable
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  {sk.category} • <span className="text-slate-300">{sk.yearsOfExperience} years active</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-sm font-black text-indigo-300">{sk.proficiency}%</span>
                <div className="text-[10px] text-slate-400">{sk.levelLabel}</div>
              </div>
            </div>

            {/* Proficiency Bar */}
            <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  sk.proficiency >= 85
                    ? 'bg-gradient-to-r from-indigo-500 to-cyan-400'
                    : sk.proficiency >= 65
                    ? 'bg-gradient-to-r from-indigo-500 to-violet-500'
                    : 'bg-gradient-to-r from-amber-500 to-orange-400'
                }`}
                style={{ width: `${sk.proficiency}%` }}
              />
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-300">
              <span className="font-semibold text-slate-400">Evidence: </span>
              {sk.evidence}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
