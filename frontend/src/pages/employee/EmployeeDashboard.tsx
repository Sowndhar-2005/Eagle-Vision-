import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  TrendingUp,
  Target,
  Briefcase,
  ChevronRight,
  CheckCircle2,
  Award,
  ArrowRight,
  Building,
  Activity,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { RequestModal } from '../../components/modals/RequestModal';

export const EmployeeDashboard: React.FC = () => {
  const { currentUser, allOpportunities, allCourses } = useApp();
  const navigate = useNavigate();

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedTargetTitle, setSelectedTargetTitle] = useState('');
  const [selectedTargetId, setSelectedTargetId] = useState('');
  const [selectedSkillOrRole, setSelectedSkillOrRole] = useState('');
  const [modalType, setModalType] = useState<'course' | 'project'>('course');

  const handleOpenCourseRequest = (course: any) => {
    setModalType('course');
    setSelectedTargetId(course.id);
    setSelectedTargetTitle(course.title);
    setSelectedSkillOrRole(course.skill);
    setIsRequestModalOpen(true);
  };

  const handleOpenProjectRequest = (opp: any) => {
    setModalType('project');
    setSelectedTargetId(opp.id);
    setSelectedTargetTitle(opp.title);
    setSelectedSkillOrRole(opp.requiredSkills[0] || 'Contributor');
    setIsRequestModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner / Persona Alert */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-700/80 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-500/50 shadow-lg shadow-indigo-500/20"
            />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-black text-white">{currentUser.name}</h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                {currentUser.personaType === 'new_employee' ? 'New Hire Onboarding' : 'Growth-Seeking Track'}
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="text-slate-200 font-medium">{currentUser.title}</span>
              <span>•</span>
              <span className="flex items-center text-indigo-300">
                <Building className="w-3.5 h-3.5 mr-1" /> {currentUser.teamName}
              </span>
              <span>•</span>
              <span>Leader: {currentUser.teamLeaderName}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs text-slate-400">Profile Completion</div>
            <div className="text-sm font-bold text-white">{currentUser.profileCompletion}%</div>
          </div>
          <button
            onClick={() => navigate('/profile')}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl transition shadow-md shadow-indigo-600/30 flex items-center space-x-2"
          >
            <span>View Full Profile</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60 backdrop-blur-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Role Fit Readiness</span>
            <Target className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">{currentUser.careerAspiration.readinessScore}%</div>
          <div className="text-[11px] text-emerald-400">Target: {currentUser.careerAspiration.targetRole}</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60 backdrop-blur-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Verified Skills</span>
            <Award className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {currentUser.skills.filter((s) => s.isVerified).length} Skills
          </div>
          <div className="text-[11px] text-violet-300">
            {currentUser.skills.filter((s) => s.isTransferable).length} Transferable Detected
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60 backdrop-blur-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>High-Match Gigs</span>
            <Briefcase className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">{allOpportunities.length} Available</div>
          <div className="text-[11px] text-emerald-400">Cross-team internal mobility</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60 backdrop-blur-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Upskilling Roadmap</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {currentUser.learningHistory.currentLearning.length} in Progress
          </div>
          <div className="text-[11px] text-slate-400">
            {currentUser.learningHistory.completedCourses.length} completed
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Current Work & Skills */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Work & Active Responsibilities */}
          <div className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700/60 backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-indigo-400" />
                <h2 className="text-base font-bold text-white">Current Work & Active Project</h2>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-medium">
                {currentUser.currentWork.status}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">{currentUser.currentWork.projectName}</h3>
                  <div className="text-xs text-slate-400">
                    Role: <span className="text-slate-200 font-semibold">{currentUser.currentWork.role}</span> •{' '}
                    {currentUser.currentWork.team}
                  </div>
                </div>
                <button
                  onClick={() => navigate('/current-work')}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1"
                >
                  <span>Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Active Responsibilities:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {currentUser.currentWork.responsibilities.map((resp, i) => (
                    <div key={i} className="text-xs text-slate-300 flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                      <span>{resp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Current Skills with Visual Proficiency Bars */}
          <div className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700/60 backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-indigo-400" />
                <h2 className="text-base font-bold text-white">Current Skills & Verified Competencies</h2>
              </div>
              <button
                onClick={() => navigate('/skills')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center"
              >
                <span>View All Skills</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {currentUser.skills.slice(0, 6).map((sk) => (
                <div
                  key={sk.id}
                  className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="font-semibold text-white flex items-center space-x-1.5">
                      <span>{sk.name}</span>
                      {sk.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                      {sk.isTransferable && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                          Transferable
                        </span>
                      )}
                    </div>
                    <span className="text-slate-400 text-[11px] font-medium">{sk.levelLabel}</span>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        sk.proficiency >= 85
                          ? 'bg-gradient-to-r from-indigo-500 to-cyan-400'
                          : sk.proficiency >= 65
                          ? 'bg-gradient-to-r from-indigo-500 to-violet-500'
                          : 'bg-gradient-to-r from-amber-500 to-orange-400'
                      }`}
                      style={{ width: `${sk.proficiency}%` }}
                    />
                  </div>

                  <div className="text-[10px] text-slate-400 truncate">{sk.evidence}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Skill Gaps & Recommended For You */}
        <div className="space-y-6">
          {/* Skill Gaps & Career Target */}
          <div className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700/60 backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-bold text-white">Skill Gap Analysis</h2>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Target Role
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="text-slate-400 text-[11px]">Aspirating Target:</div>
                <div className="text-sm font-bold text-white mt-0.5">
                  {currentUser.careerAspiration.targetRole}
                </div>
              </div>

              <div>
                <div className="text-slate-400 text-[11px] mb-1.5">Missing & Developing Competencies:</div>
                <div className="space-y-1.5">
                  {currentUser.careerAspiration.missingSkills.map((sk, i) => (
                    <div
                      key={i}
                      className="p-2 rounded-xl bg-slate-900/60 border border-rose-500/20 flex items-center justify-between text-xs"
                    >
                      <span className="text-slate-200 font-medium">{sk}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-semibold">
                        Missing
                      </span>
                    </div>
                  ))}

                  {currentUser.careerAspiration.developingSkills.map((sk, i) => (
                    <div
                      key={i}
                      className="p-2 rounded-xl bg-slate-900/60 border border-amber-500/20 flex items-center justify-between text-xs"
                    >
                      <span className="text-slate-200 font-medium">{sk}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold">
                        Developing
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => navigate('/skill-gaps')}
                className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold rounded-xl transition shadow-lg shadow-amber-600/20 flex items-center justify-center space-x-2 text-xs"
              >
                <span>View Development Plan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Recommended For You */}
          <div className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700/60 backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <h2 className="text-base font-bold text-white">Recommended for You</h2>
              </div>
              <button
                onClick={() => navigate('/opportunities')}
                className="text-xs text-indigo-400 hover:underline"
              >
                Explore
              </button>
            </div>

            <div className="space-y-3">
              {allOpportunities.slice(0, 2).map((opp) => (
                <div
                  key={opp.id}
                  className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-indigo-500/40 transition space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-white text-xs">{opp.title}</div>
                      <div className="text-[11px] text-slate-400">{opp.team}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[11px]">
                      {opp.matchScore}% Match
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                    {opp.description}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-indigo-300 font-medium">{opp.duration}</span>
                    <button
                      onClick={() => handleOpenProjectRequest(opp)}
                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[11px] font-semibold transition"
                    >
                      Request to Join
                    </button>
                  </div>
                </div>
              ))}

              {allCourses.slice(0, 1).map((course) => (
                <div
                  key={course.id}
                  className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-violet-500/40 transition space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-white text-xs">{course.title}</div>
                      <div className="text-[11px] text-slate-400">{course.provider}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-semibold text-[10px]">
                      {course.difficulty}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-400 font-medium">{course.duration}</span>
                    <button
                      onClick={() => handleOpenCourseRequest(course)}
                      className="px-2.5 py-1 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-[11px] font-semibold transition"
                    >
                      Request Course
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Request Modal */}
      <RequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        defaultType={modalType}
        targetId={selectedTargetId}
        targetTitle={selectedTargetTitle}
        targetSkillOrRole={selectedSkillOrRole}
      />
    </div>
  );
};
