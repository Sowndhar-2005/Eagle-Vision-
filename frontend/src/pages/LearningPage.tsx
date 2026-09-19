import React from 'react';
import { CheckCircle2, Clock } from 'lucide-react';

export const LearningPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">AI Upskilling & Learning Roadmaps</h1>
        <p className="text-slate-400 text-sm mt-1">
          Dynamic milestone paths designed to close targeted skill gaps for your desired career trajectory.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              Active Roadmap
            </span>
            <h2 className="text-lg font-semibold text-white mt-2">Target Goal: Staff AI Systems Architect</h2>
          </div>
          <div className="text-xs text-slate-400">Estimated Duration: <span className="text-white font-medium">8 Weeks</span></div>
        </div>

        {/* Milestone Steps */}
        <div className="space-y-3 pt-2">
          {[
            {
              step: '01',
              title: 'Vector Databases & Semantic Embeddings at Scale',
              status: 'completed',
              duration: '2 weeks',
              details: 'PostgreSQL pgvector indexing, HNSW vs IVFFlat parameter tuning.',
            },
            {
              step: '02',
              title: 'Agentic AI Workflows & Multi-Turn RAG',
              status: 'in_progress',
              duration: '3 weeks',
              details: 'Google GenAI SDK, function calling, and context window orchestration.',
            },
            {
              step: '03',
              title: 'Enterprise High-Concurrency Microservices Architecture',
              status: 'upcoming',
              duration: '3 weeks',
              details: 'Asynchronous event buses, Redis pub/sub, distributed caching strategies.',
            },
          ].map((m, i) => (
            <div
              key={i}
              className={`p-4 rounded-xl border flex items-start space-x-4 transition ${
                m.status === 'completed'
                  ? 'bg-slate-900/40 border-slate-800 opacity-80'
                  : m.status === 'in_progress'
                  ? 'bg-indigo-950/20 border-indigo-500/40'
                  : 'bg-slate-900/20 border-slate-800/60'
              }`}
            >
              <div className="pt-0.5">
                {m.status === 'completed' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : m.status === 'in_progress' ? (
                  <Clock className="w-5 h-5 text-indigo-400 animate-pulse" />
                ) : (
                  <div className="w-5 h-5 rounded-full border border-slate-600 flex items-center justify-center text-[10px] text-slate-400">
                    {m.step}
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-white">{m.title}</div>
                  <span className="text-xs text-slate-400">{m.duration}</span>
                </div>
                <p className="text-xs text-slate-300">{m.details}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
