# 🦅 Eagle Vision

**AI-Powered Talent Discovery & Internal Mobility Platform**

Eagle Vision is an enterprise intelligence system that analyzes workforce capabilities, identifies hidden and transferable skills, matches employees with internal roles and cross-functional gigs, detects institutional skill deficits, and dynamically orchestrates personalized career upskilling paths.

---

## 📑 Table of Contents

- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Quick Start: Running the Application](#-quick-start-running-the-application)
  - [Option A: Local Development (Fastest)](#option-a-local-development-fastest)
  - [Option B: Full-Stack Docker Compose](#option-b-full-stack-docker-compose)
- [System Architecture](#-system-architecture)
  - [Directory Structure](#directory-structure)
  - [Talent Matching Algorithm](#talent-matching-algorithm)
  - [Data Flow & Request Lifecycle](#data-flow--request-lifecycle)
- [API Documentation](#-api-documentation)
- [Environment Variables](#-environment-variables)
- [Testing](#-testing)
- [Deployment & Infrastructure](#-deployment--infrastructure)
- [Troubleshooting](#-troubleshooting)

---

## ✨ Key Features

- 🧠 **Transferable Skills Detection**: Discovers latent and cross-domain competencies using semantic embeddings (`text-embedding-004`) and NetworkX knowledge graphs.
- 🎯 **Multi-Factor Semantic Matching**: Matches candidates to open roles, gigs, and mentorship opportunities via a composite algorithm combining direct skill fit (50%), semantic similarity (35%), and transferable skill bonuses (15%).
- 💬 **Transparent LLM Explainability**: Automatically generates natural language explanations for match fit and recommendation rationale using **Gemini 2.5 Flash**.
- 🗺️ **Personalized Upskilling Roadmaps**: Maps step-by-step milestones to help employees close identified skill gaps for their target career aspirations.
- 📊 **Executive Skill Gap Intelligence**: Aggregates organizational capability deficits to guide workforce planning and strategic succession benches.
- 🛡️ **Enterprise Security & Privacy**: Role-Based Access Control (RBAC), confidential internal mobility preferences, and JWT authentication.

---

## 🏗️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18 · TypeScript · Tailwind CSS · Vite | Modern, responsive dark-mode talent portal |
| **State & Query** | TanStack Query v5 · React Router v6 · Axios | Client-side cache, async queries, SPA routing |
| **Icons & UI** | Lucide React | Clean, modern iconography |
| **Backend API** | FastAPI (Python 3.12+) · Uvicorn | High-throughput asynchronous RESTful API |
| **Data & ORM** | PostgreSQL 16 · SQLAlchemy 2.0 (Async) | Primary relational database |
| **Vector Search** | `pgvector` with HNSW cosine indexes | Sub-millisecond similarity search over 768-dim embeddings |
| **Cache & Bus** | Redis 7 | Token blacklisting, session state & rate limiting |
| **AI Engine** | Google GenAI SDK (`google-genai`) | Embeddings (`text-embedding-004`) & LLM reasoning (`gemini-2.5-flash`) |
| **Graph Logic** | NetworkX · NumPy · Scipy · Scikit-Learn | Skills taxonomy graph traversal and similarity calculations |
| **DevOps & Containers** | Docker · Docker Compose · Kubernetes | Containerized development and scalable orchestration |
| **CI/CD** | GitHub Actions | Automated linting, test suites, and frontend build verification |

---

## 📋 Prerequisites

Before running Eagle Vision locally, ensure the following tools are installed:

- **Node.js**: v20.x or v22.x (comes with `npm`)
- **Python**: v3.12 or newer
- **Git**: v2.40+
- **Docker Desktop**: Optional, for containerized PostgreSQL + pgvector and Redis

---

## 🚀 Quick Start: Running the Application

### Option A: Local Development (Fastest)

#### 1. Clone the Repository
```bash
git clone https://github.com/Sowndhar-2005/Eagle-Vision-.git
cd Eagle-Vision-
```

#### 2. Backend Setup
In a new terminal window:
```powershell
cd backend

# Create and activate Python virtual environment
python -m venv .venv
.\.venv\Scripts\activate       # On Linux/macOS: source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
pip install -r ../ai/requirements.txt

# Create .env from template
copy ..\.env.example .env       # On Linux/macOS: cp ../.env.example .env

# Start FastAPI server with live-reload
uvicorn app.main:app --reload --port 8000
```
- **Backend API**: [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **Interactive Swagger Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Health Check**: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

#### 3. Frontend Setup
In a second terminal window:
```powershell
cd frontend

# Install Node dependencies
npm install

# Start Vite development server
npm run dev -- --port 3000
```
- **Web Application Portal**: [http://localhost:3000](http://localhost:3000)

---

### Option B: Full-Stack Docker Compose

To launch all services (PostgreSQL 16 with `pgvector`, Redis 7, Backend, and Frontend) with a single command:

```bash
docker compose up --build
```

#### Exposed Ports:
| Service | URL / Port |
|---|---|
| **Frontend Portal** | [http://localhost:3000](http://localhost:3000) |
| **FastAPI Backend** | [http://localhost:8000](http://localhost:8000) |
| **Swagger API Docs** | [http://localhost:8000/docs](http://localhost:8000/docs) |
| **PostgreSQL + pgvector** | `localhost:5432` |
| **Redis Cache** | `localhost:6379` |

To stop the containers:
```bash
docker compose down
```

---

## 🏛️ System Architecture

### Directory Structure

```
Eagle-Vision-/
├── .github/
│   ├── workflows/ci.yml           # Automated CI workflow
│   └── pull_request_template.md   # Standardized PR checklist
├── ai/                            # Specialized AI & graph modules
│   ├── common/                    # Gemini SDK clients & wrappers
│   ├── learning_agent/            # Upskilling path generator
│   ├── matching_engine/           # Hybrid semantic talent matcher
│   ├── market_trends/             # Market demand & skill trend analyzer
│   ├── skills_graph/              # NetworkX skills ontology & transferability
│   └── requirements.txt
├── backend/                       # FastAPI asynchronous application
│   ├── alembic/                   # Database migration scripts
│   ├── alembic.ini
│   ├── app/
│   │   ├── api/v1/                # Modular API route controllers
│   │   │   ├── endpoints/         # Auth, employees, skills, opportunities, etc.
│   │   │   └── router.py          # Unified API v1 router
│   │   ├── core/                  # App config, security/JWT, database engine
│   │   ├── models/                # SQLAlchemy ORM models (pgvector enabled)
│   │   ├── schemas/               # Pydantic validation & response contracts
│   │   ├── services/              # Business logic & AI orchestration
│   │   └── main.py                # FastAPI entry point & CORS configuration
│   ├── Dockerfile
│   └── requirements.txt
├── database/
│   ├── init.sql                   # Schema DDL, extensions & HNSW indexes
│   └── seeds/                     # Baseline taxonomy & mock data
├── docs/
│   ├── architecture/              # System, API, & Database specifications
│   ├── diagrams/                  # Editable .drawio and .excalidraw files
│   ├── ai/                        # AI & ML prompt guidelines
│   ├── requirements/              # Problem statements & user stories
│   └── security/                  # RBAC policies & data privacy docs
├── frontend/                      # React + TypeScript SPA
│   ├── src/
│   │   ├── components/layout/     # Navbar, Sidebar, Page Shells
│   │   ├── pages/                 # Dashboard, SkillsGraph, Opportunities, Learning, Profile
│   │   ├── services/              # Axios API client & interceptors
│   │   ├── types/                 # TypeScript entity definitions
│   │   ├── App.tsx                # App root & React Router navigation
│   │   ├── index.css              # Tailwind directives & theme styles
│   │   └── main.tsx               # DOM mounting entry point
│   ├── Dockerfile                 # Multi-stage production Nginx container
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
├── infra/                         # Production infrastructure manifests
│   ├── docker/                    # Nginx reverse proxy configuration
│   └── k8s/                       # Kubernetes deployment & service definitions
├── tests/                         # Automated test suite
│   ├── conftest.py                # Pytest test fixtures
│   ├── integration/               # API endpoint integration tests
│   └── unit/                      # Algorithmic & unit tests
├── .env.example                   # Environment configuration template
├── .gitignore
├── docker-compose.yml             # Development container orchestration
└── README.md
```

---

### Talent Matching Algorithm

Eagle Vision utilizes a multi-layered hybrid matching pipeline:

$$\text{Match Score} = (w_1 \times S_{\text{direct}}) + (w_2 \times S_{\text{semantic}}) + (w_3 \times S_{\text{transferable}})$$

1. **Direct Skill Match ($w_1 = 0.50$)**: Weighted evaluation of mandatory and optional required skills compared against candidate proficiency levels (1–5 scale).
2. **Semantic Similarity ($w_2 = 0.35$)**: Cosine similarity between candidate profile embedding and opportunity specification embedding via `pgvector` HNSW indexes:
   $$\text{Sim}(A, B) = \frac{A \cdot B}{\|A\| \|B\|}$$
3. **Transferable Skills ($w_3 = 0.15$)**: NetworkX graph distance traversal identifying adjacent capabilities (e.g., *Java Concurrency* $\to$ *Go Goroutines*).

---

### Data Flow & Request Lifecycle

```
[Employee / Manager]
        │
        ▼
[React 18 SPA (Vite)] ── Axios Bearer Token ──► [Nginx / FastAPI Gateway (:8000)]
                                                         │
                        ┌────────────────────────────────┴────────────────────────────────┐
                        ▼                                                                 ▼
             [Relational & Vector Data]                                        [AI Engine & Inference]
             PostgreSQL 16 + pgvector                                          Google Gemini 2.5 Flash
             • Users & Profiles                                                • Profile Embeddings
             • Skills Taxonomy                                                 • Match Explainability
             • Opportunity Specs                                               • Upskilling Curricula
```

---

## 📡 API Documentation

FastAPI automatically generates interactive OpenAPI documentation:
- **Swagger UI**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

### Core Endpoint Summary

| Module | Method | Endpoint | Description |
|---|---|---|---|
| **System** | `GET` | `/health` | Service health status check |
| **Auth** | `POST` | `/api/v1/auth/login` | Authenticate user & issue JWT tokens |
| **Employees** | `GET` | `/api/v1/employees` | List and search talent profiles |
| **Employees** | `GET` | `/api/v1/employees/{id}` | Retrieve comprehensive employee record |
| **Skills** | `GET` | `/api/v1/skills` | Search skills taxonomy ontology |
| **Skills** | `GET` | `/api/v1/skills/graph/{id}` | Query graph neighbors & transferability |
| **Opportunities** | `GET` | `/api/v1/opportunities` | Search open roles, gigs, and mentorships |
| **Opportunities** | `POST` | `/api/v1/opportunities` | Publish new internal opportunity |
| **AI Engine** | `POST` | `/api/v1/ai/match` | Compute semantic match scores |
| **AI Engine** | `POST` | `/api/v1/ai/explain-match` | Generate plain-English match rationale |
| **Learning** | `GET` | `/api/v1/learning/paths/{id}` | Retrieve personalized upskilling milestones |
| **Analytics** | `GET` | `/api/v1/analytics/overview` | Executive talent mobility indicators |

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` in the root directory:

```bash
cp .env.example .env
```

| Variable | Required | Default (Development) | Purpose |
|---|---|---|---|
| `POSTGRES_USER` | Yes | `eagle_vision` | PostgreSQL database user |
| `POSTGRES_PASSWORD` | Yes | `password` | PostgreSQL database password |
| `POSTGRES_DB` | Yes | `eagle_vision_db` | PostgreSQL database name |
| `POSTGRES_HOST` | Yes | `localhost` (or `db` in Docker) | Database hostname |
| `POSTGRES_PORT` | Yes | `5432` | Database port |
| `REDIS_HOST` | No | `localhost` (or `redis` in Docker) | Redis hostname |
| `REDIS_PORT` | No | `6379` | Redis port |
| `JWT_SECRET_KEY` | Yes | `change-this-secret-key` | Cryptographic secret for signing JWTs |
| `JWT_ALGORITHM` | No | `HS256` | JWT signing algorithm |
| `GEMINI_API_KEY` | No | `""` | Google Gemini API Key for LLM embeddings |
| `GEMINI_MODEL` | No | `gemini-2.5-flash` | Gemini model for explainability |
| `EMBEDDING_MODEL` | No | `models/text-embedding-004` | Model for 768-dim semantic vectors |

---

## 🧪 Testing

The test suite includes algorithmic unit tests and asynchronous API integration tests.

### Run All Backend Tests
```bash
cd backend
.\.venv\Scripts\activate
pytest ../tests/ -v
```

### Run Specific Test Modules
```bash
# Test AI hybrid matching algorithm
pytest ../tests/unit/test_matcher.py -v

# Test API endpoints and health checks
pytest ../tests/integration/test_api.py -v
```

### Test Frontend Build
```bash
cd frontend
npm run build
```

---

## 🚢 Deployment & Infrastructure

### Production Docker Images

Build self-contained production images:

```bash
# Build Backend
docker build -t eagle-vision-backend:latest ./backend

# Build Frontend (Multi-stage with Nginx)
docker build -t eagle-vision-frontend:latest ./frontend
```

### Kubernetes Deployment

Pre-configured Kubernetes manifests are located in [`infra/k8s/`](file:///d:/Eagle-Vision-/infra/k8s):

```bash
kubectl apply -f infra/k8s/deployment.yaml
```

---

## 🔧 Troubleshooting

### 1. Database Connection Refused
- **Issue**: `asyncpg.exceptions.CannotConnectNowError: connection refused`
- **Fix**: Verify PostgreSQL is running on port 5432:
  ```bash
  docker ps
  # Or start the database container
  docker compose up -d db
  ```

### 2. Missing `pgvector` Extension
- **Issue**: `type "vector" does not exist`
- **Fix**: Ensure you are using the official pgvector image (`pgvector/pgvector:pg16`), or execute:
  ```sql
  CREATE EXTENSION IF NOT EXISTS vector;
  ```

### 3. Frontend Port Conflict
- **Issue**: `Port 3000 is already in use`
- **Fix**: Launch Vite on an alternative port:
  ```bash
  npm run dev -- --port 3001
  ```

### 4. Gemini API Key Not Configured
- **Issue**: AI embeddings return mock zero-vectors.
- **Fix**: Provide your Gemini API key in `.env`:
  ```bash
  GEMINI_API_KEY=your_actual_gemini_api_key
  ```

---

## 📄 License & Contributing

Distributed under the **MIT License**. Contributions, bug reports, and feature requests are welcome via Pull Requests following the checklist in [`.github/pull_request_template.md`](file:///d:/Eagle-Vision-/.github/pull_request_template.md).
