import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { SkillsGraphPage } from './pages/SkillsGraphPage';
import { OpportunitiesPage } from './pages/OpportunitiesPage';
import { LearningPage } from './pages/LearningPage';
import { ProfilePage } from './pages/ProfilePage';

// HR Module Pages & Layout
import { HRLayout } from './modules/hr/layouts/HRLayout';
import { HRLoginPage } from './modules/hr/pages/HRLoginPage';
import { HRDashboardPage } from './modules/hr/pages/HRDashboardPage';
import { ProjectsPage, CreateProjectPage } from './modules/hr/pages/ProjectsPage';
import { RequirementAnalysisPage } from './modules/hr/pages/RequirementAnalysisPage';
import { TalentDiscoveryPage } from './modules/hr/pages/TalentDiscoveryPage';
import { CandidateDetailPage } from './modules/hr/pages/CandidateDetailPage';
import { CandidateComparisonPage } from './modules/hr/pages/CandidateComparisonPage';
import { HRAnalyticsPage } from './modules/hr/pages/HRAnalyticsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 2, // 2 minutes
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* HR Auth Route */}
          <Route path="/hr/login" element={<HRLoginPage />} />

          {/* HR Module Authenticated Workspace */}
          <Route path="/hr" element={<HRLayout />}>
            <Route index element={<Navigate to="/hr/dashboard" replace />} />
            <Route path="dashboard" element={<HRDashboardPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="projects/new" element={<CreateProjectPage />} />
            <Route path="projects/:projectId" element={<RequirementAnalysisPage />} />
            <Route path="projects/:projectId/analysis" element={<RequirementAnalysisPage />} />
            <Route path="projects/:projectId/candidates" element={<TalentDiscoveryPage />} />
            <Route path="projects/:projectId/compare" element={<CandidateComparisonPage />} />
            <Route path="candidates" element={<TalentDiscoveryPage />} />
            <Route path="candidates/:employeeId" element={<CandidateDetailPage />} />
            <Route path="analytics" element={<HRAnalyticsPage />} />
          </Route>

          {/* Employee Workspace / Default App */}
          <Route
            path="/*"
            element={
              <div className="flex flex-col min-h-screen bg-slate-900 text-slate-100">
                <Navbar />
                <div className="flex flex-1">
                  <Sidebar />
                  <main className="flex-1 p-8 overflow-y-auto max-w-7xl mx-auto w-full">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/skills" element={<SkillsGraphPage />} />
                      <Route path="/opportunities" element={<OpportunitiesPage />} />
                      <Route path="/learning" element={<LearningPage />} />
                      <Route path="/profile" element={<ProfilePage />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </main>
                </div>
              </div>
            }
          />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
