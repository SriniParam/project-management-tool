-- Create database if not exists (NeonDB)
-- Database creation is typically handled by NeonDB console
-- This script is for table creation

CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS assignees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    avatar_initials VARCHAR(8) NOT NULL,
    avatar_color VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO assignees (name, role, email, avatar_initials, avatar_color) 
VALUES
    ('Ananya Rao', 'Product Manager', 'ananya.rao@example.com', 'AR', '#0052cc'),
    ('Vikram Mehta', 'Frontend Engineer', 'vikram.mehta@example.com', 'VM', '#36b37e'),
    ('Priya Nair', 'QA Analyst', 'priya.nair@example.com', 'PN', '#6554c0'),
    ('Rahul Sharma', 'Backend Engineer', 'rahul.sharma@example.com', 'RS', '#ff991f')
ON CONFLICT (email) DO NOTHING;

CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'Todo',
    due_date DATE,
    priority VARCHAR(20) DEFAULT 'Medium',
    assignee_id INT,
    project_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assignee_id) REFERENCES assignees(id) ON DELETE SET NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);
