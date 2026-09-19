// Eagle Vision — Dedicated HR Dashboard Page
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { HRDashboardHeader } from '../components/HRDashboardHeader';
import { HRKpiCards } from '../components/HRKpiCards';
import { QuickActions } from '../components/QuickActions';
import { RecentProjects } from '../components/RecentProjects';
import { TalentInsights } from '../components/TalentInsights';
import {
  dashboardStats,
  recentProjectsMock,
  talentInsightsMock,
  defaultHRUser,
} from '../data/dashboardMockData';
import { hrApi } from '../services/hrApi';
import type {
  DashboardKPIData,
  DashboardProjectItem,
  TalentInsightsData,
  HRUserData,
} from '../types/dashboard';

export const HRDashboardPage: React.FC = () => {
  const { data: apiData } = useQuery({
    queryKey: ['hr-dashboard'],
    queryFn: async () => {
      try {
        return await hrApi.getDashboard();
      } catch {
        return null;
      }
    },
    staleTime: 1000 * 60 * 2,
    retry: false,
  });

  // Reconcile data from API or isolated mock
  const stats: DashboardKPIData = apiData?.kpis
    ? {
        activeProjects: apiData.kpis.active_projects ?? dashboardStats.activeProjects,
        activeProjectsChange: dashboardStats.activeProjectsChange,
        openRequirements: apiData.kpis.open_requirements ?? dashboardStats.openRequirements,
        openRequirementsDetail: dashboardStats.openRequirementsDetail,
        internalMatches: apiData.kpis.total_matches ?? dashboardStats.internalMatches,
        internalMatchesChange: dashboardStats.internalMatchesChange,
        criticalSkillGaps: apiData.kpis.critical_skill_gaps ?? dashboardStats.criticalSkillGaps,
        criticalSkillGapsDetail: dashboardStats.criticalSkillGapsDetail,
      }
    : dashboardStats;

  const recentProjects: DashboardProjectItem[] =
    apiData?.recent_projects && apiData.recent_projects.length > 0
      ? apiData.recent_projects.map((p: any) => ({
          id: p.id,
          name: p.name,
          department: p.department,
          requiredRole: p.name,
          candidateCount: p.candidate_count || 0,
          status: (p.status === 'active'
            ? 'Active'
            : p.status === 'completed'
            ? 'Completed'
            : p.status === 'analysis'
            ? 'Analysis'
            : 'Draft') as DashboardProjectItem['status'],
          createdAt: p.created_at ? new Date(p.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '18 Sep 2026',
        }))
      : recentProjectsMock;

  const talentInsights: TalentInsightsData = talentInsightsMock;

  const storedUser = hrApi.getStoredUser();
  const currentUser: HRUserData = storedUser
    ? {
        fullName: storedUser.full_name || 'HR Specialist',
        role: storedUser.role.replace('_', ' ').toUpperCase(),
        email: storedUser.email,
        avatarInitials: storedUser.full_name ? storedUser.full_name[0] : 'HR',
      }
    : defaultHRUser;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <HRDashboardHeader user={currentUser} />

      {/* KPI Metric Cards */}
      <HRKpiCards stats={stats} />

      {/* Quick Action Navigation Buttons */}
      <QuickActions />

      {/* Two Columns / Sections: Recent Projects & Talent Insights */}
      <div className="space-y-6">
        {/* Recent Projects Table */}
        <RecentProjects projects={recentProjects} />

        {/* Talent Intelligence & Skill Gap Section */}
        <TalentInsights insights={talentInsights} />
      </div>
    </div>
  );
};

export default HRDashboardPage;
