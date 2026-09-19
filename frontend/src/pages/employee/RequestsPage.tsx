import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Inbox,
  Plus,
  BookOpen,
  Briefcase,
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
} from 'lucide-react';
import { RequestModal } from '../../components/modals/RequestModal';

export const RequestsPage: React.FC = () => {
  const { requests, currentUser } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Requests by this employee
  const myRequests = requests.filter((r) => r.requesterId === currentUser.id);

  const filteredRequests =
    filterStatus === 'all'
      ? myRequests
      : myRequests.filter((r) => r.status === filterStatus);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Development & Project Requests</h1>
          <p className="text-slate-400 text-xs mt-1">
            Track submitted course enrollment and internal project participation requests reviewed by your Team Leader.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl transition shadow-lg shadow-indigo-600/30 flex items-center space-x-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Development Request</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition border ${
              filterStatus === s
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {s === 'all' ? 'All Requests' : `${s} (${myRequests.filter((r) => r.status === s).length})`}
          </button>
        ))}
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="p-12 text-center bg-slate-800/20 border border-slate-800 rounded-3xl space-y-3">
            <Inbox className="w-10 h-10 text-slate-500 mx-auto" />
            <div className="text-sm font-semibold text-white">No requests found</div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Submit a course or project request to your Team Leader to kickstart your next career growth milestone.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl transition inline-flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Submit Request</span>
            </button>
          </div>
        ) : (
          filteredRequests.map((req) => (
            <div
              key={req.id}
              className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700/60 backdrop-blur-sm space-y-4 shadow-md"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-2.5 rounded-xl border ${
                      req.type === 'course'
                        ? 'bg-violet-600/20 text-violet-400 border-violet-500/30'
                        : 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30'
                    }`}
                  >
                    {req.type === 'course' ? <BookOpen className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{req.targetTitle}</h3>
                    <div className="text-[11px] text-slate-400">
                      Target Competency: <span className="text-slate-200 font-semibold">{req.desiredRoleOrSkill}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-start sm:self-auto">
                  <span
                    className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center space-x-1.5 ${
                      req.status === 'approved'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : req.status === 'rejected'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {req.status === 'approved' ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : req.status === 'rejected' ? (
                      <XCircle className="w-3.5 h-3.5" />
                    ) : (
                      <Clock className="w-3.5 h-3.5" />
                    )}
                    <span>{req.status}</span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <div className="font-semibold text-slate-400 text-[11px]">Your Motivation / Reason:</div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">"{req.reason}"</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <div className="font-semibold text-slate-400 text-[11px]">Expected Value for Team:</div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">"{req.expectedBenefit}"</p>
                </div>
              </div>

              {/* Reviewer Feedback Notes if Reviewed */}
              {req.reviewerNotes && (
                <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-900/40 text-xs text-indigo-200 flex items-start space-x-3">
                  <MessageSquare className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-white text-[11px]">
                      Team Leader Review Note ({req.reviewedBy}):
                    </div>
                    <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">{req.reviewerNotes}</p>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      <RequestModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
