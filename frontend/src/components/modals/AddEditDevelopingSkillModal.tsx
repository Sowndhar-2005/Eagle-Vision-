import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { DevelopingSkillItem } from '../../types';
import { X, Target, Trash2 } from 'lucide-react';

interface AddEditDevelopingSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  skillToEdit?: DevelopingSkillItem | null;
}

export const AddEditDevelopingSkillModal: React.FC<AddEditDevelopingSkillModalProps> = ({
  isOpen,
  onClose,
  skillToEdit,
}) => {
  const { addDevelopingSkill, removeDevelopingSkill } = useApp();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('AI / Machine Learning');
  const [status, setStatus] = useState<DevelopingSkillItem['status']>('Developing');
  const [progressPercentage, setProgressPercentage] = useState(50);
  const [targetRoleRelevance, setTargetRoleRelevance] = useState('');
  const [associatedCourseOrGig, setAssociatedCourseOrGig] = useState('');

  useEffect(() => {
    if (skillToEdit) {
      setName(skillToEdit.name);
      setCategory(skillToEdit.category);
      setStatus(skillToEdit.status);
      setProgressPercentage(skillToEdit.progressPercentage);
      setTargetRoleRelevance(skillToEdit.targetRoleRelevance);
      setAssociatedCourseOrGig(skillToEdit.associatedCourseOrGig || '');
    } else {
      setName('');
      setCategory('AI / Machine Learning');
      setStatus('Developing');
      setProgressPercentage(40);
      setTargetRoleRelevance('');
      setAssociatedCourseOrGig('');
    }
  }, [skillToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const devSkill: DevelopingSkillItem = {
      id: skillToEdit ? skillToEdit.id : `sk-dev-${Date.now()}`,
      name: name.trim(),
      category,
      status,
      progressPercentage: Number(progressPercentage),
      targetRoleRelevance: targetRoleRelevance.trim() || 'Internal Architecture & Systems',
      associatedCourseOrGig: associatedCourseOrGig.trim() || undefined,
    };
    addDevelopingSkill(devSkill);
    onClose();
  };

  const handleDelete = () => {
    if (skillToEdit) {
      removeDevelopingSkill(skillToEdit.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-violet-500/20 border border-violet-500/30 text-violet-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {skillToEdit ? 'Edit Developing Skill' : 'Add Developing Skill'}
              </h3>
              <p className="text-xs text-slate-400">Track competencies and technologies you are actively learning</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Skill / Technology Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. MLOps, Kubernetes, Distributed Serving"
                required
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white text-xs focus:outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white text-xs focus:outline-none focus:border-violet-500"
              >
                <option value="AI / Machine Learning">AI / Machine Learning</option>
                <option value="Backend & Systems">Backend & Systems</option>
                <option value="Frontend & UI">Frontend & UI</option>
                <option value="Cloud & DevOps">Cloud & DevOps</option>
                <option value="Data & Analytics">Data & Analytics</option>
                <option value="Architecture & Design">Architecture & Design</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Learning Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white text-xs focus:outline-none focus:border-violet-500"
              >
                <option value="Developing">Developing (Active Practice)</option>
                <option value="Learning">Learning (Course / Reading)</option>
                <option value="Beginner">Beginner (Basic Knowledge)</option>
                <option value="Target">Target (Upcoming Goal)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Current Progress ({progressPercentage}%)
              </label>
              <div className="flex items-center space-x-3 pt-1">
                <input
                  type="range"
                  min={5}
                  max={95}
                  step={5}
                  value={progressPercentage}
                  onChange={(e) => setProgressPercentage(parseInt(e.target.value))}
                  className="w-full accent-violet-500"
                />
                <span className="text-xs font-bold text-violet-400 w-10 text-right">
                  {progressPercentage}%
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Role Relevance / Goal</label>
            <input
              type="text"
              value={targetRoleRelevance}
              onChange={(e) => setTargetRoleRelevance(e.target.value)}
              placeholder="e.g. Staff ML Infrastructure Engineer / Zero-Downtime Cluster Rollouts"
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white text-xs focus:outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Associated Course or Gig (Optional)</label>
            <input
              type="text"
              value={associatedCourseOrGig}
              onChange={(e) => setAssociatedCourseOrGig(e.target.value)}
              placeholder="e.g. Production MLOps: Continuous Integration & Model Delivery"
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white text-xs focus:outline-none focus:border-violet-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            {skillToEdit ? (
              <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl text-xs font-medium transition flex items-center space-x-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Remove</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center space-x-3">
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
                {skillToEdit ? 'Save Changes' : 'Add Developing Skill'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
