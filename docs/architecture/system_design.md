# Eagle Vision — System Architecture Design

> **Version:** 1.0  
> **Date:** 2026-09-19  
> **Status:** Draft — Pending Team Review

---

## 1. High-Level System Architecture

```mermaid
graph TB
    subgraph CLIENT["🖥️ Client Layer"]
        BROWSER["Browser<br/>React + TypeScript + Tailwind CSS"]
    end

    subgraph API_GATEWAY["🔐 API Gateway Layer"]
        NGINX["Nginx Reverse Proxy<br/>(Production)"]
    end

    subgraph BACKEND["⚙️ Backend Layer — FastAPI"]
        AUTH["Auth Service<br/>JWT + RBAC"]
        EMP["Employee Service"]
        SKILL["Skill Service"]
        OPP["Opportunity Service"]
        LEARN["Learning Service"]
        MATCH["Matching Service"]
        ANALYTICS["Analytics Service"]
        NOTIFY["Notification Service"]
    end

    subgraph AI_ENGINE["🧠 AI Engine Layer — Python"]
        EXTRACT["Skill Extraction<br/>Engine"]
        EMBED["Embedding<br/>Generator"]
        MATCHER["Semantic<br/>Matcher"]
        GAP["Skill Gap<br/>Analyzer"]
        RECOMMEND["Recommendation<br/>Engine"]
        ASSISTANT["AI Career<br/>Assistant"]
        PROMPTS["Prompt<br/>Templates"]
    end

    subgraph DATA["💾 Data Layer"]
        PG["PostgreSQL 16<br/>+ pgvector"]
        CACHE["Redis<br/>Cache + Sessions"]
    end

    subgraph EXTERNAL["🌐 External Services"]
        LLM["LLM Provider<br/>(Gemini / OpenAI)"]
        EMBED_API["Embedding API<br/>(Sentence Transformers)"]
    end

    BROWSER -->|"HTTPS / REST API"| NGINX
    NGINX -->|"Proxy Pass"| AUTH
    NGINX -->|"Proxy Pass"| EMP
    NGINX -->|"Proxy Pass"| SKILL
    NGINX -->|"Proxy Pass"| OPP
    NGINX -->|"Proxy Pass"| LEARN
    NGINX -->|"Proxy Pass"| MATCH
    NGINX -->|"Proxy Pass"| ANALYTICS
    NGINX -->|"Proxy Pass"| NOTIFY

    AUTH -->|"JWT Verify"| CACHE
    EMP --> PG
    SKILL --> PG
    OPP --> PG
    LEARN --> PG
    MATCH --> AI_ENGINE
    ANALYTICS --> PG

    MATCH --> MATCHER
    MATCH --> GAP

    EXTRACT --> LLM
    EXTRACT --> EMBED
    EMBED --> EMBED_API
    MATCHER --> PG
    GAP --> PG
    RECOMMEND --> LLM
    ASSISTANT --> LLM
    ASSISTANT --> PROMPTS

    EXTRACT --> PG
    EMBED --> PG
    RECOMMEND --> PG
    ASSISTANT --> PG

    style CLIENT fill:#1e293b,stroke:#38bdf8,color:#f8fafc
    style API_GATEWAY fill:#1e293b,stroke:#a78bfa,color:#f8fafc
    style BACKEND fill:#1e293b,stroke:#34d399,color:#f8fafc
    style AI_ENGINE fill:#1e293b,stroke:#f472b6,color:#f8fafc
    style DATA fill:#1e293b,stroke:#fbbf24,color:#f8fafc
    style EXTERNAL fill:#1e293b,stroke:#fb923c,color:#f8fafc
```

---

## 2. Core Component Breakdown

### 2.1 Frontend (React + TypeScript)

```mermaid
graph LR
    subgraph FRONTEND["Frontend Architecture"]
        direction TB
        subgraph PAGES["Pages"]
            LOGIN["Login / Register"]
            ONBOARD["Onboarding"]
            DASH_EMP["Employee Dashboard"]
            DASH_TL["Team Leader Dashboard"]
            DASH_HR["HR Dashboard"]
            PROFILE["Skill Profile"]
            OPPS["Opportunities"]
            LEARNING["Learning Center"]
            TALENT["Talent Search"]
            CHAT["AI Assistant"]
        end

        subgraph STATE["State Management"]
            AUTH_CTX["Auth Context"]
            QUERY["TanStack Query<br/>Server State"]
            ROUTER["React Router<br/>Route Guards"]
        end

        subgraph SERVICES["API Services"]
            AXIOS_INST["Axios Instance<br/>+ Interceptors"]
            API_AUTH["Auth API"]
            API_EMP["Employee API"]
            API_SKILL["Skill API"]
            API_OPP["Opportunity API"]
            API_LEARN["Learning API"]
            API_AI["AI API"]
            API_HR["Analytics API"]
        end
    end

    PAGES --> STATE
    STATE --> SERVICES
    SERVICES --> AXIOS_INST

    style FRONTEND fill:#0f172a,stroke:#38bdf8,color:#e2e8f0
    style PAGES fill:#1e293b,stroke:#38bdf8,color:#e2e8f0
    style STATE fill:#1e293b,stroke:#a78bfa,color:#e2e8f0
    style SERVICES fill:#1e293b,stroke:#34d399,color:#e2e8f0
```

### 2.2 Backend Services (FastAPI)

```mermaid
graph TB
    subgraph FASTAPI["FastAPI Application"]
        direction TB
        MAIN["main.py<br/>App Factory"]

        subgraph MIDDLEWARE["Middleware"]
            CORS["CORS"]
            AUTH_MW["JWT Auth Middleware"]
            RATE["Rate Limiter"]
            LOG["Request Logger"]
        end

        subgraph ROUTERS["API v1 Routers"]
            R_AUTH["auth_router"]
            R_EMP["employee_router"]
            R_SKILL["skill_router"]
            R_OPP["opportunity_router"]
            R_LEARN["learning_router"]
            R_MATCH["matching_router"]
            R_AI["ai_router"]
            R_HR["analytics_router"]
            R_TL["talent_router"]
        end

        subgraph SVC["Service Layer"]
            S_AUTH["AuthService"]
            S_EMP["EmployeeService"]
            S_SKILL["SkillService"]
            S_OPP["OpportunityService"]
            S_LEARN["LearningService"]
            S_MATCH["MatchingService"]
            S_AI["AIService"]
            S_HR["AnalyticsService"]
        end

        subgraph REPO["Repository Layer"]
            REPO_BASE["BaseRepository<br/>(CRUD)"]
            REPO_EMP["EmployeeRepo"]
            REPO_SKILL["SkillRepo"]
            REPO_OPP["OpportunityRepo"]
            REPO_LEARN["LearningRepo"]
        end

        subgraph MODELS["SQLAlchemy Models"]
            M_USER["User"]
            M_EMP["Employee"]
            M_SKILL["Skill"]
            M_OPP["Opportunity"]
            M_COURSE["Course"]
            M_MATCH["MatchScore"]
        end
    end

    MAIN --> MIDDLEWARE
    MIDDLEWARE --> ROUTERS
    ROUTERS --> SVC
    SVC --> REPO
    REPO --> MODELS

    style FASTAPI fill:#0f172a,stroke:#34d399,color:#e2e8f0
    style MIDDLEWARE fill:#1e293b,stroke:#fbbf24,color:#e2e8f0
    style ROUTERS fill:#1e293b,stroke:#34d399,color:#e2e8f0
    style SVC fill:#1e293b,stroke:#a78bfa,color:#e2e8f0
    style REPO fill:#1e293b,stroke:#f472b6,color:#e2e8f0
    style MODELS fill:#1e293b,stroke:#fb923c,color:#e2e8f0
```

---

## 3. Authentication & Authorization Flow

```mermaid
sequenceDiagram
    actor User
    participant FE as Frontend
    participant API as FastAPI
    participant Auth as Auth Service
    participant Redis as Redis Cache
    participant DB as PostgreSQL

    Note over User,DB: 🔐 Registration Flow
    User->>FE: Fill registration form
    FE->>API: POST /api/v1/auth/register
    API->>Auth: validate & hash password
    Auth->>DB: INSERT user + employee profile
    DB-->>Auth: user created
    Auth->>Auth: Generate JWT (access + refresh)
    Auth->>Redis: Store refresh token
    Auth-->>FE: { access_token, refresh_token, user }
    FE->>FE: Store tokens, redirect to dashboard

    Note over User,DB: 🔑 Login Flow
    User->>FE: Enter credentials
    FE->>API: POST /api/v1/auth/login
    API->>Auth: Verify credentials
    Auth->>DB: SELECT user WHERE email = ?
    DB-->>Auth: user record
    Auth->>Auth: Verify password hash
    Auth->>Auth: Generate JWT tokens
    Auth->>Redis: Store refresh token
    Auth-->>FE: { access_token, refresh_token, user }

    Note over User,DB: 🔄 Token Refresh Flow
    FE->>API: POST /api/v1/auth/refresh
    API->>Auth: Validate refresh token
    Auth->>Redis: Verify token exists
    Redis-->>Auth: Token valid
    Auth->>Auth: Issue new access token
    Auth-->>FE: { access_token }

    Note over User,DB: 🛡️ Protected Request Flow
    FE->>API: GET /api/v1/employees/me<br/>[Authorization: Bearer <token>]
    API->>Auth: Decode & verify JWT
    Auth->>Auth: Extract role + user_id
    Auth->>Auth: Check RBAC permissions
    Auth-->>API: Authorized (role=employee)
    API->>DB: Fetch employee data
    DB-->>API: Employee record
    API-->>FE: { employee profile }
```

### Role-Based Access Control (RBAC) Matrix

| Resource | Employee | Team Leader | HR / Talent Manager |
|---|:---:|:---:|:---:|
| Own Profile (R/W) | ✅ | ✅ | ✅ |
| Other Profiles (R) | ❌ | ✅ (team) | ✅ (all) |
| Own Skill Profile | ✅ | ✅ | ✅ |
| Talent Search | ❌ | ✅ | ✅ |
| Create Opportunities | ❌ | ✅ | ✅ |
| Apply to Opportunities | ✅ | ❌ | ❌ |
| View Applications | ❌ | ✅ (own opps) | ✅ (all) |
| Shortlist Talent | ❌ | ✅ | ✅ |
| Approve Courses | ❌ | ✅ (team) | ✅ (all) |
| Workforce Analytics | ❌ | ❌ | ✅ |
| AI Career Assistant | ✅ | ❌ | ❌ |
| AI Talent Assistant | ❌ | ❌ | ✅ |
| Manage Skills Catalog | ❌ | ❌ | ✅ |
| Manage Departments | ❌ | ❌ | ✅ |

---

## 4. AI Pipeline Architecture

```mermaid
graph TB
    subgraph INPUT["📥 Input Sources"]
        ONBOARD_DATA["Onboarding Data<br/>(skills, experience, interests)"]
        RESUME["Resume / CV<br/>(future)"]
        PROJECT_DATA["Project Contributions"]
        COURSE_DATA["Completed Courses"]
        SELF_ASSESS["Self-Assessment<br/>Updates"]
    end

    subgraph EXTRACTION["🔍 Skill Extraction Pipeline"]
        PARSE["Parse & Clean<br/>Input Text"]
        LLM_EXTRACT["LLM Skill Extraction<br/>(Structured Output)"]
        NORMALIZE["Skill Normalization<br/>(Map to Taxonomy)"]
        VALIDATE["Confidence Scoring<br/>& Validation"]
    end

    subgraph EMBEDDING["🧮 Embedding Pipeline"]
        SKILL_EMBED["Generate Skill<br/>Embeddings"]
        PROFILE_EMBED["Generate Profile<br/>Embedding (Composite)"]
        ROLE_EMBED["Generate Role<br/>Requirement Embedding"]
        STORE_VEC["Store in pgvector"]
    end

    subgraph MATCHING["🎯 Matching Engine"]
        SEM_SEARCH["Semantic Similarity<br/>Search (pgvector)"]
        SCORE["Compute Match<br/>Score (0-100)"]
        EXPLAIN["Generate Match<br/>Explanation (LLM)"]
        RANK["Rank & Filter<br/>Results"]
    end

    subgraph GAP_ANALYSIS["📊 Gap Analysis"]
        COMPARE["Compare Employee<br/>Skills vs Target Role"]
        IDENTIFY["Identify Missing<br/>& Weak Skills"]
        PRIORITY["Prioritize Gaps<br/>by Importance"]
        ROADMAP["Generate Development<br/>Roadmap (LLM)"]
    end

    subgraph RECOMMENDATION["💡 Recommendation Engine"]
        COURSE_MATCH["Match Courses<br/>to Skill Gaps"]
        PATH_GEN["Generate Learning<br/>Path (LLM)"]
        CAREER_PATH["Suggest Career<br/>Trajectories"]
    end

    subgraph ASSISTANT["🤖 AI Assistant"]
        CONTEXT["Build Context<br/>(Profile + Skills + Gaps)"]
        PROMPT["Select Prompt<br/>Template"]
        LLM_CHAT["LLM Conversation<br/>(Multi-turn)"]
        RESPONSE["Parse & Format<br/>Response"]
    end

    INPUT --> EXTRACTION
    EXTRACTION --> EMBEDDING
    EMBEDDING --> MATCHING
    EMBEDDING --> GAP_ANALYSIS
    GAP_ANALYSIS --> RECOMMENDATION
    MATCHING --> ASSISTANT
    GAP_ANALYSIS --> ASSISTANT

    PARSE --> LLM_EXTRACT --> NORMALIZE --> VALIDATE
    SKILL_EMBED --> STORE_VEC
    PROFILE_EMBED --> STORE_VEC
    ROLE_EMBED --> STORE_VEC
    SEM_SEARCH --> SCORE --> EXPLAIN --> RANK
    COMPARE --> IDENTIFY --> PRIORITY --> ROADMAP
    COURSE_MATCH --> PATH_GEN --> CAREER_PATH
    CONTEXT --> PROMPT --> LLM_CHAT --> RESPONSE

    style INPUT fill:#1e293b,stroke:#38bdf8,color:#e2e8f0
    style EXTRACTION fill:#1e293b,stroke:#f472b6,color:#e2e8f0
    style EMBEDDING fill:#1e293b,stroke:#a78bfa,color:#e2e8f0
    style MATCHING fill:#1e293b,stroke:#34d399,color:#e2e8f0
    style GAP_ANALYSIS fill:#1e293b,stroke:#fbbf24,color:#e2e8f0
    style RECOMMENDATION fill:#1e293b,stroke:#fb923c,color:#e2e8f0
    style ASSISTANT fill:#1e293b,stroke:#f43f5e,color:#e2e8f0
```

### AI Pipeline Data Flow (Detailed)

```mermaid
sequenceDiagram
    participant EMP as Employee
    participant API as FastAPI
    participant EXTRACT as Skill Extractor
    participant EMBED as Embedding Gen
    participant PG as PostgreSQL + pgvector
    participant LLM as LLM Provider

    Note over EMP,LLM: 🔍 Skill Extraction (on profile update / onboarding)
    EMP->>API: Submit profile data / update skills
    API->>EXTRACT: Extract skills from text
    EXTRACT->>LLM: "Extract skills from: {text}"
    LLM-->>EXTRACT: Structured skill list + confidence
    EXTRACT->>PG: Upsert employee_skills
    EXTRACT->>EMBED: Generate embeddings for new skills
    EMBED->>LLM: Encode skill descriptions
    LLM-->>EMBED: Embedding vectors (768d)
    EMBED->>PG: INSERT INTO skill_embeddings (vector)
    EMBED->>EMBED: Compute composite profile embedding
    EMBED->>PG: UPDATE employee SET profile_embedding = ?

    Note over EMP,LLM: 🎯 Opportunity Matching (on demand)
    EMP->>API: GET /ai/match/opportunities
    API->>PG: SELECT profile_embedding FROM employee
    API->>PG: SELECT * FROM opportunities WHERE status='open'
    API->>PG: Cosine similarity search (pgvector)
    PG-->>API: Top N matches with similarity scores
    API->>LLM: "Explain why employee X matches role Y"
    LLM-->>API: Human-readable explanation
    API-->>EMP: Ranked matches + explanations

    Note over EMP,LLM: 📊 Gap Analysis (on demand)
    EMP->>API: GET /ai/skill-gaps?target_role=X
    API->>PG: Get employee skills + target role requirements
    API->>LLM: "Compare skills and identify gaps"
    LLM-->>API: Structured gap analysis
    API->>PG: Store skill_gaps record
    API-->>EMP: Gap list + priority + recommendations
```

---

## 5. Data Flow Architecture

```mermaid
graph LR
    subgraph WRITE_PATH["✍️ Write Path"]
        direction TB
        W1["User Action<br/>(Form Submit)"]
        W2["Axios POST/PUT"]
        W3["FastAPI Router"]
        W4["Pydantic Validation"]
        W5["Service Layer"]
        W6["SQLAlchemy ORM"]
        W7["PostgreSQL"]

        W1 --> W2 --> W3 --> W4 --> W5 --> W6 --> W7
    end

    subgraph READ_PATH["📖 Read Path"]
        direction TB
        R1["User Navigation"]
        R2["TanStack Query<br/>(check cache)"]
        R3["Axios GET"]
        R4["FastAPI Router"]
        R5["Service Layer"]
        R6["SQLAlchemy Query"]
        R7["PostgreSQL"]
        R8["TanStack Query<br/>(cache response)"]

        R1 --> R2 -->|cache miss| R3 --> R4 --> R5 --> R6 --> R7
        R7 --> R6 --> R5 --> R4 --> R3 --> R8
        R2 -->|cache hit| R8
    end

    subgraph AI_PATH["🧠 AI Processing Path"]
        direction TB
        A1["Trigger Event<br/>(profile update / request)"]
        A2["AI Service"]
        A3["LLM API Call"]
        A4["Process Response"]
        A5["Store Results<br/>(pgvector + tables)"]
        A6["Return to User"]

        A1 --> A2 --> A3 --> A4 --> A5 --> A6
    end

    style WRITE_PATH fill:#1e293b,stroke:#34d399,color:#e2e8f0
    style READ_PATH fill:#1e293b,stroke:#38bdf8,color:#e2e8f0
    style AI_PATH fill:#1e293b,stroke:#f472b6,color:#e2e8f0
```

---

## 6. Deployment Architecture

### Development (Docker Compose)

```mermaid
graph TB
    subgraph DOCKER["🐳 Docker Compose — Development"]
        subgraph NET["eagle-vision-network (bridge)"]
            FE["frontend<br/>Node 20 + Vite<br/>Port 5173"]
            BE["backend<br/>Python 3.12 + Uvicorn<br/>Port 8000"]
            DB["db<br/>pgvector/pgvector:pg16<br/>Port 5432"]
            REDIS["redis<br/>Redis 7 Alpine<br/>Port 6379"]
        end

        VOL_DB["📁 pgdata<br/>(named volume)"]
        VOL_REDIS["📁 redis_data<br/>(named volume)"]
        ENV["📄 .env"]
    end

    FE -->|"API calls :8000"| BE
    BE -->|"SQL + pgvector"| DB
    BE -->|"Cache + Sessions"| REDIS
    DB --- VOL_DB
    REDIS --- VOL_REDIS
    ENV -.->|"env_file"| FE
    ENV -.->|"env_file"| BE
    ENV -.->|"env_file"| DB

    style DOCKER fill:#0f172a,stroke:#38bdf8,color:#e2e8f0
    style NET fill:#1e293b,stroke:#34d399,color:#e2e8f0
```

### Production (Future)

```mermaid
graph TB
    subgraph PROD["☁️ Production Architecture"]
        CDN["CDN<br/>(Static Assets)"]
        LB["Load Balancer"]

        subgraph APP["Application Tier"]
            FE1["Frontend<br/>Container 1"]
            FE2["Frontend<br/>Container 2"]
            BE1["Backend<br/>Container 1"]
            BE2["Backend<br/>Container 2"]
        end

        subgraph DATA["Data Tier"]
            PG_PRIMARY["PostgreSQL Primary<br/>+ pgvector"]
            PG_REPLICA["PostgreSQL Replica<br/>(Read)"]
            REDIS_PROD["Redis Cluster"]
        end
    end

    CDN --> LB
    LB --> FE1
    LB --> FE2
    LB --> BE1
    LB --> BE2
    BE1 --> PG_PRIMARY
    BE2 --> PG_PRIMARY
    BE1 --> PG_REPLICA
    BE2 --> PG_REPLICA
    BE1 --> REDIS_PROD
    BE2 --> REDIS_PROD

    style PROD fill:#0f172a,stroke:#a78bfa,color:#e2e8f0
    style APP fill:#1e293b,stroke:#34d399,color:#e2e8f0
    style DATA fill:#1e293b,stroke:#fbbf24,color:#e2e8f0
```

---

## 7. Security Architecture

```mermaid
graph TB
    subgraph SECURITY["🛡️ Security Layers"]
        direction TB

        subgraph TRANSPORT["Transport Security"]
            HTTPS["HTTPS / TLS 1.3"]
            CORS_SEC["CORS Whitelist"]
        end

        subgraph AUTH_SEC["Authentication"]
            JWT_SEC["JWT Access Tokens<br/>(Short-lived: 15min)"]
            REFRESH["Refresh Tokens<br/>(Long-lived: 7 days)"]
            BCRYPT["Password Hashing<br/>(bcrypt)"]
        end

        subgraph AUTHZ["Authorization"]
            RBAC_SEC["Role-Based Access<br/>(Employee / TL / HR)"]
            RESOURCE["Resource-Level<br/>Permissions"]
            ROW["Row-Level Security<br/>(PostgreSQL RLS)"]
        end

        subgraph DATA_SEC["Data Protection"]
            ENCRYPT["Encryption at Rest<br/>(PostgreSQL)"]
            PII["PII Protection<br/>(Sensitive Fields)"]
            AUDIT["Audit Logging"]
        end

        subgraph INPUT_SEC["Input Security"]
            VALID["Pydantic Validation"]
            SANITIZE["Input Sanitization"]
            RATE_SEC["Rate Limiting"]
            SQL_INJ["SQLAlchemy ORM<br/>(SQL Injection Prevention)"]
        end
    end

    TRANSPORT --> AUTH_SEC --> AUTHZ --> DATA_SEC --> INPUT_SEC

    style SECURITY fill:#0f172a,stroke:#f43f5e,color:#e2e8f0
    style TRANSPORT fill:#1e293b,stroke:#38bdf8,color:#e2e8f0
    style AUTH_SEC fill:#1e293b,stroke:#34d399,color:#e2e8f0
    style AUTHZ fill:#1e293b,stroke:#a78bfa,color:#e2e8f0
    style DATA_SEC fill:#1e293b,stroke:#fbbf24,color:#e2e8f0
    style INPUT_SEC fill:#1e293b,stroke:#fb923c,color:#e2e8f0
```

---

## 8. Error Handling Strategy

| Layer | Strategy | Details |
|---|---|---|
| Frontend | Global error boundary + toast notifications | React Error Boundary, Axios interceptors for 401/403/500 |
| API Router | HTTPException with standard error schema | `{ detail, status_code, error_code }` |
| Service | Custom exception classes | `NotFoundException`, `ForbiddenException`, `ValidationException` |
| Database | SQLAlchemy exception handling | Constraint violations → friendly messages |
| AI | Retry with exponential backoff | LLM timeouts, rate limits, fallback responses |
| External | Circuit breaker pattern | Graceful degradation when LLM provider is down |

---

## 9. Monitoring & Observability (Future)

| Aspect | Tool | Purpose |
|---|---|---|
| Application Logs | Structured JSON logging (Python `structlog`) | Request tracing, error diagnosis |
| Metrics | Prometheus + Grafana | API latency, throughput, error rates |
| Health Checks | FastAPI `/health` endpoint | Container orchestration readiness/liveness |
| DB Monitoring | pg_stat_statements | Query performance |
| AI Monitoring | Custom metrics | LLM latency, token usage, cost tracking |
