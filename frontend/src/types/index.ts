export interface User {
  id: string;
  email: string;
  role: 'employee' | 'manager' | 'hr_admin' | 'sys_admin';
}

export interface Skill {
  id: string;
  name: string;
  category?: string;
  proficiency?: number;
  is_verified?: boolean;
  is_transferable?: boolean;
}

export interface Opportunity {
  id: string;
  title: string;
  description: string;
  type: 'role' | 'gig' | 'mentorship' | 'shadowing';
  department: string;
  location: string;
  is_remote: boolean;
  match_score?: number;
}

export interface LearningPath {
  id: string;
  title: string;
  target_role: string;
  estimated_weeks: number;
  status: string;
  progress_percentage: number;
}
