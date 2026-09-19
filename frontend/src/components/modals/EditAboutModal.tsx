import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Sparkles } from 'lucide-react';

interface EditAboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditAboutModal: React.FC<EditAboutModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateSummary } = useApp();
  const [summary, setSummary] = useState(currentUser.professionalSummary);

  useEffect(() => {
    setSummary(currentUser.professionalSummary);
  }, [currentUser.professionalSummary, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSummary(summary);
    onClose();
  };

  const handleApplyTemplate = () => {
    const template = `${currentUser.title} working on intelligent talent systems, semantic matching, RAG pipelines, and full-stack applications. Currently developing expertise in MLOps, model deployment, and distributed AI infrastructure.`;
    setSummary(template);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-violet-500/20 border border-violet-500/30 text-violet-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Edit About / Professional Summary</h3>
              <p className="text-xs text-slate-400">Describe your role, core focus, technical depth, and development direction</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">Professional Summary</label>
              <button
                type="button"
                onClick={handleApplyTemplate}
                className="text-[11px] text-violet-400 hover:text-violet-300 font-medium"
              >
                Insert Sample Summary
              </button>
            </div>
            <textarea
              rows={6}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Describe your current role, professional background, main technical areas, career interests, and current development direction..."
              required
              className="w-full px-3.5 py-3 bg-slate-800/80 border border-slate-700/80 rounded-2xl text-white text-xs leading-relaxed focus:outline-none focus:border-violet-500 resize-none"
            />
            <p className="text-[11px] text-slate-500 mt-1.5">
              Tip: Eagle Vision's AI capability analyzer uses this summary to correlate your skills, project competencies, and internal opportunity matches.
            </p>
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold transition shadow-md shadow-violet-600/30"
            >
              Save Summary
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
