import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Send, BookOpen, Briefcase, Sparkles } from 'lucide-react';

interface RequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: 'course' | 'project';
  targetTitle?: string;
  targetId?: string;
  targetSkillOrRole?: string;
}

export const RequestModal: React.FC<RequestModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'course',
  targetTitle = '',
  targetId = '',
  targetSkillOrRole = '',
}) => {
  const { currentUser, allCourses, allProjects, submitRequest } = useApp();
  const [requestType, setRequestType] = useState<'course' | 'project'>(defaultType);
  const [selectedTargetId, setSelectedTargetId] = useState(targetId);
  const [customTitle, setCustomTitle] = useState(targetTitle);
  const [desiredRoleOrSkill, setDesiredRoleOrSkill] = useState(targetSkillOrRole);
  const [reason, setReason] = useState('');
  const [expectedBenefit, setExpectedBenefit] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let finalTitle = customTitle;
    if (requestType === 'course') {
      const c = allCourses.find((item) => item.id === selectedTargetId);
      if (c) {
        finalTitle = c.title;
      }
    } else {
      const p = allProjects.find((item) => item.id === selectedTargetId);
      if (p) {
        finalTitle = p.name;
      }
    }

    submitRequest({
      type: requestType,
      requesterId: currentUser.id,
      requesterName: currentUser.name,
      requesterAvatar: currentUser.avatar,
      requesterRole: currentUser.title,
      requesterTeamId: currentUser.teamId,
      requesterTeamName: currentUser.teamName,
      targetId: selectedTargetId || `custom-${Date.now()}`,
      targetTitle: finalTitle || 'Development Request',
      reason,
      desiredRoleOrSkill,
      expectedBenefit,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
              {requestType === 'course' ? <BookOpen className="w-5 h-5" /> : <Briefcase className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Submit {requestType === 'course' ? 'Course' : 'Project Participation'} Request
              </h2>
              <p className="text-xs text-slate-400">
                Routed directly to Team Leader: <span className="text-indigo-400 font-medium">{currentUser.teamLeaderName}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Request Type Toggle */}
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">Request Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setRequestType('course');
                  setSelectedTargetId('');
                }}
                className={`py-2 px-3 rounded-xl font-semibold transition flex items-center justify-center space-x-2 border ${
                  requestType === 'course'
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                    : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-800'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Course / Learning</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setRequestType('project');
                  setSelectedTargetId('');
                }}
                className={`py-2 px-3 rounded-xl font-semibold transition flex items-center justify-center space-x-2 border ${
                  requestType === 'project'
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                    : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-800'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>Internal Project / Gig</span>
              </button>
            </div>
          </div>

          {/* Target Selection */}
          {requestType === 'course' ? (
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Select Course</label>
              <select
                value={selectedTargetId}
                onChange={(e) => {
                  setSelectedTargetId(e.target.value);
                  const selected = allCourses.find((c) => c.id === e.target.value);
                  if (selected) {
                    setDesiredRoleOrSkill(selected.skill);
                    setCustomTitle(selected.title);
                  }
                }}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
                required
              >
                <option value="">-- Choose a course --</option>
                {allCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} ({c.provider} • {c.difficulty})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Select Project or Gig</label>
              <select
                value={selectedTargetId}
                onChange={(e) => {
                  setSelectedTargetId(e.target.value);
                  const selected = allProjects.find((p) => p.id === e.target.value);
                  if (selected) {
                    setDesiredRoleOrSkill(selected.availableRoles[0] || 'Contributor');
                    setCustomTitle(selected.name);
                  }
                }}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
                required
              >
                <option value="">-- Choose an open project --</option>
                {allProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.teamName} • {p.duration})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Desired Skill or Role */}
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">
              {requestType === 'course' ? 'Target Skill to Improve' : 'Desired Project Role / Contribution'}
            </label>
            <input
              type="text"
              value={desiredRoleOrSkill}
              onChange={(e) => setDesiredRoleOrSkill(e.target.value)}
              placeholder={requestType === 'course' ? 'e.g. Kubernetes, MLOps' : 'e.g. Backend Contributor (20% Gig)'}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500 placeholder-slate-500"
              required
            />
          </div>

          {/* Reason */}
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">
              Why are you interested in this? (Reason)
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain your motivation and relevance to current team goals or career roadmap..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-indigo-500 placeholder-slate-500"
              required
            />
          </div>

          {/* Expected Benefit */}
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">
              Expected Benefit for Team & Career
            </label>
            <textarea
              rows={2}
              value={expectedBenefit}
              onChange={(e) => setExpectedBenefit(e.target.value)}
              placeholder="e.g. Will allow me to autonomously manage model deployments and assist in upcoming sprint deliverables."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-indigo-500 placeholder-slate-500"
              required
            />
          </div>

          <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-900/40 text-[11px] text-indigo-300 flex items-start space-x-2">
            <Sparkles className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
            <span>
              Team Leaders review and approve requests based on current sprint workload and career growth roadmaps.
            </span>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition shadow-lg shadow-indigo-600/30 flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Submit to Team Leader</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
