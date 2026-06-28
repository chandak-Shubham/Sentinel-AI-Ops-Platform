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



CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(100) NOT NULL,
    team_id INT REFERENCES teams(id) ON DELETE CASCADE,
    UNIQUE(role_name, team_id)
);
INSERT INTO roles (role_name, team_id)
VALUES

('Team Lead', 1),
('Backend Engineer', 1),
('Frontend Engineer', 1),
('DevOps Engineer', 1),
('Intern', 1),

('Team Lead', 2),
('Employee', 2),
('Intern', 2),

('Team Lead', 3),
('Employee', 3),
('Intern', 3),

('System Admin', 4);




CREATE TABLE permissions (id SERIAL PRIMARY KEY,
permission_name VARCHAR(100) UNIQUE NOT NULL
);
INSERT INTO permissions (permission_name)
VALUES
('incident:create'),
('incident:view'),
('incident:update'),
('incident:delete'),
('incident:assign'),
('incident:resolve'),

('comment:create'),
('comment:view'),
('comment:update'),
('comment:delete'),

('log:view'),

('user:create'),
('user:view'),
('user:update'),
('user:delete');



CREATE TABLE role_permissions (
role_id INT REFERENCES roles(id) ON DELETE CASCADE,
permission_id INT REFERENCES permissions(id) ON DELETE CASCADE,
PRIMARY KEY (role_id, permission_id)
);

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.role_name = 'System Admin';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.permission_name IN (
    'incident:create',
    'incident:view',
    'incident:update',
    'incident:delete',
    'incident:assign',
    'incident:resolve',
    'comment:create',
    'comment:view',
    'comment:update',
    'comment:delete',
    'log:view'
)
WHERE r.role_name = 'Team Lead';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.permission_name IN (
    'incident:create',
    'incident:view',
    'incident:update',
    'incident:assign',
    'incident:resolve',
    'comment:create',
    'comment:view',
    'comment:update'
)
WHERE r.role_name IN ('Backend Engineer', 'Frontend Engineer', 'DevOps Engineer', 'Employee');

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.permission_name IN (
    'incident:view',
    'comment:view'
)
WHERE r.role_name = 'Intern';



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



CREATE TABLE incidents (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    severity VARCHAR(20) NOT NULL
        CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN'
        CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')),
    source VARCHAR(100),
    created_by INT REFERENCES users(id) ON DELETE SET NULL,
    assigned_to INT REFERENCES users(id) ON DELETE SET NULL,
    team_id INT REFERENCES teams(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);



CREATE TABLE activity_logs (
    id SERIAL PRIMARY KEY,
    action VARCHAR(100) NOT NULL,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    incident_id INT REFERENCES incidents(id) ON DELETE SET NULL,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE webhook_logs (
    id SERIAL PRIMARY KEY,
    service VARCHAR(100) NOT NULL,
    level VARCHAR(20) NOT NULL
        CHECK (level IN ('INFO', 'WARNING', 'ERROR', 'CRITICAL')),
    message TEXT NOT NULL,
    payload JSONB NOT NULL,
    received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE ai_analysis (
    id SERIAL PRIMARY KEY,
    webhook_log_id INT UNIQUE
        REFERENCES webhook_logs(id)
        ON DELETE CASCADE,
    summary TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL,
    root_cause TEXT NOT NULL,
    recommendations JSONB NOT NULL,
    confidence FLOAT NOT NULL,
    should_create_incident BOOLEAN NOT NULL,
    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
