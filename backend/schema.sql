-- =========================
-- TEAMS
-- =========================

CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    team_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO teams (team_name, description)
VALUES
('Tech Team', 'Engineering and Development Team'),
('Sales Team', 'Sales and Business Development Team'),
('Talent Acquisition', 'HR and Recruitment Team'),
('Admin', 'System Administration Team');


-- =========================
-- ROLES
-- =========================

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(100) NOT NULL,
    team_id INT REFERENCES teams(id) ON DELETE CASCADE
);

INSERT INTO roles (role_name, team_id)
VALUES

-- Tech Team (team_id = 1)
('Team Lead', 1),
('Backend Engineer', 1),
('Frontend Engineer', 1),
('DevOps Engineer', 1),
('Intern', 1),

-- Sales Team (team_id = 2)
('Team Lead', 2),
('Employee', 2),
('Intern', 2),

-- Talent Acquisition (team_id = 3)
('Team Lead', 3),
('Employee', 3),
('Intern', 3);

-- No roles for Admin Team (team_id = 4)


-- =========================
-- USERS
-- =========================

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,

    role_id INT REFERENCES roles(id) ON DELETE SET NULL,
    team_id INT REFERENCES teams(id) ON DELETE SET NULL,

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =========================
-- INCIDENTS
-- =========================

CREATE TABLE incidents (
    id SERIAL PRIMARY KEY,

    title VARCHAR(255) NOT NULL,
    description TEXT,

    severity VARCHAR(20) NOT NULL
    CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),

    status VARCHAR(20) NOT NULL
    CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')),

    source VARCHAR(100),

    created_by INT REFERENCES users(id) ON DELETE SET NULL,
    assigned_to INT REFERENCES users(id) ON DELETE SET NULL,
    team_id INT REFERENCES teams(id) ON DELETE SET NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);


-- =========================
-- INCIDENT LOGS
-- =========================

CREATE TABLE incident_logs (
    id SERIAL PRIMARY KEY,

    incident_id INT REFERENCES incidents(id) ON DELETE CASCADE,

    action_type VARCHAR(100) NOT NULL,
    message TEXT,

    performed_by INT REFERENCES users(id) ON DELETE SET NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =========================
-- INCIDENT COMMENTS
-- =========================

CREATE TABLE incident_comments (
    id SERIAL PRIMARY KEY,

    incident_id INT REFERENCES incidents(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,

    comment TEXT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =========================
-- CENTRALIZED LOGS
-- =========================

CREATE TABLE logs (
    id SERIAL PRIMARY KEY,

    service_name VARCHAR(100) NOT NULL,
    source VARCHAR(100),

    event_type VARCHAR(100) NOT NULL,

    log_level VARCHAR(20) NOT NULL
    CHECK (log_level IN ('INFO', 'WARNING', 'ERROR', 'CRITICAL')),

    message TEXT NOT NULL,

    incident_id INT REFERENCES incidents(id) ON DELETE SET NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);