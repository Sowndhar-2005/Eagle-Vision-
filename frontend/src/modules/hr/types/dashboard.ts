// Eagle Vision — HR Dashboard Type Definitions

export interface DashboardKPIData {
  activeProjects: number;
  activeProjectsChange?: string;
  openRequirements: number;
  openRequirementsDetail?: string;
  internalMatches: number;
  internalMatchesChange?: string;
  criticalSkillGaps: number;
  criticalSkillGapsDetail?: string;
}

export interface DashboardProjectItem {
  id: string;
  name: string;
  department: string;
  requiredRole: string;
  candidateCount: number;
  status: 'Active' | 'Analysis' | 'Draft' | 'Completed';
  createdAt: string;
}

export interface SkillStatItem {
  skill: string;
  count: number;
  detail?: string;
}

export interface SkillGapItem {
  skill: string;
  deficitCount: number;
  severity: 'Critical' | 'High' | 'Medium';
}

export interface TalentInsightsData {
  topInternalSkills: SkillStatItem[];
  mostRequestedSkills: SkillStatItem[];
  criticalSkillGaps: SkillGapItem[];
}

export interface HRUserData {
  fullName: string;
  role: string;
  email: string;
  avatarInitials: string;
}
