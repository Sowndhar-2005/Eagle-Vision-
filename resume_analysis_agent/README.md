# 🎯 Resume Analysis Agent

**Autonomous, Fair, and Explainable AI Resume-to-Score Evaluation Agent**

Inspired by the architecture of [interviewstreet/hiring-agent](https://github.com/interviewstreet/hiring-agent), this agent provides an end-to-end, bias-mitigated pipeline that converts resumes (PDF, Markdown, or text) into standardized structured records, optionally enriches candidate profiles with GitHub developer signals, and scores candidates against customizable role rubrics.

Designed as an **independent, decoupled module** with zero dependencies on external host frameworks, it can run as an embedded Python library, a standalone CLI utility, or a containerized REST microservice.

---

## 📑 Table of Contents
- [Architecture & Flow](#-architecture--flow)
- [Key Features & Fairness Guardrails](#-key-features--fairness-guardrails)
- [Installation](#-installation)
- [Quick Start: Python SDK](#-quick-start-python-sdk)
- [REST Microservice API](#-rest-microservice-api)
- [CLI Tool](#-cli-tool)
- [Role Rubric Customization](#-role-rubric-customization)
- [Integration Guide (ATS / Host App)](#-integration-guide-ats--host-app)

---

## 🏗️ Architecture & Flow

```
[Resume: PDF / Text]
         │
         ▼
[ResumeParser (PyMuPDF / pymupdf4llm)] ── (Sanitize zero-width chars)
         │
         ▼
[ResumeExtractor (Gemini / Heuristic)] ──► Normalized JSONResume
         │
         ▼
[GitHubEnricher] (Optional) ────────────► Repos, Stars, Top Projects
         │
         ▼
[ResumeEvaluator + RoleRubric] ─────────► Fairness-Constrained LLM / Heuristic Scoring
         │
         ▼
[AnalysisReport] ───────────────────────► Scores, Evidence, Breakdown, Recommendation
```

---

## ✨ Key Features & Fairness Guardrails

- 🛡️ **Fairness & Demographic Blindness**: Strictly ignores candidate names, gender, age, nationality, university brand prestige, and GPAs. Scores are awarded solely on verified technical evidence and project complexity.
- 🔒 **Security Sanitization**: Strips zero-width unicode characters and invisible prompt injections designed to manipulate LLM scoring.
- 🌐 **GitHub Developer Signals**: Automatically resolves candidate GitHub handles to inspect repository activity, star counts, and original project contributions.
- 📐 **Dynamic Role Rubrics**: Evaluate against shipped roles (`software_engineering_intern`, `backend_engineer`, `ai_ml_engineer`) or define custom rubrics via JSON or Python.
- 🧩 **Zero Hard Coupling**: Completely standalone module with its own models, configuration, and interfaces.

---

## 📦 Installation

```bash
cd resume_analysis_agent
pip install -r requirements.txt
```

Set your Google Gemini API key (optional for local/test runs, recommended for production):
```bash
cp .env.example .env
# Edit .env and supply GEMINI_API_KEY=your_key
```

---

## 🚀 Quick Start: Python SDK

Integrate directly into any Python application in just 3 lines:

```python
from resume_analysis_agent import ResumeAnalysisAgent

agent = ResumeAnalysisAgent()
report = agent.analyze("path/to/candidate_resume.pdf", role="software_engineering_intern")

print(f"Candidate: {report.resume.basics.name}")
print(f"Normalized Score: {report.evaluation.normalized_score}/100")
print(f"Verdict: {report.evaluation.recommendation}")
print(f"Rationale: {report.evaluation.summary_rationale}")

# Print full markdown breakdown
print(agent.format_report_markdown(report))
```

---

## 🌐 REST Microservice API

Launch the standalone FastAPI microservice:

```bash
python -m resume_analysis_agent.cli serve --port 8001
# Or: uvicorn resume_analysis_agent.api:app --port 8001
```

- **Interactive Swagger Docs**: [http://localhost:8001/docs](http://localhost:8001/docs)
- **Health Check**: `GET /api/v1/health`
- **List Available Rubrics**: `GET /api/v1/roles`
- **Register Custom Rubric**: `POST /api/v1/roles`
- **Analyze Resume File**: `POST /api/v1/analyze` (Upload multipart file)
- **Analyze Resume Text**: `POST /api/v1/analyze/text` (JSON payload)

---

## 💻 CLI Tool

Analyze resumes directly from your terminal:

```bash
# List available roles
python -m resume_analysis_agent.cli list-roles

# Analyze a PDF resume against a backend role
python -m resume_analysis_agent.cli analyze ./resume.pdf --role backend_engineer

# Export results as JSON
python -m resume_analysis_agent.cli analyze ./resume.pdf --format json --output report.json
```

---

## 🎨 Role Rubric Customization

Custom roles are defined with straightforward JSON files placed under `roles/<role_name>/role.json`:

```json
{
  "name": "devops_engineer",
  "position_title": "DevOps & Infrastructure Engineer",
  "categories": [
    {
      "key": "cloud_automation",
      "label": "Terraform & AWS",
      "max": 40,
      "description": "Infrastructure as Code and cloud deployment depth.",
      "icon": "☁️"
    },
    {
      "key": "kubernetes_docker",
      "label": "Containerization",
      "max": 30,
      "description": "Kubernetes manifest writing and Docker optimization.",
      "icon": "🐳"
    },
    {
      "key": "monitoring_ci",
      "label": "Observability & CI/CD",
      "max": 30,
      "description": "Prometheus, Grafana, and automated release gates.",
      "icon": "📈"
    }
  ],
  "bonus_max": 10,
  "passing_cutoff": 65
}
```

Register roles programmatically at runtime:
```python
from resume_analysis_agent import ResumeAnalysisAgent, RoleRubric

agent = ResumeAnalysisAgent()
agent.register_role(my_custom_rubric)
```

---

## 🤝 Integration Guide (ATS / Host App)

See [`integration_example.py`](file:///c:/Users/arjun/.antigravity/Eagle-Vision-/resume_analysis_agent/integration_example.py) for a complete working demonstration of how to consume the agent as an internal service or external HTTP client.
