import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileCheck,
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
} from 'lucide-react';
import { ReviewRequestModal } from '../../components/modals/ReviewRequestModal';
import { DevelopmentRequest } from '../../types';

export const TeamLeaderRequestsPage: React.FC = () => {
  const { requests, currentUser } = useApp();
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const [selectedRequest, setSelectedRequest] = useState<DevelopmentRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Requests directed to this leader's team
  const teamRequests = requests.filter(
    (r) => r.requesterTeamId === currentUser.teamId
  );

  const filteredRequests =
    filterStatus === 'all'
      ? teamRequests
      : teamRequests.filter((r) => r.status === filterStatus);

  const handleReview = (req: DevelopmentRequest) => {
    setSelectedRequest(req);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Review Development Requests</h1>
          <p className="text-slate-400 text-xs mt-1">
            Review and approve course upskilling and project participation requests submitted by your team members.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition border ${
                filterStatus === s
                  ? 'bg-violet-600 text-white border-violet-500 shadow-md shadow-violet-600/30'
                  : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {s === 'all' ? 'All' : `${s} (${teamRequests.filter((r) => r.status === s).length})`}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="p-12 text-center bg-slate-800/20 border border-slate-800 rounded-3xl space-y-2">
            <FileCheck className="w-10 h-10 text-slate-500 mx-auto" />
            <div className="text-sm font-semibold text-white">No requests found</div>
            <p className="text-xs text-slate-400">All development requests have been reviewed.</p>
          </div>
        ) : (
          filteredRequests.map((req) => (
            <div
              key={req.id}
              className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700/60 backdrop-blur-sm space-y-4 shadow-lg"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-3.5">
                  <img
                    src={req.requesterAvatar}
                    alt={req.requesterName}
                    className="w-11 h-11 rounded-xl object-cover border border-violet-500/30"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-white text-base">{req.requesterName}</h3>
                      <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-800 text-slate-300 font-medium">
                        {req.requesterRole}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Target Competency: <span className="text-violet-300 font-semibold">{req.desiredRoleOrSkill}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 self-start sm:self-auto">
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

                  {req.status === 'pending' && (
                    <button
                      onClick={() => handleReview(req)}
                      className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs rounded-xl transition shadow-md shadow-violet-600/30 flex items-center space-x-1.5"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>Review Request</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-white text-sm">{req.targetTitle}</div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                    {req.type}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-slate-400 text-[11px] font-semibold">Employee's Motivation:</span>
                    <p className="text-slate-300 text-[11px] mt-0.5 italic">"{req.reason}"</p>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[11px] font-semibold">Expected Team Benefit:</span>
                    <p className="text-slate-300 text-[11px] mt-0.5 italic">"{req.expectedBenefit}"</p>
                  </div>
                </div>
              </div>

              {req.reviewerNotes && (
                <div className="p-3 rounded-2xl bg-violet-950/30 border border-violet-900/40 text-xs text-violet-200 flex items-start space-x-3">
                  <MessageSquare className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-white text-[11px]">Your Review Notes ({req.reviewedBy}):</div>
                    <p className="text-slate-300 text-[11px] mt-0.5">{req.reviewerNotes}</p>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <ReviewRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        request={selectedRequest}
      />
    </div>
  );
};
