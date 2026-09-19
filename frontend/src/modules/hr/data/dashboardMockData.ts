// Eagle Vision — HR Dashboard Isolated Presentation & Mock Data
import type {
  DashboardKPIData,
  DashboardProjectItem,
  TalentInsightsData,
  HRUserData,
} from '../types/dashboard';

export const dashboardStats: DashboardKPIData = {
  activeProjects: 12,
  activeProjectsChange: '+3 this month',
  openRequirements: 7,
  openRequirementsDetail: '4 in analysis',
  internalMatches: 46,
  internalMatchesChange: '+14% mobility',
  criticalSkillGaps: 9,
  criticalSkillGapsDetail: 'Across 4 divisions',
};

export const recentProjectsMock: DashboardProjectItem[] = [
  {
    id: 'proj-001',
    name: 'AI Talent Discovery Platform',
    department: 'Engineering',
    requiredRole: 'Senior Backend AI Developer',
    candidateCount: 8,
    status: 'Active',
    createdAt: '18 Sep 2026',
  },
  {
    id: 'proj-002',
    name: 'Semantic Skill Vector Graph',
    department: 'Data & AI',
    requiredRole: 'MLOps & Graph Engineer',
    candidateCount: 5,
    status: 'Active',
    createdAt: '17 Sep 2026',
  },
  {
    id: 'proj-003',
    name: 'Enterprise Cloud Migration',
    department: 'Operations & DevOps',
    requiredRole: 'Cloud Infrastructure Architect',
    candidateCount: 3,
    status: 'Analysis',
    createdAt: '15 Sep 2026',
  },
  {
    id: 'proj-004',
    name: 'Mobile Client Architecture V2',
    department: 'Product & Mobile',
    requiredRole: 'Lead React Native Engineer',
    candidateCount: 6,
    status: 'Active',
    createdAt: '12 Sep 2026',
  },
  {
    id: 'proj-005',
    name: 'Real-Time Analytics Pipeline',
    department: 'Data & AI',
    requiredRole: 'Streaming Data Specialist',
    candidateCount: 2,
    status: 'Draft',
    createdAt: '10 Sep 2026',
  },
  {
    id: 'proj-006',
    name: 'Internal Mobility Assessment',
    department: 'Human Resources',
    requiredRole: 'People Analytics Lead',
    candidateCount: 4,
    status: 'Completed',
    createdAt: '01 Sep 2026',
  },
];

export const talentInsightsMock: TalentInsightsData = {
  topInternalSkills: [
    { skill: 'Python', count: 84, detail: '84 employees' },
    { skill: 'SQL & Database Design', count: 72, detail: '72 employees' },
    { skill: 'React & TypeScript', count: 61, detail: '61 employees' },
    { skill: 'Machine Learning & PyTorch', count: 45, detail: '45 employees' },
    { skill: 'FastAPI & REST APIs', count: 38, detail: '38 employees' },
  ],
  mostRequestedSkills: [
    { skill: 'FastAPI Microservices', count: 18, detail: '18 open roles' },
    { skill: 'Vector Databases / RAG', count: 14, detail: '14 open roles' },
    { skill: 'Kubernetes Multi-Cluster', count: 12, detail: '12 open roles' },
    { skill: 'Distributed Systems', count: 9, detail: '9 open roles' },
    { skill: 'GraphQL APIs', count: 7, detail: '7 open roles' },
  ],
  criticalSkillGaps: [
    { skill: 'Rust Systems Programming', deficitCount: 5, severity: 'High' },
    { skill: 'LLM Fine-Tuning & Quantization', deficitCount: 7, severity: 'Critical' },
    { skill: 'Distributed Consensus (Raft)', deficitCount: 4, severity: 'Medium' },
    { skill: 'Zero-Trust Cloud Architecture', deficitCount: 6, severity: 'High' },
  ],
};

export const defaultHRUser: HRUserData = {
  fullName: 'Sarah Jenkins',
  role: 'Senior Talent Lead',
  email: 'sarah.jenkins@eaglevision.ai',
  avatarInitials: 'SJ',
};
