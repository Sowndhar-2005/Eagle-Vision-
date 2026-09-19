# Eagle Vision — Product Specification

## 1. Project Overview

**Project Name:** Eagle Vision

**Full Name:** Eagle Vision — AI-Powered Talent Discovery & Internal Mobility

**Description:**  
Eagle Vision is an AI-powered talent discovery and internal mobility platform that helps companies understand employee capabilities, identify hidden and transferable skills, match employees with suitable internal roles and projects, detect skill gaps, and support personalized career development.

**Scope:**  
Post-hire employee development and internal mobility inside a company.

### Core Product Journey

Employee joins → onboarding & learning → AI understands capabilities → dynamic skill profile → internal roles/projects → skill-gap analysis → development recommendations → internal mobility → profile continuously updated.

---

# 2. Core User Roles

Eagle Vision has three system roles:

| Role | Primary Goal |
|---|---|
| 👨‍💻 Employee | Develop skills and discover internal opportunities |
| 👨‍💼 Team Leader | Find and shortlist internal talent for roles/projects |
| 🧑‍💼 HR / Talent Manager | Workforce skill intelligence and internal mobility |

## Employee Personas

The Employee role contains three personas:

1. 🌱 New Employee
2. 📈 Growth-Seeking Employee
3. 🎯 Opportunity-Seeking Employee

These are personas within the Employee role, not separate system roles.

---

# 3. User Stories

## 3.1 New Employee

### US-EMP-NEW-01 — Company Onboarding

**As a** New Employee,  
**I want to** complete my company onboarding and provide relevant professional information,  
**so that** Eagle Vision can understand my initial capabilities and career context.

**Acceptance Criteria**
- Employee can complete onboarding information.
- Employee can provide skills, experience, interests, and learning goals.
- Profile information is stored securely.
- Initial employee profile is created.

### US-EMP-NEW-02 — Role-Based Learning

**As a** New Employee,  
**I want to** discover learning resources relevant to my current role,  
**so that** I can build the skills required for my work.

**Acceptance Criteria**
- Learning recommendations are relevant to the employee's role.
- Employee can view recommended learning activities.
- Learning progress can be tracked.

### US-EMP-NEW-03 — Discover Relevant Projects

**As a** New Employee,  
**I want to** discover projects relevant to my skills and role,  
**so that** I can understand available opportunities within the organization.

### US-EMP-NEW-04 — Request Additional Courses

**As a** New Employee,  
**I want to** request additional courses when required,  
**so that** I can develop skills that are not covered by the available learning resources.

### US-EMP-NEW-05 — Manager / HR Course Approval

**As a** New Employee,  
**I want to** receive approval for requested courses from the appropriate manager or HR/Talent Manager,  
**so that** I can proceed with relevant development activities.

---

## 3.2 Growth-Seeking Employee

### US-EMP-GROW-01 — View Current Skill Profile

**As a** Growth-Seeking Employee,  
**I want to** view my current AI-generated skill profile,  
**so that** I can understand my current capabilities.

**Acceptance Criteria**
- Profile displays identified skills.
- Skills can be associated with experience and projects.
- Profile reflects updated learning and experience information.

### US-EMP-GROW-02 — Discover Transferable Skills

**As a** Growth-Seeking Employee,  
**I want to** discover hidden and transferable skills,  
**so that** I can identify capabilities that may apply to other roles.

### US-EMP-GROW-03 — Identify Skill Gaps

**As a** Growth-Seeking Employee,  
**I want to** identify gaps between my current skills and a target role,  
**so that** I know what I need to improve.

### US-EMP-GROW-04 — Get Learning Recommendations

**As a** Growth-Seeking Employee,  
**I want to** receive personalized learning recommendations,  
**so that** I can close identified skill gaps.

### US-EMP-GROW-05 — Follow a Career Development Roadmap

**As a** Growth-Seeking Employee,  
**I want to** follow a personalized career development roadmap,  
**so that** I can systematically work toward future internal roles.

---

## 3.3 Opportunity-Seeking Employee

### US-EMP-OPP-01 — Discover Internal Opportunities

**As an** Opportunity-Seeking Employee,  
**I want to** discover suitable internal roles and projects,  
**so that** I can explore career opportunities inside my company.

### US-EMP-OPP-02 — Understand Opportunity Match

**As an** Opportunity-Seeking Employee,  
**I want to** understand why an opportunity matches my profile,  
**so that** I can make an informed decision about expressing interest.

### US-EMP-OPP-03 — Explore Skill Gaps for an Opportunity

**As an** Opportunity-Seeking Employee,  
**I want to** see the skills I am missing for an opportunity,  
**so that** I can plan how to become qualified.

### US-EMP-OPP-04 — Express Interest in an Opportunity

**As an** Opportunity-Seeking Employee,  
**I want to** express interest in an internal opportunity,  
**so that** the relevant Team Leader or HR/Talent Manager can consider my profile.

### US-EMP-OPP-05 — Ask AI Career Assistant

**As an** Opportunity-Seeking Employee,  
**I want to** ask an AI career assistant questions about roles, skills, gaps, and development,  
**so that** I can get guidance while exploring internal opportunities.

---

# 4. Team Leader User Stories

### US-TL-01 — Search Internal Talent

**As a** Team Leader,  
**I want to** search internal employees by skills and capabilities,  
**so that** I can find suitable talent.

### US-TL-02 — Find Talent for a Project

**As a** Team Leader,  
**I want to** find employees suitable for a project or role,  
**so that** I can identify internal talent.

### US-TL-03 — Understand Talent Match

**As a** Team Leader,  
**I want to** understand why an employee matches a role or project,  
**so that** I can evaluate capability alignment.

### US-TL-04 — Identify Skill Gaps

**As a** Team Leader,  
**I want to** identify development or skill gaps,  
**so that** I can understand what support an employee may need.

### US-TL-05 — Support Employee Development

**As a** Team Leader,  
**I want to** support employee development,  
**so that** employees can improve capabilities relevant to team needs.

### US-TL-06 — Review and Shortlist Talent

**As a** Team Leader,  
**I want to** review and shortlist suitable internal talent,  
**so that** I can continue the internal selection process.

---

# 5. HR / Talent Manager User Stories

### US-HR-01 — Workforce Skill Dashboard

**As an** HR / Talent Manager,  
**I want to** view workforce skill intelligence,  
**so that** I can understand organizational capabilities.

### US-HR-02 — Search Employee Talent

**As an** HR / Talent Manager,  
**I want to** search employees by skills, experience, and capabilities,  
**so that** I can discover internal talent.

### US-HR-03 — Discover Hidden and Transferable Skills

**As an** HR / Talent Manager,  
**I want to** discover hidden and transferable employee skills,  
**so that** workforce capability is not limited to job titles.

### US-HR-04 — Create Internal Opportunities

**As an** HR / Talent Manager,  
**I want to** create internal roles and opportunities,  
**so that** employees can discover relevant mobility opportunities.

### US-HR-05 — Analyze Internal Role Matches

**As an** HR / Talent Manager,  
**I want to** analyze employee-to-role matches,  
**so that** I can support internal mobility.

### US-HR-06 — Analyze Organizational Skill Gaps

**As an** HR / Talent Manager,  
**I want to** identify organizational skill gaps,  
**so that** workforce development can address emerging needs.

### US-HR-07 — Recommend Employee Development

**As an** HR / Talent Manager,  
**I want to** support personalized employee development recommendations,  
**so that** employees can close relevant skill gaps.

### US-HR-08 — Manage Internal Mobility

**As an** HR / Talent Manager,  
**I want to** manage internal mobility opportunities and employee movement,  
**so that** internal talent can be effectively developed and utilized.

### US-HR-09 — Workforce Intelligence

**As an** HR / Talent Manager,  
**I want to** analyze workforce capabilities and emerging skill needs,  
**so that** I can support workforce planning.

### US-HR-10 — HR AI Career / Talent Assistant

**As an** HR / Talent Manager,  
**I want to** use an AI assistant for talent and workforce questions,  
**so that** I can quickly explore workforce intelligence.

---

# 6. Technology Stack

## Frontend

- **React**
- **TypeScript**
- **Tailwind CSS**
- React Router
- TanStack Query
- Axios

## Backend

- **FastAPI**
- **Python**
- Pydantic
- SQLAlchemy
- Alembic
- JWT Authentication

## Database

### Primary Database: PostgreSQL

PostgreSQL is selected as the primary database because Eagle Vision contains structured and highly related data:

- Employees
- Skills
- Experience
- Projects
- Learning
- Internal Roles
- Skill Requirements
- Skill Gaps
- Recommendations
- Internal Mobility

### Vector Search: pgvector

**pgvector** can be added to PostgreSQL for AI embeddings and semantic similarity.

This avoids introducing a separate database for the initial MVP.

## AI / ML

- Python
- LLM integration
- Embeddings
- Semantic similarity
- Skill extraction
- Talent matching
- Skill-gap analysis
- Learning recommendations

## API

- REST API
- JSON
- FastAPI OpenAPI documentation

## Authentication

- JWT-based authentication
- Role-based access control

## DevOps

- Docker
- Docker Compose
- Git
- GitHub
- GitHub Actions

---

# 7. High-Level Architecture

```text
                    EAGLE VISION
                         │
                         ▼
              React + TypeScript
                         │
                  Tailwind CSS
                         │
                     REST API
                         │
                         ▼
                  FastAPI Backend
                         │
             ┌───────────┴───────────┐
             │                       │
             ▼                       ▼
       PostgreSQL                AI Services
             │                       │
        ┌────┴────┐            ┌─────┴─────┐
        │         │            │           │
     Business   pgvector    Skill      Matching
       Data                  Extraction    │
                                      Skill Gap
                                      Recommendations
```

---

# 8. Initial Development Vertical Slice

The first implementation should follow the core product journey:

```text
Employee
   ↓
Employee Profile
   ↓
Skills + Experience + Learning
   ↓
AI Skill Extraction
   ↓
Dynamic Skill Profile
   ↓
Internal Opportunity
   ↓
AI Match
   ↓
Skill Gap
   ↓
Learning Recommendation
```

This provides an end-to-end MVP slice before expanding the remaining modules.

---

# 9. Development Traceability

```text
Problem
   ↓
Pain Point
   ↓
User Need
   ↓
User Story
   ↓
Requirement
   ↓
Acceptance Criteria
   ↓
Feature
   ↓
Design
   ↓
Implementation
   ↓
Test
```

Each implementation task should be traceable to the corresponding user story.

---

# 10. Repository Structure

```text
Eagle-Vision/
├── README.md
├── .gitignore
├── .env.example
├── docker-compose.yml
│
├── docs/
│   ├── requirements/
│   ├── architecture/
│   ├── ai/
│   └── security/
│
├── frontend/
├── backend/
├── ai/
├── database/
├── tests/
├── infra/
│
└── .github/
    ├── workflows/
    └── pull_request_template.md
```

---

# 11. Team Development Rules

1. `main` is the stable branch.
2. Each developer works on a feature branch.
3. Do not directly push feature work to `main`.
4. Pull the latest `main` before starting work.
5. Commit changes with meaningful commit messages.
6. Push the feature branch to GitHub.
7. Create a Pull Request.
8. Review the changes before merging.
9. Keep frontend, backend, AI, database, and documentation changes traceable.
10. Never commit secrets or `.env` files.

## Git Workflow

```bash
git checkout main
git pull origin main

git checkout -b feature/<feature-name>

# develop

git add .
git commit -m "feat: <description>"
git push -u origin feature/<feature-name>
```

Then create:

```text
feature/<feature-name>
        ↓
   Pull Request
        ↓
       main
```

---

# 12. MVP Core Modules

1. Employee Profile
2. AI Skill Profiling
3. Internal Role & Project Matching
4. Skill Gap Analysis
5. Personalized Career Development
6. AI Career Assistant
7. Team Leader Talent Discovery
8. HR Workforce Intelligence
