import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ExperienceItem } from '../../types';
import { X, Briefcase } from 'lucide-react';

interface AddEditExperienceModalProps {
  isOpen: boolean;
  onClose: () => void;
  experienceToEdit?: ExperienceItem | null;
}

export const AddEditExperienceModal: React.FC<AddEditExperienceModalProps> = ({
  isOpen,
  onClose,
  experienceToEdit,
}) => {
  const { addOrUpdateExperience } = useApp();

  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [team, setTeam] = useState('');
  const [duration, setDuration] = useState('');
  const [responsibilitiesText, setResponsibilitiesText] = useState('');
  const [skillsUsedText, setSkillsUsedText] = useState('');
  const [achievementsText, setAchievementsText] = useState('');

  useEffect(() => {
    if (experienceToEdit) {
      setCompany(experienceToEdit.company);
      setRole(experienceToEdit.role);
      setTeam(experienceToEdit.team);
      setDuration(experienceToEdit.duration);
      setResponsibilitiesText(experienceToEdit.responsibilities.join('\n'));
      setSkillsUsedText(experienceToEdit.skillsUsed.join(', '));
      setAchievementsText(experienceToEdit.achievements?.join('\n') || '');
    } else {
      setCompany('Eagle Vision');
      setRole('');
      setTeam('');
      setDuration('2024 — Present');
      setResponsibilitiesText('');
      setSkillsUsedText('');
      setAchievementsText('');
    }
  }, [experienceToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const responsibilities = responsibilitiesText
      .split('\n')
      .map((r) => r.trim().replace(/^[-•*]\s*/, ''))
      .filter(Boolean);

    const skillsUsed = skillsUsedText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const achievements = achievementsText
      .split('\n')
      .map((a) => a.trim().replace(/^[-•*]\s*/, ''))
      .filter(Boolean);

    const exp: ExperienceItem = {
      id: experienceToEdit ? experienceToEdit.id : `exp-${Date.now()}`,
      company: company.trim(),
      role: role.trim(),
      team: team.trim(),
      duration: duration.trim(),
      startDate: '2024-01-01',
      endDate: duration.includes('Present') ? 'Present' : '2024-12-31',
      responsibilities: responsibilities.length > 0 ? responsibilities : ['Engineered system deliverables'],
      skillsUsed: skillsUsed.length > 0 ? skillsUsed : ['Python', 'TypeScript'],
      achievements: achievements.length > 0 ? achievements : undefined,
    };

    addOrUpdateExperience(exp);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {experienceToEdit ? 'Edit Work Experience' : 'Add Work Experience'}
              </h3>
              <p className="text-xs text-slate-400">Document company roles, responsibilities, and achievements</p>
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
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Job Title / Role</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Senior AI / Full-Stack Engineer"
                required
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Company / Organization</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Eagle Vision"
                required
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Team / Department</label>
              <input
                type="text"
                value={team}
                onChange={(e) => setTeam(e.target.value)}
                placeholder="e.g. AI / Machine Learning Team"
                required
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Duration</label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 2025 — Present or 2022 — 2024"
                required
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Responsibilities (One bullet per line)
            </label>
            <textarea
              rows={3}
              value={responsibilitiesText}
              onChange={(e) => setResponsibilitiesText(e.target.value)}
              placeholder="Developed AI talent matching system&#10;Built RAG pipelines&#10;Developed FastAPI services&#10;Integrated semantic search"
              required
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white text-xs leading-relaxed focus:outline-none focus:border-indigo-500 resize-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Skills Used (comma-separated)
            </label>
            <input
              type="text"
              value={skillsUsedText}
              onChange={(e) => setSkillsUsedText(e.target.value)}
              placeholder="Python, FastAPI, React, RAG, PostgreSQL"
              required
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Key Achievements & Metrics (One per line)
            </label>
            <textarea
              rows={2}
              value={achievementsText}
              onChange={(e) => setAchievementsText(e.target.value)}
              placeholder="Reduced talent discovery query latency by 85%&#10;Adopted by 4 engineering teams across company"
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white text-xs leading-relaxed focus:outline-none focus:border-indigo-500 resize-none font-mono"
            />
          </div>

          {/* Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition shadow-md shadow-indigo-600/30"
            >
              {experienceToEdit ? 'Save Changes' : 'Add Experience'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
