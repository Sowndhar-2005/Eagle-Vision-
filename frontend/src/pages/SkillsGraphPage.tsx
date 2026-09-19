import React from 'react';
import { Network, Filter } from 'lucide-react';

export const SkillsGraphPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Skills & Knowledge Graph</h1>
          <p className="text-slate-400 text-sm mt-1">
            Visualizing direct, adjacent, and hidden transferable skills across your organization.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 font-medium transition">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter Graph</span>
          </button>
        </div>
      </div>

      <div className="h-[520px] rounded-2xl bg-slate-950/80 border border-slate-800 relative flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#312e81_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
        
        <div className="relative z-10 text-center space-y-3 max-w-md p-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto">
            <Network className="w-6 h-6 animate-pulse" />
          </div>
          <h3 className="text-lg font-semibold text-white">Interactive Graph Canvas</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Skills Graph node layout displays clusters for Backend, AI/ML, Cloud Infrastructure, and Soft Skills. 
            Edges represent semantic similarity & skill transferability calculated by Gemini embeddings.
          </p>
          <div className="pt-2 flex justify-center space-x-2">
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">Verified Skill</span>
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/30">Transferable Skill</span>
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">Adjacent Gap</span>
          </div>
        </div>
      </div>
    </div>
  );
};
