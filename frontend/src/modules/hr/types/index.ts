// Eagle Vision — HR Module TypeScript Types

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user_id: string;
  email: string;
  full_name: string | null;
  role: string;
}

export interface HRProject {
  id: string;
  name: string;
  department: string;
  description: string | null;
  business_objective: string | null;
  duration_months: number | null;
  location: string | null;
  work_mode: string;
  headcount: number;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
  candidate_count: number;
  requirement_status: string | null;
  requirement?: StructuredRequirement | null;
}

export interface ProjectCreate {
  name: string;
  department: string;
  description?: string;
  business_objective?: string;
  duration_months?: number;
  location?: string;
  work_mode?: string;
  headcount?: number;
  priority?: string;
}

export interface RequiredSkill {
  name: string;
  level: string;
  importance: string;
}

export interface ProjectRole {
  title: string;
  headcount: number;
}

export interface RequirementConstraints {
  duration_months: number | null;
  work_mode: string;
  location: string | null;
}

export interface StructuredRequirement {
  id: string;
  project_id: string;
  raw_description: string;
  status: string;
  project_title: string | null;
  roles: ProjectRole[];
  required_skills: RequiredSkill[];
  preferred_skills: string[];
  experience_years: number | null;
  responsibilities: string[];
  constraints: RequirementConstraints | null;
  analyzed_at: string | null;
  published_at: string | null;
  created_at: string;
}

export interface AnalyzeRequirementRequest {
  raw_description: string;
  project_name?: string;
  department?: string;
  duration_months?: number;
  headcount?: number;
}

export interface CandidateMatch {
  employee_id: string;
  full_name: string;
  job_title: string;
  department: string;
  years_of_experience: number;
  overall_score: number;
  required_skill_score: number;
  semantic_score: number;
  experience_score: number;
  proficiency_score: number;
  preferred_skill_score: number;
  matched_skills: string[];
  skill_gaps: string[];
  partial_matches?: { required: string; employee_has: string }[];
  explanation: string;
  rank?: number;
  skills?: EmployeeSkillInfo[];
}

export interface EmployeeSkillInfo {
  name: string;
  proficiency_level: number;
  years_of_experience: number;
  skill_id?: string;
  is_verified?: boolean;
}

export interface CandidateDetail {
  employee_id: string;
  full_name: string;
  first_name: string;
  last_name: string;
  job_title: string;
  department: string;
  location: string;
  bio: string | null;
  years_of_experience: number;
  open_to_remote: boolean;
  open_to_gigs: boolean;
  skills: EmployeeSkillInfo[];
  work_experiences: any[];
  educations: any[];
  match_analysis: MatchAnalysis | null;
  learning_recommendations: LearningRecommendation[];
}

export interface MatchAnalysis {
  overall_score: number;
  required_skill_score: number;
  semantic_score: number;
  experience_score: number;
  proficiency_score: number;
  preferred_skill_score: number;
  matched_skills: string[];
  skill_gaps: string[];
  partial_matches?: { required: string; employee_has: string }[];
  explanation: string;
}

export interface LearningRecommendation {
  skill?: string;
  skill_name?: string;
  course_title: string;
  provider?: string;
  duration_hours?: number;
  estimated_weeks?: number;
  level?: string;
  priority?: string;
  reason?: string;
  url?: string;
}

export interface DashboardKPIs {
  active_projects: number;
  open_requirements: number;
  total_matches: number;
  critical_skill_gaps: number;
}

export interface SkillInsight {
  skill_name: string;
  count: number;
  trend: string;
}

export interface DashboardData {
  kpis: DashboardKPIs;
  recent_projects: HRProject[];
  top_internal_skills: SkillInsight[];
  most_requested_skills: SkillInsight[];
  critical_gaps: SkillInsight[];
  employees_ready_for_mobility: number;
}

export interface MatchResponse {
  project_id: string;
  candidates?: CandidateMatch[];
  matches?: CandidateMatch[];
  count?: number;
}

export interface CompareResponse {
  project_id: string;
  candidates: CandidateMatch[];
}

export interface AnalyticsData {
  total_employees: number;
  total_skills?: number;
  total_projects: number;
  active_projects?: number;
  mobility_rate?: number;
  avg_match_score: number;
  skill_distribution?: { name: string; count: number }[];
  department_distribution?: { name?: string; department?: string; count: number; readiness?: number }[];
  top_skill_gaps?: { skill: string; count: number }[];
  skill_shortages?: { skill: string; count: number; severity: string }[];
  top_in_demand_skills?: { skill: string; demand_count: number; supply_count: number }[];
}
