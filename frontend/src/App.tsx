import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppProvider } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';

// Employee Pages
import { EmployeeDashboard } from './pages/employee/EmployeeDashboard';
import { MyProfilePage } from './pages/employee/MyProfilePage';
import { MySkillsPage } from './pages/employee/MySkillsPage';
import { MyExperiencePage } from './pages/employee/MyExperiencePage';
import { MyProjectsPage } from './pages/employee/MyProjectsPage';
import { CurrentWorkPage } from './pages/employee/CurrentWorkPage';
import { OpportunitiesPage } from './pages/employee/OpportunitiesPage';
import { LearningPage } from './pages/employee/LearningPage';
import { SkillGapsPage } from './pages/employee/SkillGapsPage';
import { RequestsPage } from './pages/employee/RequestsPage';
import { AICareerAssistantPage } from './pages/employee/AICareerAssistantPage';

// Team Leader Pages
import { TeamLeaderDashboard } from './pages/team_leader/TeamLeaderDashboard';
import { MyTeamPage } from './pages/team_leader/MyTeamPage';
import { TeamLeaderEmployeesPage } from './pages/team_leader/TeamLeaderEmployeesPage';
import { TeamProjectsPage } from './pages/team_leader/TeamProjectsPage';
import { TalentDiscoveryPage as TLTalentDiscoveryPage } from './pages/team_leader/TalentDiscoveryPage';
import { TeamLeaderRequestsPage } from './pages/team_leader/TeamLeaderRequestsPage';
import { TeamSkillsPage } from './pages/team_leader/TeamSkillsPage';
import { TeamDevelopmentPage } from './pages/team_leader/TeamDevelopmentPage';
import { AITalentAssistantPage } from './pages/team_leader/AITalentAssistantPage';

// HR Module Pages & Layout
import { HRLayout } from './modules/hr/layouts/HRLayout';
import { HRLoginPage } from './modules/hr/pages/HRLoginPage';
import { HRDashboardPage } from './modules/hr/pages/HRDashboardPage';
import { ProjectsPage as HRProjectsPage, CreateProjectPage } from './modules/hr/pages/ProjectsPage';
import { RequirementAnalysisPage } from './modules/hr/pages/RequirementAnalysisPage';
import { TalentDiscoveryPage as HRTalentDiscoveryPage } from './modules/hr/pages/TalentDiscoveryPage';
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
      <AppProvider>
        <Router>
          <Routes>
            {/* HR Auth Route */}
            <Route path="/hr/login" element={<HRLoginPage />} />

            {/* HR Module Authenticated Workspace */}
            <Route path="/hr" element={<HRLayout />}>
              <Route index element={<Navigate to="/hr/dashboard" replace />} />
              <Route path="dashboard" element={<HRDashboardPage />} />
              <Route path="projects" element={<HRProjectsPage />} />
              <Route path="projects/new" element={<CreateProjectPage />} />
              <Route path="projects/:projectId" element={<RequirementAnalysisPage />} />
              <Route path="projects/:projectId/analysis" element={<RequirementAnalysisPage />} />
              <Route path="projects/:projectId/candidates" element={<HRTalentDiscoveryPage />} />
              <Route path="projects/:projectId/compare" element={<CandidateComparisonPage />} />
              <Route path="candidates" element={<HRTalentDiscoveryPage />} />
              <Route path="candidates/:employeeId" element={<CandidateDetailPage />} />
              <Route path="analytics" element={<HRAnalyticsPage />} />
            </Route>

            {/* Main Portal Routes wrapped in AppLayout */}
            <Route
              path="/*"
              element={
                <AppLayout>
                  <Routes>
                    {/* Auth Route */}
                    <Route path="/login" element={<LoginPage />} />

                    {/* Employee Routes - PROFILE FIRST */}
                    <Route path="/" element={<MyProfilePage />} />
                    <Route path="/profile" element={<MyProfilePage />} />
                    <Route path="/skills" element={<MySkillsPage />} />
                    <Route path="/experience" element={<MyExperiencePage />} />
                    <Route path="/projects" element={<MyProjectsPage />} />
                    <Route path="/current-work" element={<CurrentWorkPage />} />
                    <Route path="/learning" element={<LearningPage />} />
                    <Route path="/skill-gaps" element={<SkillGapsPage />} />
                    <Route path="/opportunities" element={<OpportunitiesPage />} />
                    <Route path="/requests" element={<RequestsPage />} />
                    <Route path="/ai-assistant" element={<AICareerAssistantPage />} />
                    <Route path="/dashboard" element={<EmployeeDashboard />} />

                    {/* Team Leader Routes */}
                    <Route path="/tl/dashboard" element={<TeamLeaderDashboard />} />
                    <Route path="/tl/team" element={<MyTeamPage />} />
                    <Route path="/tl/employees" element={<TeamLeaderEmployeesPage />} />
                    <Route path="/tl/projects" element={<TeamProjectsPage />} />
                    <Route path="/tl/talent-discovery" element={<TLTalentDiscoveryPage />} />
                    <Route path="/tl/requests" element={<TeamLeaderRequestsPage />} />
                    <Route path="/tl/team-skills" element={<TeamSkillsPage />} />
                    <Route path="/tl/development" element={<TeamDevelopmentPage />} />
                    <Route path="/tl/ai-assistant" element={<AITalentAssistantPage />} />

                    {/* Fallback route */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </AppLayout>
              }
            />
          </Routes>
        </Router>
      </AppProvider>
    </QueryClientProvider>
  );
};

export default App;
