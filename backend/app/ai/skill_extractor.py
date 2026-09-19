"""
Eagle Vision — Skill Extractor & Normalizer
Canonical skill name resolution to prevent duplicates and improve matching
"""

from typing import List, Set

# Canonical skill name mapping: lowercase variant -> canonical form
SKILL_CANONICAL: dict[str, str] = {
    # Python ecosystem
    "python": "Python", "python3": "Python", "python 3": "Python",
    "python programming": "Python", "py": "Python",
    # FastAPI
    "fastapi": "FastAPI", "fast api": "FastAPI", "fast-api": "FastAPI",
    # Django / Flask
    "django": "Django", "flask": "Flask",
    # JavaScript
    "javascript": "JavaScript", "js": "JavaScript", "ecmascript": "JavaScript",
    "es6": "JavaScript", "es2015": "JavaScript",
    # TypeScript
    "typescript": "TypeScript", "ts": "TypeScript",
    # React
    "react": "React", "reactjs": "React", "react.js": "React", "react js": "React",
    # Vue
    "vue": "Vue.js", "vuejs": "Vue.js", "vue.js": "Vue.js", "vue js": "Vue.js",
    # Angular
    "angular": "Angular", "angularjs": "Angular",
    # Node.js
    "node": "Node.js", "nodejs": "Node.js", "node.js": "Node.js",
    # Databases
    "postgresql": "PostgreSQL", "postgres": "PostgreSQL", "pg": "PostgreSQL",
    "mysql": "MySQL", "mssql": "Microsoft SQL Server",
    "sqlite": "SQLite", "mongodb": "MongoDB", "mongo": "MongoDB",
    "elasticsearch": "Elasticsearch", "elastic": "Elasticsearch",
    "redis": "Redis",
    # SQL
    "sql": "SQL", "nosql": "NoSQL",
    # APIs
    "rest api": "REST API", "restful": "REST API", "rest": "REST API",
    "restful api": "REST API", "api development": "REST API",
    "graphql": "GraphQL",
    # Cloud
    "aws": "AWS", "amazon web services": "AWS",
    "azure": "Azure", "microsoft azure": "Azure",
    "gcp": "GCP", "google cloud": "GCP", "google cloud platform": "GCP",
    # Containers
    "docker": "Docker", "dockerfile": "Docker", "docker container": "Docker",
    "kubernetes": "Kubernetes", "k8s": "Kubernetes",
    # ML/AI
    "machine learning": "Machine Learning", "ml": "Machine Learning",
    "deep learning": "Deep Learning", "dl": "Deep Learning",
    "tensorflow": "TensorFlow", "tf": "TensorFlow",
    "pytorch": "PyTorch", "torch": "PyTorch",
    "scikit-learn": "Scikit-learn", "sklearn": "Scikit-learn",
    "nlp": "NLP", "natural language processing": "NLP",
    "computer vision": "Computer Vision", "cv": "Computer Vision",
    "pandas": "Pandas", "numpy": "NumPy",
    # DevOps
    "docker compose": "Docker Compose",
    "ci/cd": "CI/CD", "cicd": "CI/CD", "continuous integration": "CI/CD",
    "devops": "DevOps",
    "git": "Git", "github": "Git", "gitlab": "Git", "version control": "Git",
    "jenkins": "Jenkins", "github actions": "GitHub Actions",
    "terraform": "Terraform", "ansible": "Ansible",
    # Messaging
    "kafka": "Apache Kafka", "apache kafka": "Apache Kafka",
    "celery": "Celery", "rabbitmq": "RabbitMQ",
    # Web
    "html": "HTML", "css": "CSS",
    "tailwind": "Tailwind CSS", "tailwindcss": "Tailwind CSS",
    "bootstrap": "Bootstrap",
    # Languages
    "java": "Java", "spring": "Spring Boot", "spring boot": "Spring Boot",
    "go": "Go", "golang": "Go",
    "rust": "Rust", "c++": "C++", "c#": "C#", "ruby": "Ruby",
    "php": "PHP", "scala": "Scala", "kotlin": "Kotlin", "swift": "Swift",
    # Methodologies
    "agile": "Agile", "scrum": "Scrum", "kanban": "Kanban",
    "microservices": "Microservices",
    # Testing
    "pytest": "Pytest", "jest": "Jest", "unit testing": "Testing",
    # Data
    "data analysis": "Data Analysis", "data science": "Data Science",
    "spark": "Apache Spark", "hadoop": "Hadoop",
    # Other
    "linux": "Linux", "unix": "Linux",
    "nginx": "Nginx", "apache": "Apache",
}


def normalize_skill(raw_name: str) -> str:
    """
    Normalize a skill name to its canonical form.
    Falls back to Title-casing the input if no mapping found.
    """
    if not raw_name:
        return ""
    cleaned = raw_name.strip().lower()
    if cleaned in SKILL_CANONICAL:
        return SKILL_CANONICAL[cleaned]
    # Try partial match for compound skills
    for alias, canonical in SKILL_CANONICAL.items():
        if alias in cleaned or cleaned in alias:
            if abs(len(alias) - len(cleaned)) <= 3:
                return canonical
    # Default: title case the input
    return raw_name.strip().title()


def normalize_skills_list(skills: List[str]) -> List[str]:
    """Normalize and deduplicate a list of skill names."""
    seen: Set[str] = set()
    result: List[str] = []
    for s in skills:
        canonical = normalize_skill(s)
        if canonical.lower() not in seen and canonical:
            seen.add(canonical.lower())
            result.append(canonical)
    return result


def build_employee_skill_text(employee_skills: List[dict]) -> str:
    """
    Build a rich embedding-ready text string from an employee's skill list.
    employee_skills: [{"name": str, "level": int (1-5), "years": float}]
    """
    LEVEL_LABELS = {1: "beginner", 2: "basic", 3: "intermediate", 4: "advanced", 5: "expert"}
    parts = []
    for s in employee_skills:
        name = normalize_skill(s.get("name", ""))
        level = LEVEL_LABELS.get(s.get("level", 3), "intermediate")
        years = s.get("years", 0)
        if name:
            parts.append(f"{name} {level} {years:.0f}yr")
    return " ".join(parts)
