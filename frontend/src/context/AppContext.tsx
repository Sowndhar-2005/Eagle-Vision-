import React, { createContext, useContext, useState } from 'react';
import {
  EmployeeProfile,
  Team,
  CompanyProject,
  Course,
  DevelopmentRequest,
  OpportunityItem,
  AppNotification,
  UserRole,
  SkillItem,
  DevelopingSkillItem,
  ProjectHistoryItem,
  ExperienceItem,
  CurrentWorkDetail,
} from '../types';
import {
  mockEmployees,
  mockTeams,
  mockCompanyProjects,
  mockCourses,
  mockOpportunities,
  mockRequests,
  mockNotifications,
} from '../data/mockData';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface AppContextType {
  currentUser: EmployeeProfile;
  currentRole: UserRole;
  allEmployees: EmployeeProfile[];
  allTeams: Team[];
  allProjects: CompanyProject[];
  allCourses: Course[];
  allOpportunities: OpportunityItem[];
  requests: DevelopmentRequest[];
  notifications: AppNotification[];
  toasts: ToastMessage[];
  switchUser: (employeeId: string) => void;
  setRole: (role: UserRole) => void;
  submitRequest: (request: Omit<DevelopmentRequest, 'id' | 'createdAt' | 'status'>) => void;
  updateRequestStatus: (requestId: string, status: 'approved' | 'rejected', reviewerNotes?: string) => void;
  createProject: (project: Omit<CompanyProject, 'id' | 'members'>) => void;
  addTeamMember: (projectId: string, employeeId: string, role: string, allocation?: string) => void;
  removeTeamMember: (projectId: string, employeeId: string) => void;
  updateEmployeeProfile: (updatedProfile: Partial<EmployeeProfile>) => void;
  updateSummary: (summary: string) => void;
  addOrUpdateSkill: (skill: SkillItem) => void;
  removeSkill: (skillId: string) => void;
  addDevelopingSkill: (devSkill: DevelopingSkillItem) => void;
  removeDevelopingSkill: (devSkillId: string) => void;
  addOrUpdateProject: (project: ProjectHistoryItem) => void;
  addOrUpdateExperience: (experience: ExperienceItem) => void;
  updateCurrentWork: (currentWork: CurrentWorkDetail) => void;
  ingestResumeData: (data: { skills: string[]; detectedExperience: string; topTech: string[] }) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  addToast: (title: string, description?: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allEmployees, setAllEmployees] = useState<EmployeeProfile[]>(mockEmployees);
  const [currentUser, setCurrentUser] = useState<EmployeeProfile>(mockEmployees[0]); // Jane Doe by default
  const [currentRole, setCurrentRole] = useState<UserRole>('employee');
  const [allTeams] = useState<Team[]>(mockTeams);
  const [allProjects, setAllProjects] = useState<CompanyProject[]>(mockCompanyProjects);
  const [allCourses] = useState<Course[]>(mockCourses);
  const [allOpportunities, setAllOpportunities] = useState<OpportunityItem[]>(mockOpportunities);
  const [requests, setRequests] = useState<DevelopmentRequest[]>(mockRequests);
  const [notifications, setNotifications] = useState<AppNotification[]>(mockNotifications);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (
    title: string,
    description?: string,
    type: 'success' | 'info' | 'warning' | 'error' = 'success'
  ) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const switchUser = (employeeId: string) => {
    const found = allEmployees.find((e) => e.id === employeeId);
    if (found) {
      setCurrentUser(found);
      if (found.personaTitle === 'Team Leader') {
        setCurrentRole('team_leader');
      } else {
        setCurrentRole('employee');
      }
    }
  };

  const setRole = (role: UserRole) => {
    setCurrentRole(role);
    if (role === 'team_leader' && currentUser.personaTitle !== 'Team Leader') {
      const tl = allEmployees.find((e) => e.personaTitle === 'Team Leader');
      if (tl) setCurrentUser(tl);
    } else if (role === 'employee' && currentUser.personaTitle === 'Team Leader') {
      const emp = allEmployees.find((e) => e.personaTitle !== 'Team Leader');
      if (emp) setCurrentUser(emp);
    }
  };

  const updateSummary = (newSummary: string) => {
    const updated = { ...currentUser, professionalSummary: newSummary };
    setCurrentUser(updated);
    setAllEmployees((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    addToast('Summary Updated', 'Professional About summary saved successfully.', 'success');
  };

  const addOrUpdateSkill = (skill: SkillItem) => {
    const exists = currentUser.skills.some((s) => s.id === skill.id || s.name.toLowerCase() === skill.name.toLowerCase());
    let newSkills: SkillItem[];
    if (exists) {
      newSkills = currentUser.skills.map((s) =>
        s.id === skill.id || s.name.toLowerCase() === skill.name.toLowerCase() ? skill : s
      );
    } else {
      newSkills = [...currentUser.skills, skill];
    }
    const updated = { ...currentUser, skills: newSkills };
    setCurrentUser(updated);
    setAllEmployees((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    addToast('Skill Saved', `Updated ${skill.name} (${skill.levelLabel}) in your profile.`, 'success');
  };

  const removeSkill = (skillId: string) => {
    const updated = { ...currentUser, skills: currentUser.skills.filter((s) => s.id !== skillId) };
    setCurrentUser(updated);
    setAllEmployees((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    addToast('Skill Removed', 'Skill removed from your profile.', 'info');
  };

  const addDevelopingSkill = (devSkill: DevelopingSkillItem) => {
    const exists = currentUser.skillsDeveloping.some((s) => s.id === devSkill.id || s.name.toLowerCase() === devSkill.name.toLowerCase());
    let newDevSkills: DevelopingSkillItem[];
    if (exists) {
      newDevSkills = currentUser.skillsDeveloping.map((s) =>
        s.id === devSkill.id || s.name.toLowerCase() === devSkill.name.toLowerCase() ? devSkill : s
      );
    } else {
      newDevSkills = [...currentUser.skillsDeveloping, devSkill];
    }
    const updated = { ...currentUser, skillsDeveloping: newDevSkills };
    setCurrentUser(updated);
    setAllEmployees((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    addToast('Developing Skill Added', `${devSkill.name} added to your learning goals.`, 'success');
  };

  const removeDevelopingSkill = (devSkillId: string) => {
    const updated = { ...currentUser, skillsDeveloping: currentUser.skillsDeveloping.filter((s) => s.id !== devSkillId) };
    setCurrentUser(updated);
    setAllEmployees((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    addToast('Goal Removed', 'Skill removed from developing track.', 'info');
  };

  const addOrUpdateProject = (project: ProjectHistoryItem) => {
    const exists = currentUser.projects.some((p) => p.id === project.id);
    let newProjects: ProjectHistoryItem[];
    if (exists) {
      newProjects = currentUser.projects.map((p) => (p.id === project.id ? project : p));
    } else {
      newProjects = [project, ...currentUser.projects];
    }
    const updated = { ...currentUser, projects: newProjects };
    setCurrentUser(updated);
    setAllEmployees((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    addToast('Project Saved', `Project "${project.name}" updated on your profile.`, 'success');
  };

  const addOrUpdateExperience = (exp: ExperienceItem) => {
    const exists = currentUser.experience.some((e) => e.id === exp.id);
    let newExp: ExperienceItem[];
    if (exists) {
      newExp = currentUser.experience.map((e) => (e.id === exp.id ? exp : e));
    } else {
      newExp = [exp, ...currentUser.experience];
    }
    const updated = { ...currentUser, experience: newExp };
    setCurrentUser(updated);
    setAllEmployees((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    addToast('Experience Saved', `Work experience "${exp.role}" saved.`, 'success');
  };

  const updateCurrentWork = (currentWork: CurrentWorkDetail) => {
    const updated = { ...currentUser, currentWork };
    setCurrentUser(updated);
    setAllEmployees((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    addToast('Current Work Updated', 'Active sprint tasks and responsibilities updated.', 'success');
  };

  const submitRequest = (data: Omit<DevelopmentRequest, 'id' | 'createdAt' | 'status'>) => {
    const newReq: DevelopmentRequest = {
      ...data,
      id: `req-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setRequests((prev) => [newReq, ...prev]);

    // Also notify Team Leader
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: `New ${data.type === 'course' ? 'Course' : 'Project'} Request`,
      message: `${currentUser.name} requested approval for "${data.targetTitle}".`,
      type: 'system',
      read: false,
      timestamp: 'Just now',
      actionUrl: '/tl/requests',
    };
    setNotifications((prev) => [newNotif, ...prev]);
    addToast('Request Submitted', `Your ${data.type} request has been sent to Team Leader: ${currentUser.teamLeaderName}.`, 'success');
  };

  const updateRequestStatus = (requestId: string, status: 'approved' | 'rejected', reviewerNotes?: string) => {
    setRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          const updated: DevelopmentRequest = {
            ...req,
            status,
            reviewedAt: new Date().toISOString(),
            reviewedBy: currentUser.name,
            reviewerNotes: reviewerNotes || (status === 'approved' ? 'Approved by Team Leader' : 'Declined at this time'),
          };

          const targetEmp = allEmployees.find((e) => e.id === req.requesterId);
          if (targetEmp) {
            const notif: AppNotification = {
              id: `notif-${Date.now()}`,
              title: status === 'approved' ? 'Request Approved' : 'Request Declined',
              message: `${currentUser.name} ${status} your request for "${req.targetTitle}".`,
              type: status === 'approved' ? 'request_approved' : 'request_rejected',
              read: false,
              timestamp: 'Just now',
              actionUrl: req.type === 'course' ? '/learning' : '/projects',
            };
            setNotifications((n) => [notif, ...n]);
          }

          return updated;
        }
        return req;
      })
    );

    addToast(
      status === 'approved' ? 'Request Approved' : 'Request Declined',
      `Updated status for request #${requestId}`,
      status === 'approved' ? 'success' : 'warning'
    );
  };

  const createProject = (projectData: Omit<CompanyProject, 'id' | 'members'>) => {
    const newProject: CompanyProject = {
      ...projectData,
      id: `proj-${Date.now()}`,
      members: [
        {
          employeeId: currentUser.id,
          name: currentUser.name,
          role: 'Project Sponsor / Lead',
          avatar: currentUser.avatar,
          allocation: '20%',
        },
      ],
    };
    setAllProjects((prev) => [newProject, ...prev]);

    const opp: OpportunityItem = {
      id: `opp-proj-${newProject.id}`,
      title: newProject.name,
      team: newProject.teamName,
      teamId: newProject.teamId,
      teamLeaderName: newProject.teamLeaderName,
      department: 'Engineering & Innovation',
      location: 'Internal Team Project',
      isRemote: true,
      type: 'project',
      matchScore: 88,
      description: newProject.description,
      duration: newProject.duration,
      requiredSkills: newProject.requiredSkills,
      preferredSkills: newProject.preferredSkills,
      matchExplanation: {
        matchedSkills: newProject.requiredSkills.slice(0, 2),
        developingSkills: newProject.requiredSkills.slice(2, 3),
        missingSkills: newProject.requiredSkills.slice(3),
        rationale: 'Created by Team Leader for internal collaborative staffing.',
      },
    };
    setAllOpportunities((prev) => [opp, ...prev]);
    addToast('Project Created', `"${projectData.name}" has been published and added to talent discovery.`, 'success');
  };

  const addTeamMember = (projectId: string, employeeId: string, role: string, allocation = '20% Gig') => {
    const targetEmp = allEmployees.find((e) => e.id === employeeId);
    if (!targetEmp) return;

    setAllProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          const already = p.members.some((m) => m.employeeId === employeeId);
          if (already) return p;
          return {
            ...p,
            openPositionsCount: Math.max(0, p.openPositionsCount - 1),
            members: [
              ...p.members,
              {
                employeeId: targetEmp.id,
                name: targetEmp.name,
                role,
                avatar: targetEmp.avatar,
                allocation,
              },
            ],
          };
        }
        return p;
      })
    );

    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'Added to Project',
      message: `${currentUser.name} invited you to join the project as "${role}".`,
      type: 'new_project_invite',
      read: false,
      timestamp: 'Just now',
      actionUrl: '/projects',
    };
    setNotifications((n) => [notif, ...n]);
    addToast('Member Assigned', `Assigned ${targetEmp.name} to project.`, 'success');
  };

  const removeTeamMember = (projectId: string, employeeId: string) => {
    setAllProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            openPositionsCount: p.openPositionsCount + 1,
            members: p.members.filter((m) => m.employeeId !== employeeId),
          };
        }
        return p;
      })
    );
    addToast('Member Removed', 'Team member removed from project.', 'info');
  };

  const updateEmployeeProfile = (updatedData: Partial<EmployeeProfile>) => {
    const updated = { ...currentUser, ...updatedData };
    setCurrentUser(updated);
    setAllEmployees((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    addToast('Profile Saved', 'Your professional profile details have been saved.', 'success');
  };

  const ingestResumeData = (data: { skills: string[]; detectedExperience: string; topTech: string[] }) => {
    const newSkills: SkillItem[] = data.skills.map((s, idx) => ({
      id: `sk-ingest-${Date.now()}-${idx}`,
      name: s,
      category: 'AI / Machine Learning',
      proficiency: 85,
      levelLabel: 'Advanced',
      yearsOfExperience: 3,
      evidence: 'Extracted & verified from Resume / InterviewStreet Hiring Agent ingestion.',
      evidenceSource: 'Project Deliverable',
      isVerified: true,
      isTransferable: true,
    }));

    const updatedProfile: EmployeeProfile = {
      ...currentUser,
      profileCompletion: 100,
      skills: [...currentUser.skills, ...newSkills],
    };

    setCurrentUser(updatedProfile);
    setAllEmployees((prev) => prev.map((e) => (e.id === updatedProfile.id ? updatedProfile : e)));
    addToast('Resume Ingested', `Extracted ${data.skills.length} skills & project evidence via InterviewStreet Agent.`, 'success');
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    addToast('Notifications Cleared', 'Marked all notifications as read.', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentRole,
        allEmployees,
        allTeams,
        allProjects,
        allCourses,
        allOpportunities,
        requests,
        notifications,
        toasts,
        switchUser,
        setRole,
        submitRequest,
        updateRequestStatus,
        createProject,
        addTeamMember,
        removeTeamMember,
        updateEmployeeProfile,
        updateSummary,
        addOrUpdateSkill,
        removeSkill,
        addDevelopingSkill,
        removeDevelopingSkill,
        addOrUpdateProject,
        addOrUpdateExperience,
        updateCurrentWork,
        ingestResumeData,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        addToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
