import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { SkillsGraphPage } from './pages/SkillsGraphPage';
import { OpportunitiesPage } from './pages/OpportunitiesPage';
import { LearningPage } from './pages/LearningPage';
import { ProfilePage } from './pages/ProfilePage';

const queryClient = new QueryClient();

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
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
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
