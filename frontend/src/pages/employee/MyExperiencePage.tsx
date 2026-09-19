import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2 } from 'lucide-react';

export const MyExperiencePage: React.FC = () => {
  const { currentUser } = useApp();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Professional Experience</h1>
        <p className="text-slate-400 text-xs mt-1">
          Historical career timeline, internal roles held, project responsibilities, and technologies mastered.
        </p>
      </div>

      <div className="space-y-4">
        {currentUser.experience.map((exp) => (
          <div
            key={exp.id}
            className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700/60 backdrop-blur-sm space-y-4 relative"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-white flex items-center space-x-2">
                  <span>{exp.role}</span>
                </h2>
                <div className="text-xs text-indigo-400 font-medium mt-0.5">{exp.company}</div>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-slate-900 text-slate-300 border border-slate-800 self-start sm:self-auto font-medium">
                {exp.duration}
              </span>
            </div>

            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Core Responsibilities & Impact:
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                {exp.responsibilities.map((r, i) => (
                  <li key={i} className="flex items-start space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Technologies & Tools Used:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {exp.skillsUsed.map((tech) => (
                  <span
                    key={tech}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 border border-slate-800 font-medium"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
