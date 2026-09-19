import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ProjectHistoryItem } from '../../types';
import { X, FolderGit2 } from 'lucide-react';

interface AddEditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectToEdit?: ProjectHistoryItem | null;
}

export const AddEditProjectModal: React.FC<AddEditProjectModalProps> = ({
  isOpen,
  onClose,
  projectToEdit,
}) => {
  const { addOrUpdateProject } = useApp();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [role, setRole] = useState('');
  const [team, setTeam] = useState('');
  const [status, setStatus] = useState<ProjectHistoryItem['status']>('current');
  const [technologiesText, setTechnologiesText] = useState('');
  const [responsibilitiesText, setResponsibilitiesText] = useState('');
  const [skillsDemonstratedText, setSkillsDemonstratedText] = useState('');
  const [achievementsText, setAchievementsText] = useState('');
  const [projectOutcome, setProjectOutcome] = useState('');

  useEffect(() => {
    if (projectToEdit) {
      setName(projectToEdit.name);
      setDescription(projectToEdit.description);
      setRole(projectToEdit.role);
      setTeam(projectToEdit.team);
      setStatus(projectToEdit.status);
      setTechnologiesText(projectToEdit.technologies.join(', '));
      setResponsibilitiesText(projectToEdit.responsibilities.join('\n'));
      setSkillsDemonstratedText(projectToEdit.skillsDemonstrated.join(', '));
      setAchievementsText(projectToEdit.achievements?.join('\n') || '');
      setProjectOutcome(projectToEdit.projectOutcome || '');
    } else {
      setName('');
      setDescription('');
      setRole('Lead Contributor');
      setTeam('AI / Machine Learning Team');
      setStatus('current');
      setTechnologiesText('');
      setResponsibilitiesText('');
      setSkillsDemonstratedText('');
      setAchievementsText('');
      setProjectOutcome('');
    }
  }, [projectToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const technologies = technologiesText
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const skillsDemonstrated = skillsDemonstratedText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const responsibilities = responsibilitiesText
      .split('\n')
      .map((r) => r.trim().replace(/^[-•*]\s*/, ''))
      .filter(Boolean);

    const achievements = achievementsText
      .split('\n')
      .map((a) => a.trim().replace(/^[-•*]\s*/, ''))
      .filter(Boolean);

    const proj: ProjectHistoryItem = {
      id: projectToEdit ? projectToEdit.id : `proj-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      role: role.trim(),
      team: team.trim(),
      status,
      technologies: technologies.length > 0 ? technologies : ['Python', 'FastAPI', 'React'],
      responsibilities: responsibilities.length > 0 ? responsibilities : ['System architecture & deployment'],
      skillsDemonstrated: skillsDemonstrated.length > 0 ? skillsDemonstrated : technologies,
      startDate: 'Jan 2025',
      endDate: status === 'current' ? 'Present' : 'Dec 2024',
      achievements: achievements.length > 0 ? achievements : undefined,
      projectOutcome: projectOutcome.trim() || undefined,
    };

    addOrUpdateProject(proj);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {projectToEdit ? 'Edit Project' : 'Add Project'}
              </h3>
              <p className="text-xs text-slate-400">Document company projects, active initiatives, and cross-team gigs</p>
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
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Project Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Eagle Vision AI Talent Platform"
                required
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Employee Role in Project</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Lead AI/ML Developer"
                required
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Team / Scope</label>
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
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Project Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="current">Active / Current</option>
                <option value="completed">Completed</option>
                <option value="cross_team">Cross-Team Gig (20%)</option>
                <option value="in_progress">In Progress</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Project Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="AI-powered internal talent discovery and mobility system for enterprise multi-team workforce."
              required
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white text-xs leading-relaxed focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Responsibilities (One bullet per line)
            </label>
            <textarea
              rows={3}
              value={responsibilitiesText}
              onChange={(e) => setResponsibilitiesText(e.target.value)}
              placeholder="Skill extraction pipeline&#10;Semantic talent matching&#10;RAG pipeline"
              required
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white text-xs leading-relaxed focus:outline-none focus:border-indigo-500 resize-none font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Technologies (comma-separated)
              </label>
              <input
                type="text"
                value={technologiesText}
                onChange={(e) => setTechnologiesText(e.target.value)}
                placeholder="Python, FastAPI, React, PostgreSQL, pgvector"
                required
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Skills Demonstrated (comma-separated)
              </label>
              <input
                type="text"
                value={skillsDemonstratedText}
                onChange={(e) => setSkillsDemonstratedText(e.target.value)}
                placeholder="Python, Vector Embeddings, RAG, Semantic Matching"
                required
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Project Outcome & Impact (Optional)
            </label>
            <input
              type="text"
              value={projectOutcome}
              onChange={(e) => setProjectOutcome(e.target.value)}
              placeholder="e.g. Active in production across 4 engineering teams with 24 internal project matches."
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
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
              {projectToEdit ? 'Save Changes' : 'Add Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
