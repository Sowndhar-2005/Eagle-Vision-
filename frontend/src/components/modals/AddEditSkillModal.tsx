import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { SkillItem } from '../../types';
import { X, Award, CheckCircle2, Trash2 } from 'lucide-react';

interface AddEditSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  skillToEdit?: SkillItem | null;
}

export const AddEditSkillModal: React.FC<AddEditSkillModalProps> = ({
  isOpen,
  onClose,
  skillToEdit,
}) => {
  const { addOrUpdateSkill, removeSkill } = useApp();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<SkillItem['category']>('AI / Machine Learning');
  const [levelLabel, setLevelLabel] = useState<SkillItem['levelLabel']>('Advanced');
  const [proficiency, setProficiency] = useState(85);
  const [yearsOfExperience, setYearsOfExperience] = useState(3);
  const [evidence, setEvidence] = useState('');
  const [evidenceSource, setEvidenceSource] = useState<SkillItem['evidenceSource']>('Project Deliverable');
  const [isVerified, setIsVerified] = useState(true);
  const [isTransferable, setIsTransferable] = useState(false);

  useEffect(() => {
    if (skillToEdit) {
      setName(skillToEdit.name);
      setCategory(skillToEdit.category);
      setLevelLabel(skillToEdit.levelLabel);
      setProficiency(skillToEdit.proficiency);
      setYearsOfExperience(skillToEdit.yearsOfExperience);
      setEvidence(skillToEdit.evidence);
      setEvidenceSource(skillToEdit.evidenceSource || 'Project Deliverable');
      setIsVerified(skillToEdit.isVerified);
      setIsTransferable(skillToEdit.isTransferable);
    } else {
      setName('');
      setCategory('AI / Machine Learning');
      setLevelLabel('Advanced');
      setProficiency(85);
      setYearsOfExperience(3);
      setEvidence('');
      setEvidenceSource('Project Deliverable');
      setIsVerified(true);
      setIsTransferable(false);
    }
  }, [skillToEdit, isOpen]);

  if (!isOpen) return null;

  const handleLevelChange = (label: SkillItem['levelLabel']) => {
    setLevelLabel(label);
    if (label === 'Beginner') setProficiency(40);
    else if (label === 'Intermediate') setProficiency(65);
    else if (label === 'Advanced') setProficiency(85);
    else if (label === 'Expert') setProficiency(95);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const skill: SkillItem = {
      id: skillToEdit ? skillToEdit.id : `sk-${Date.now()}`,
      name: name.trim(),
      category,
      proficiency: Number(proficiency),
      levelLabel,
      yearsOfExperience: Number(yearsOfExperience),
      evidence: evidence.trim() || `Demonstrated proficiency in ${name} through team deliverables and internal systems.`,
      evidenceSource,
      isVerified,
      isTransferable,
    };
    addOrUpdateSkill(skill);
    onClose();
  };

  const handleDelete = () => {
    if (skillToEdit) {
      removeSkill(skillToEdit.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {skillToEdit ? 'Edit Skill & Competency' : 'Add Current Skill'}
              </h3>
              <p className="text-xs text-slate-400">Specify proficiency, evidence, experience, and verification</p>
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
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Skill Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Python, FastAPI, Docker"
                required
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="AI / Machine Learning">AI / Machine Learning</option>
                <option value="Backend & Systems">Backend & Systems</option>
                <option value="Frontend & UI">Frontend & UI</option>
                <option value="Cloud & DevOps">Cloud & DevOps</option>
                <option value="Data & Analytics">Data & Analytics</option>
                <option value="Architecture & Design">Architecture & Design</option>
                <option value="Soft Skills">Soft Skills</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Proficiency Level</label>
              <div className="grid grid-cols-4 gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700/80">
                {(['Beginner', 'Intermediate', 'Advanced', 'Expert'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => handleLevelChange(lvl)}
                    className={`py-1.5 text-[11px] font-semibold rounded-lg transition ${
                      levelLabel === lvl
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Years of Experience ({yearsOfExperience} yrs)
              </label>
              <input
                type="number"
                min={0}
                max={30}
                step={0.5}
                value={yearsOfExperience}
                onChange={(e) => setYearsOfExperience(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Evidence & Usage Description</label>
            <textarea
              rows={3}
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
              placeholder="Describe how and where you used this skill, e.g. 'Engineered asynchronous REST APIs in production with 99.9% uptime...'"
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white text-xs leading-relaxed focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Evidence Source</label>
              <select
                value={evidenceSource}
                onChange={(e) => setEvidenceSource(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="GitHub Production Commit">GitHub Production Commit</option>
                <option value="Project Deliverable">Project Deliverable</option>
                <option value="Code Review">Code Review</option>
                <option value="Course Certification">Course Certification</option>
                <option value="Self-Reported">Self-Reported</option>
              </select>
            </div>

            <div className="space-y-2 pt-2">
              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isVerified}
                  onChange={(e) => setIsVerified(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 rounded"
                />
                <span className="text-xs text-slate-300 flex items-center space-x-1">
                  <span>Mark as Verified</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </span>
              </label>

              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isTransferable}
                  onChange={(e) => setIsTransferable(e.target.checked)}
                  className="w-4 h-4 accent-violet-500 rounded"
                />
                <span className="text-xs text-slate-300">Transferable Cross-Domain Competency</span>
              </label>
            </div>
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
                <span>Remove Skill</span>
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
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition shadow-md shadow-indigo-600/30"
              >
                {skillToEdit ? 'Save Changes' : 'Add Skill'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
