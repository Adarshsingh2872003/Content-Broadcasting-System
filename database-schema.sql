-- =========================
-- CREATE DATABASE
-- =========================
CREATE DATABASE content;


-- =========================
-- USERS TABLE
-- =========================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) CHECK (role IN ('principal', 'teacher')) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =========================
-- SUBJECTS TABLE
-- =========================
CREATE TABLE subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =========================
-- CONTENT TABLE
-- =========================
CREATE TABLE contents (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    subject_id INT REFERENCES subjects(id) ON DELETE CASCADE,
    
    file_path TEXT NOT NULL,
    file_type VARCHAR(20),
    file_size INT,

    uploaded_by INT REFERENCES users(id) ON DELETE CASCADE,

    status VARCHAR(20) CHECK (status IN ('uploaded', 'pending', 'approved', 'rejected')) DEFAULT 'pending',

    rejection_reason TEXT,

    approved_by INT REFERENCES users(id),
    approved_at TIMESTAMP,

    start_time TIMESTAMP,
    end_time TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =========================
-- CONTENT SLOTS (SUBJECT BASED)
-- =========================
CREATE TABLE content_slots (
    id SERIAL PRIMARY KEY,
    subject_id INT REFERENCES subjects(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =========================
-- CONTENT SCHEDULE (ROTATION)
-- =========================
CREATE TABLE content_schedule (
    id SERIAL PRIMARY KEY,
    content_id INT REFERENCES contents(id) ON DELETE CASCADE,
    slot_id INT REFERENCES content_slots(id) ON DELETE CASCADE,

    rotation_order INT NOT NULL,
    duration INT NOT NULL, -- in minutes

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =========================
-- INDEXES (IMPORTANT FOR PERFORMANCE)
-- =========================
CREATE INDEX idx_content_status ON contents(status);
CREATE INDEX idx_content_subject ON contents(subject_id);
CREATE INDEX idx_schedule_slot ON content_schedule(slot_id);
CREATE INDEX idx_content_user_status ON contents(uploaded_by, status);


-- =========================
-- DEFAULT SUBJECTS
-- =========================
INSERT INTO subjects (name) VALUES
('maths'),
('science'),
('english');


-- =========================
-- SAMPLE SLOT PER SUBJECT
-- =========================
INSERT INTO content_slots (subject_id)
SELECT id FROM subjects;
