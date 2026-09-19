export type UserRole = 'employee' | 'team_leader';

export type EmployeePersona = 'new_employee' | 'growth_employee' | 'opportunity_employee';

export interface SkillItem {
  id: string;
  name: string;
  category: 'AI / Machine Learning' | 'Backend & Systems' | 'Frontend & UI' | 'Cloud & DevOps' | 'Data & Analytics' | 'Architecture & Design' | 'Soft Skills';
  proficiency: number; // 1 to 100 percentage
  levelLabel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  yearsOfExperience: number;
  evidence: string;
  evidenceSource?: 'GitHub Production Commit' | 'Code Review' | 'Project Deliverable' | 'Course Certification' | 'Self-Reported';
  isVerified: boolean;
  isTransferable: boolean;
}

export interface DevelopingSkillItem {
  id: string;
  name: string;
  category: string;
  status: 'Learning' | 'Developing' | 'Beginner' | 'Target';
  progressPercentage: number;
  targetRoleRelevance: string;
  associatedCourseOrGig?: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  team: string;
  duration: string;
  startDate: string;
  endDate: string;
  responsibilities: string[];
  skillsUsed: string[];
  achievements?: string[];
}

export interface ProjectHistoryItem {
  id: string;
  name: string;
  description: string;
  role: string;
  team: string;
  technologies: string[];
  responsibilities: string[];
  startDate: string;
  endDate: string;
  status: 'current' | 'completed' | 'in_progress' | 'cross_team';
  skillsDemonstrated: string[];
  achievements?: string[];
  projectOutcome?: string;
}

export interface CurrentWorkDetail {
  projectName: string;
  role: string;
  team: string;
  teamLeaderName: string;
  sprintPeriod: string;
  status: string;
  responsibilities: string[];
  currentTasks: string[];
  skillsBeingUsed: string[];
  skillsCurrentlyDeveloping: string[];
  blockers?: string;
}

export interface LearningHistory {
  completedCourses: Array<{
    id: string;
    title: string;
    provider: string;
    completionDate: string;
    skillsGained: string[];
  }>;
  certifications: Array<{
    id: string;
    name: string;
    issuer: string;
    issueDate: string;
    credentialUrl?: string;
  }>;
  currentLearning: Array<{
    id: string;
    title: string;
    provider: string;
    progressPercentage: number;
    targetSkill: string;
  }>;
  requestedCourses: Array<{
    id: string;
    title: string;
    status: 'pending' | 'approved' | 'rejected';
    requestDate: string;
  }>;
}

export interface GitHubEvidence {
  profileUrl: string;
  username: string;
  repositories: Array<{
    name: string;
    stars: number;
    detectedTech: string[];
    description: string;
  }>;
  commitsThisMonth: number;
  topLanguages: string[];
}

export interface CareerAspiration {
  currentRole: string;
  targetRole: string;
  readinessScore: number;
  strongSkills: string[];
  developingSkills: string[];
  missingSkills: string[];
}

export interface MobilityPreferences {
  openToGigs: boolean;
  openToTransfer: boolean;
  openToMentorship: boolean;
  preferredRoles: string[];
  remotePreference: 'remote' | 'hybrid' | 'onsite';
}

export interface EmployeeProfile {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  avatar: string;
  title: string;
  personaTitle: string; // e.g. "Growth-Seeking Employee", "New Employee (Onboarding)", "Opportunity-Seeking Employee"
  personaType: EmployeePersona;
  department: string;
  teamId: string;
  teamName: string;
  teamLeaderId: string;
  teamLeaderName: string;
  location: string;
  joiningDate: string;
  yearsOfExperience: string;
  employmentStatus: 'Active' | 'On Leave' | 'Sabbatical';
  profileCompletion: number;
  professionalSummary: string;
  skills: SkillItem[];
  skillsDeveloping: DevelopingSkillItem[];
  experience: ExperienceItem[];
  projects: ProjectHistoryItem[];
  currentWork: CurrentWorkDetail;
  learningHistory: LearningHistory;
  githubEvidence: GitHubEvidence;
  careerAspiration: CareerAspiration;
  mobilityPreferences: MobilityPreferences;
  availability: '100% Allocated' | '20% Gig Available' | 'On Bench / Available';
}

export interface Team {
  id: string;
  name: string;
  department: string;
  leaderId: string;
  leaderName: string;
  description: string;
  memberCount: number;
  activeProjectsCount: number;
}

export interface ProjectMember {
  employeeId: string;
  name: string;
  role: string;
  avatar: string;
  allocation: string; // e.g. "100%" or "20% Gig"
}

export interface CompanyProject {
  id: string;
  name: string;
  description: string;
  teamId: string;
  teamName: string;
  teamLeaderId: string;
  teamLeaderName: string;
  status: 'planning' | 'active' | 'recruiting' | 'completed';
  duration: string;
  startDate: string;
  endDate: string;
  requiredSkills: string[];
  preferredSkills: string[];
  availableRoles: string[];
  members: ProjectMember[];
  openPositionsCount: number;
  matchScoreForCurrentUser?: number;
  missingSkillsForCurrentUser?: string[];
}

export interface Course {
  id: string;
  title: string;
  provider: string;
  skill: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  description: string;
  expectedImprovement: string;
  rating: number;
  isRestricted: boolean;
  enrolledCount: number;
}

export interface DevelopmentRequest {
  id: string;
  type: 'course' | 'project';
  requesterId: string;
  requesterName: string;
  requesterAvatar: string;
  requesterRole: string;
  requesterTeamId: string;
  requesterTeamName: string;
  targetId: string;
  targetTitle: string;
  reason: string;
  desiredRoleOrSkill: string;
  expectedBenefit: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewerNotes?: string;
}

export interface OpportunityItem {
  id: string;
  title: string;
  team: string;
  teamId: string;
  teamLeaderName: string;
  department: string;
  location: string;
  isRemote: boolean;
  type: 'role' | 'gig' | 'project' | 'mentorship';
  matchScore: number;
  description: string;
  duration: string;
  requiredSkills: string[];
  preferredSkills: string[];
  matchExplanation: {
    matchedSkills: string[];
    developingSkills: string[];
    missingSkills: string[];
    rationale: string;
  };
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'request_approved' | 'request_rejected' | 'new_project_invite' | 'skill_verified' | 'course_assigned' | 'system';
  read: boolean;
  timestamp: string;
  actionUrl?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedActions?: Array<{
    label: string;
    actionType: 'navigate' | 'filter' | 'apply';
    payload: string;
  }>;
}
