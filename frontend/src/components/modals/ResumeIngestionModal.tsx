import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, FileText, Upload, Sparkles, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';

interface ResumeIngestionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResumeIngestionModal: React.FC<ResumeIngestionModalProps> = ({ isOpen, onClose }) => {
  const { ingestResumeData } = useApp();
  const [step, setStep] = useState<'upload' | 'extracting' | 'review'>('upload');
  const fileName = 'Jane_Doe_Staff_AI_Engineer_Resume.pdf';

  if (!isOpen) return null;

  const handleSimulatedExtraction = () => {
    setStep('extracting');

    setTimeout(() => {
      setStep('review');
    }, 1800);
  };

  const handleApplyToProfile = () => {
    ingestResumeData({
      skills: ['Distributed Model Serving', 'Triton Inference Server', 'vLLM', 'Ray Core', 'MLflow Registry'],
      detectedExperience: '5+ years building async Python microservices, pgvector vector search pipelines, and LLM reasoning workflows.',
      topTech: ['Python', 'FastAPI', 'pgvector', 'Docker', 'NetworkX', 'Triton'],
    });
    onClose();
    setStep('upload');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">InterviewStreet Profile Ingestion</h2>
              <p className="text-xs text-slate-400">
                Automated skill extraction & GitHub evidence verification pipeline
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'upload' && (
          <div className="space-y-4 text-xs">
            <div className="border-2 border-dashed border-slate-700 hover:border-violet-500/60 rounded-2xl p-6 text-center space-y-3 bg-slate-800/30 transition">
              <div className="w-12 h-12 mx-auto rounded-full bg-violet-600/20 text-violet-400 flex items-center justify-center">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Upload Existing Resume / CV Document</div>
                <div className="text-slate-400 text-[11px] mt-1">
                  Supports PDF, DOCX, and LinkedIn Export (Max 15MB)
                </div>
              </div>

              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
                <FileText className="w-4 h-4 text-violet-400" />
                <span className="font-mono text-[11px]">{fileName}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-1.5 text-[11px] text-slate-300">
              <div className="font-semibold text-white flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                <span>InterviewStreet Hiring Agent Extraction Pipeline:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
                <li>Parses structured skills, work history, and internal project deliverables</li>
                <li>Detects transferable cross-domain competencies using Gemini embeddings</li>
                <li>Correlates GitHub repositories for verifiable code evidence</li>
              </ul>
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
                type="button"
                onClick={handleSimulatedExtraction}
                className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition shadow-lg shadow-violet-600/30 flex items-center space-x-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Run AI Ingestion Analysis</span>
              </button>
            </div>
          </div>
        )}

        {step === 'extracting' && (
          <div className="py-12 text-center space-y-4 text-xs">
            <Loader2 className="w-10 h-10 text-violet-400 animate-spin mx-auto" />
            <div className="space-y-1">
              <div className="text-base font-bold text-white">Extracting Capability Signals...</div>
              <p className="text-slate-400 max-w-xs mx-auto text-[11px]">
                Analyzing semantic embeddings, mapping skills taxonomy adjacency, and verifying project evidence.
              </p>
            </div>
          </div>
        )}

        {step === 'review' && (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start space-x-2 text-emerald-300">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-white">Extraction Succeeded</div>
                <div className="text-[11px]">
                  5 new skills and high-confidence project evidence detected from resume.
                </div>
              </div>
            </div>

            <div>
              <div className="text-slate-400 font-medium mb-1.5">Detected New Skills:</div>
              <div className="flex flex-wrap gap-1.5">
                {['Distributed Model Serving', 'Triton Inference Server', 'vLLM', 'Ray Core', 'MLflow Registry'].map(
                  (sk) => (
                    <span
                      key={sk}
                      className="px-2.5 py-1 rounded-lg bg-violet-600/20 text-violet-300 border border-violet-500/30 font-medium"
                    >
                      + {sk}
                    </span>
                  )
                )}
              </div>
            </div>

            <div>
              <div className="text-slate-400 font-medium mb-1">Extracted Professional Summary:</div>
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-200 text-[11px] leading-relaxed">
                "Experienced in building high-throughput asynchronous Python microservices, pgvector vector search
                pipelines, and LLM reasoning workflows with verified GitHub evidence."
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setStep('upload')}
                className="px-4 py-2 text-slate-400 hover:text-white transition font-medium"
              >
                Re-upload
              </button>
              <button
                type="button"
                onClick={handleApplyToProfile}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition shadow-lg shadow-emerald-600/30 flex items-center space-x-2"
              >
                <span>Apply to Eagle Vision Profile</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
