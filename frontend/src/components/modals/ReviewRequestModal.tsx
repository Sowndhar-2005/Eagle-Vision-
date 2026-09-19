import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, CheckCircle2, XCircle, BookOpen, Briefcase } from 'lucide-react';
import { DevelopmentRequest } from '../../types';

interface ReviewRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: DevelopmentRequest | null;
}

export const ReviewRequestModal: React.FC<ReviewRequestModalProps> = ({ isOpen, onClose, request }) => {
  const { updateRequestStatus } = useApp();
  const [feedbackNote, setFeedbackNote] = useState('');

  if (!isOpen || !request) return null;

  const handleAction = (status: 'approved' | 'rejected') => {
    updateRequestStatus(request.id, status, feedbackNote);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
              {request.type === 'course' ? <BookOpen className="w-5 h-5" /> : <Briefcase className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Review Development Request</h2>
              <p className="text-xs text-slate-400">
                Submitted by <span className="text-indigo-300 font-semibold">{request.requesterName}</span> ({request.requesterRole})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Request Details Box */}
        <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/70 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-white text-sm">{request.targetTitle}</span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
              {request.type} Request
            </span>
          </div>

          <div>
            <div className="text-slate-400 text-[11px] font-medium">Target Skill / Role:</div>
            <div className="text-slate-200 font-semibold mt-0.5">{request.desiredRoleOrSkill}</div>
          </div>

          <div>
            <div className="text-slate-400 text-[11px] font-medium">Employee's Motivation:</div>
            <div className="text-slate-300 mt-0.5 leading-relaxed bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
              "{request.reason}"
            </div>
          </div>

          <div>
            <div className="text-slate-400 text-[11px] font-medium">Expected Benefit for Team:</div>
            <div className="text-slate-300 mt-0.5 leading-relaxed bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
              "{request.expectedBenefit}"
            </div>
          </div>
        </div>

        {/* Feedback / Reviewer Note */}
        <div className="space-y-1.5 text-xs">
          <label className="block text-slate-300 font-medium">
            Team Leader Feedback & Guidance Notes
          </label>
          <textarea
            rows={3}
            value={feedbackNote}
            onChange={(e) => setFeedbackNote(e.target.value)}
            placeholder="Add mentoring feedback, alternate course recommendations, or sprint planning guidance..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-indigo-500 placeholder-slate-500 text-xs"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={() => handleAction('rejected')}
            className="px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-semibold rounded-xl transition text-xs flex items-center space-x-2"
          >
            <XCircle className="w-4 h-4" />
            <span>Decline / Suggest Later</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-slate-400 hover:text-white transition text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleAction('approved')}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition shadow-lg shadow-emerald-600/30 text-xs flex items-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve Request</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
