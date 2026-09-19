// Eagle Vision — Centralized HR API Service (Axios)
import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  AuthResponse,
  LoginCredentials,
  HRProject,
  ProjectCreate,
  StructuredRequirement,
  AnalyzeRequirementRequest,
  MatchResponse,
  CandidateDetail,
  CompareResponse,
  DashboardData,
  AnalyticsData,
} from '../types';

const API_BASE =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL) ||
  'http://localhost:8000/api/v1';

class HRApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE,
      headers: { 'Content-Type': 'application/json' },
      timeout: 60000,
    });

    // Attach JWT on every request
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('hr_access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Global error handling
    this.client.interceptors.response.use(
      (res) => res,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('hr_access_token');
          localStorage.removeItem('hr_user');
        }
        return Promise.reject(error);
      }
    );
  }

  // ── Auth ──────────────────────────────────────────────────────────────────
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await this.client.post<AuthResponse>('/hr/auth/login', credentials);
    localStorage.setItem('hr_access_token', data.access_token);
    localStorage.setItem('hr_user', JSON.stringify(data));
    return data;
  }

  logout(): void {
    localStorage.removeItem('hr_access_token');
    localStorage.removeItem('hr_user');
  }

  getStoredUser(): AuthResponse | null {
    const raw = localStorage.getItem('hr_user');
    return raw ? JSON.parse(raw) : null;
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('hr_access_token');
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────
  async getDashboard(): Promise<DashboardData> {
    const { data } = await this.client.get<DashboardData>('/hr/dashboard');
    return data;
  }

  // ── Projects ──────────────────────────────────────────────────────────────
  async createProject(project: ProjectCreate): Promise<HRProject> {
    const { data } = await this.client.post<HRProject>('/hr/projects', project);
    return data;
  }

  async listProjects(): Promise<HRProject[]> {
    const { data } = await this.client.get<HRProject[]>('/hr/projects');
    return data;
  }

  async getProject(projectId: string): Promise<HRProject> {
    const { data } = await this.client.get<HRProject>(`/hr/projects/${projectId}`);
    return data;
  }

  async updateProject(projectId: string, updates: Partial<ProjectCreate>): Promise<any> {
    const { data } = await this.client.put(`/hr/projects/${projectId}`, updates);
    return data;
  }

  // ── Requirement Analysis ──────────────────────────────────────────────────
  async analyzeRequirement(
    projectId: string,
    req: AnalyzeRequirementRequest
  ): Promise<StructuredRequirement> {
    const { data } = await this.client.post<StructuredRequirement>(
      `/hr/projects/${projectId}/analyze`,
      req
    );
    return data;
  }

  async updateRequirement(
    requirementId: string,
    updates: any
  ): Promise<StructuredRequirement> {
    const { data } = await this.client.put<StructuredRequirement>(
      `/hr/requirements/${requirementId}`,
      updates
    );
    return data;
  }

  async publishRequirement(requirementId: string): Promise<any> {
    const { data } = await this.client.post(`/hr/requirements/${requirementId}/publish`);
    return data;
  }

  // ── Talent Matching ───────────────────────────────────────────────────────
  async matchTalent(projectId: string): Promise<MatchResponse> {
    const { data } = await this.client.post<MatchResponse>(`/hr/projects/${projectId}/match`);
    return data;
  }

  async getCandidates(projectId: string): Promise<MatchResponse> {
    const { data } = await this.client.get<MatchResponse>(
      `/hr/projects/${projectId}/candidates`
    );
    return data;
  }

  // ── Candidate Detail ──────────────────────────────────────────────────────
  async getCandidateDetail(
    employeeId: string,
    projectId?: string
  ): Promise<CandidateDetail> {
    const params = projectId ? { project_id: projectId } : {};
    const { data } = await this.client.get<CandidateDetail>(
      `/hr/candidates/${employeeId}`,
      { params }
    );
    return data;
  }

  async assignCandidate(projectId: string, employeeId: string): Promise<any> {
    const { data } = await this.client.post(
      `/hr/projects/${projectId}/assign`,
      { employee_id: employeeId }
    );
    return data;
  }

  // ── Comparison ────────────────────────────────────────────────────────────
  async compareCandidates(
    projectId: string,
    employeeIds: string[]
  ): Promise<CompareResponse> {
    const { data } = await this.client.post<CompareResponse>(
      `/hr/projects/${projectId}/compare`,
      { employee_ids: employeeIds }
    );
    return data;
  }

  // ── Skill Gap ─────────────────────────────────────────────────────────────
  async getSkillGap(projectId: string): Promise<any> {
    const { data } = await this.client.post(`/hr/projects/${projectId}/skill-gap`);
    return data;
  }

  // ── Learning ──────────────────────────────────────────────────────────────
  async getLearningResources(skill?: string): Promise<any[]> {
    const params = skill ? { skill } : {};
    const { data } = await this.client.get('/hr/learning', { params });
    return data;
  }

  // ── Analytics ─────────────────────────────────────────────────────────────
  async getAnalytics(): Promise<AnalyticsData> {
    const { data } = await this.client.get<AnalyticsData>('/hr/analytics');
    return data;
  }

  // ── Settings ──────────────────────────────────────────────────────────────
  async getSettings(): Promise<any> {
    const { data } = await this.client.get('/hr/settings');
    return data;
  }
}

export const hrApi = new HRApiClient();
export default hrApi;
