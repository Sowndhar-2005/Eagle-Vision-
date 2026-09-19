import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BookOpen, Clock, Star, Users, Search, CheckCircle2, Lock } from 'lucide-react';
import { RequestModal } from '../../components/modals/RequestModal';

export const LearningPage: React.FC = () => {
  const { allCourses, currentUser } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);

  const filteredCourses = allCourses.filter((course) => {
    const matchesDiff = selectedDifficulty === 'all' || course.difficulty.toLowerCase() === selectedDifficulty;
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.skill.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.provider.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDiff && matchesSearch;
  });

  const handleRequestCourse = (course: any) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Learning & Upskilling Catalog</h1>
        <p className="text-slate-400 text-xs mt-1">
          Discover company-sponsored technical courses, certification bootcamps, and request enrollment approval from your Team Leader.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses by title, skill (e.g. MLOps, Kubernetes), or academy..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800/60 border border-slate-700/60 rounded-2xl text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex space-x-2">
          {['all', 'beginner', 'intermediate', 'advanced'].map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDifficulty(d)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-xl capitalize transition border ${
                selectedDifficulty === d
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                  : 'bg-slate-800/70 text-slate-300 border-slate-700/60 hover:bg-slate-700'
              }`}
            >
              {d === 'all' ? 'All Levels' : d}
            </button>
          ))}
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCourses.map((course) => {
          const isCompleted = currentUser.learningHistory.completedCourses.some((c) => c.id === course.id);
          const isCurrent = currentUser.learningHistory.currentLearning.some((c) => c.id === course.id);

          return (
            <div
              key={course.id}
              className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700/60 hover:border-indigo-500/50 transition duration-200 flex flex-col justify-between space-y-4 shadow-lg backdrop-blur-sm"
            >
              <div className="space-y-3 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                    {course.difficulty}
                  </span>
                  <div className="flex items-center space-x-1 text-amber-400 font-bold text-[11px]">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{course.rating}</span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-white leading-snug">{course.title}</h3>
                <div className="text-[11px] text-slate-400">{course.provider}</div>

                <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-3">
                  {course.description}
                </p>

                <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1 text-[11px]">
                  <div className="text-indigo-300 font-semibold">Target Skill: {course.skill}</div>
                  <div className="text-slate-400 text-[10px]">{course.expectedImprovement}</div>
                </div>

                <div className="flex items-center justify-between text-slate-400 text-[11px] pt-1">
                  <span className="flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1 text-slate-500" /> {course.duration}
                  </span>
                  <span className="flex items-center">
                    <Users className="w-3.5 h-3.5 mr-1 text-slate-500" /> {course.enrolledCount} enrolled
                  </span>
                </div>
              </div>

              {isCompleted ? (
                <div className="w-full py-2.5 bg-emerald-500/20 text-emerald-300 font-semibold text-xs rounded-xl border border-emerald-500/30 text-center flex items-center justify-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Completed Course</span>
                </div>
              ) : isCurrent ? (
                <div className="w-full py-2.5 bg-indigo-600/30 text-indigo-300 font-semibold text-xs rounded-xl border border-indigo-500/40 text-center flex items-center justify-center space-x-1.5">
                  <BookOpen className="w-4 h-4 animate-pulse" />
                  <span>Currently Enrolled (65%)</span>
                </div>
              ) : (
                <button
                  onClick={() => handleRequestCourse(course)}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl transition shadow-md shadow-indigo-600/30 flex items-center justify-center space-x-2"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Request Course Approval</span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Interactive Modal */}
      {selectedCourse && (
        <RequestModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          defaultType="course"
          targetId={selectedCourse.id}
          targetTitle={selectedCourse.title}
          targetSkillOrRole={selectedCourse.skill}
        />
      )}
    </div>
  );
};
