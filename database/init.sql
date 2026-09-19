-- =============================================
-- Eagle Vision — PostgreSQL Database Initialization
-- =============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 1. Organizations & Departments
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    parent_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users & Authentication
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'employee',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Employees & Profiles
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    job_title VARCHAR(150) NOT NULL,
    location VARCHAR(100) NOT NULL,
    bio TEXT,
    open_to_relocation BOOLEAN DEFAULT FALSE,
    open_to_remote BOOLEAN DEFAULT TRUE,
    open_to_gigs BOOLEAN DEFAULT TRUE,
    open_to_roles BOOLEAN DEFAULT TRUE,
    profile_embedding vector(768),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Skills Taxonomy & Graph
CREATE TABLE IF NOT EXISTS skill_taxonomy_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES skill_taxonomy_categories(id) ON DELETE SET NULL,
    name VARCHAR(150) UNIQUE NOT NULL,
    description TEXT,
    skill_type VARCHAR(50) DEFAULT 'technical',
    embedding vector(768),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS skill_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    target_skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) NOT NULL,
    weight FLOAT NOT NULL DEFAULT 1.0,
    CONSTRAINT unique_skill_pair UNIQUE (source_skill_id, target_skill_id, relationship_type)
);

CREATE TABLE IF NOT EXISTS employee_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    proficiency_level INT DEFAULT 1 CHECK (proficiency_level BETWEEN 1 AND 5),
    years_of_experience FLOAT DEFAULT 0.0,
    is_verified BOOLEAN DEFAULT FALSE,
    is_hidden_transferable BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_emp_skill UNIQUE (employee_id, skill_id)
);

-- 5. Opportunities & Gigs
CREATE TABLE IF NOT EXISTS opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'role',
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    location VARCHAR(100) NOT NULL,
    is_remote BOOLEAN DEFAULT TRUE,
    status VARCHAR(50) DEFAULT 'open',
    embedding vector(768),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS opportunity_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    min_proficiency INT DEFAULT 1,
    is_mandatory BOOLEAN DEFAULT TRUE,
    importance_weight FLOAT DEFAULT 1.0,
    CONSTRAINT unique_opp_skill UNIQUE (opportunity_id, skill_id)
);

CREATE TABLE IF NOT EXISTS opportunity_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    match_score FLOAT DEFAULT 0.0,
    status VARCHAR(50) DEFAULT 'applied',
    applied_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_opp_app UNIQUE (opportunity_id, employee_id)
);

-- 6. Learning & Upskilling
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    provider VARCHAR(100) DEFAULT 'internal',
    url VARCHAR(500),
    duration_hours FLOAT DEFAULT 0.0,
    difficulty_level VARCHAR(50) DEFAULT 'intermediate',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS learning_paths (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    target_role_or_goal VARCHAR(200) NOT NULL,
    estimated_weeks INT DEFAULT 4,
    status VARCHAR(50) DEFAULT 'in_progress',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS learning_path_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    learning_path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    sequence_order INT DEFAULT 1,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ
);

-- 7. HNSW Vector Indexes for Fast Similarity Search
CREATE INDEX IF NOT EXISTS idx_skills_embedding ON skills 
USING hnsw (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS idx_employees_profile_embedding ON employees 
USING hnsw (profile_embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS idx_opportunities_embedding ON opportunities 
USING hnsw (embedding vector_cosine_ops);
