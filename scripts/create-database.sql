-- Create Alumni Portal Database Schema
-- Database: alumni_ete_new

-- Users table to store all user information
CREATE TABLE users (
    id VARCHAR(24) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('student', 'alumni', 'faculty', 'admin') NOT NULL,
    student_id VARCHAR(50),
    graduation_year INT,
    cgpa DECIMAL(3,2),
    company VARCHAR(255),
    position VARCHAR(255),
    location VARCHAR(255),
    experience VARCHAR(100),
    skills JSON,
    github_url VARCHAR(255),
    linkedin_url VARCHAR(255),
    avatar_url VARCHAR(255),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_graduation_year (graduation_year),
    INDEX idx_student_id (student_id)
);

-- OTP verification table
CREATE TABLE otp_verifications (
    id VARCHAR(24) PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    purpose ENUM('registration', 'password_reset', 'email_change') NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_email_otp (email, otp_code),
    INDEX idx_expires_at (expires_at)
);

-- Projects table
CREATE TABLE projects (
    id VARCHAR(24) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    project_type ENUM('mini', 'major') NOT NULL,
    technologies JSON NOT NULL,
    github_url VARCHAR(255),
    demo_url VARCHAR(255),
    author_id VARCHAR(24) NOT NULL,
    likes_count INT DEFAULT 0,
    views_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_author_id (author_id),
    INDEX idx_project_type (project_type),
    INDEX idx_created_at (created_at)
);

-- Jobs table
CREATE TABLE jobs (
    id VARCHAR(24) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    job_type ENUM('full-time', 'part-time', 'internship', 'contract') NOT NULL,
    experience_required VARCHAR(100),
    salary_range VARCHAR(100),
    description TEXT NOT NULL,
    requirements JSON NOT NULL,
    posted_by VARCHAR(24) NOT NULL,
    applicants_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (posted_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_posted_by (posted_by),
    INDEX idx_job_type (job_type),
    INDEX idx_location (location),
    INDEX idx_created_at (created_at),
    INDEX idx_is_active (is_active)
);

-- Job interests table (many-to-many relationship)
CREATE TABLE job_interests (
    id VARCHAR(24) PRIMARY KEY,
    job_id VARCHAR(24) NOT NULL,
    user_id VARCHAR(24) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_job_user (job_id, user_id),
    INDEX idx_job_id (job_id),
    INDEX idx_user_id (user_id)
);

-- Events table
CREATE TABLE events (
    id VARCHAR(24) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    event_date TIMESTAMP NOT NULL,
    location VARCHAR(255),
    event_type VARCHAR(100),
    max_attendees INT,
    current_attendees INT DEFAULT 0,
    created_by VARCHAR(24) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_created_by (created_by),
    INDEX idx_event_date (event_date),
    INDEX idx_is_active (is_active)
);

-- Event RSVPs table
CREATE TABLE event_rsvps (
    id VARCHAR(24) PRIMARY KEY,
    event_id VARCHAR(24) NOT NULL,
    user_id VARCHAR(24) NOT NULL,
    status ENUM('attending', 'not_attending', 'maybe') DEFAULT 'attending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_event_user (event_id, user_id),
    INDEX idx_event_id (event_id),
    INDEX idx_user_id (user_id)
);

-- Gallery table
CREATE TABLE gallery (
    id VARCHAR(24) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500) NOT NULL,
    tags JSON,
    event_id VARCHAR(24),
    uploaded_by VARCHAR(24) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_uploaded_by (uploaded_by),
    INDEX idx_event_id (event_id),
    INDEX idx_created_at (created_at)
);

-- Messages table
CREATE TABLE messages (
    id VARCHAR(24) PRIMARY KEY,
    sender_id VARCHAR(24) NOT NULL,
    recipient_id VARCHAR(24) NOT NULL,
    subject VARCHAR(255),
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    parent_message_id VARCHAR(24),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_message_id) REFERENCES messages(id) ON DELETE SET NULL,
    INDEX idx_sender_id (sender_id),
    INDEX idx_recipient_id (recipient_id),
    INDEX idx_created_at (created_at),
    INDEX idx_is_read (is_read)
);

-- Notifications table
CREATE TABLE notifications (
    id VARCHAR(24) PRIMARY KEY,
    user_id VARCHAR(24) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type ENUM('job_posted', 'message_received', 'event_created', 'project_liked', 'interest_received') NOT NULL,
    related_id VARCHAR(24),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_notification_type (notification_type),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
);

-- Project likes table
CREATE TABLE project_likes (
    id VARCHAR(24) PRIMARY KEY,
    project_id VARCHAR(24) NOT NULL,
    user_id VARCHAR(24) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_project_user (project_id, user_id),
    INDEX idx_project_id (project_id),
    INDEX idx_user_id (user_id)
);

-- Refresh tokens table for JWT management
CREATE TABLE refresh_tokens (
    id VARCHAR(24) PRIMARY KEY,
    user_id VARCHAR(24) NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_token_hash (token_hash),
    INDEX idx_expires_at (expires_at)
);

-- Rate limiting table
CREATE TABLE rate_limits (
    id VARCHAR(24) PRIMARY KEY,
    identifier VARCHAR(255) NOT NULL, -- IP address or user ID
    action_type VARCHAR(100) NOT NULL, -- login, register, refresh, etc.
    attempts INT DEFAULT 1,
    window_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_identifier_action (identifier, action_type),
    INDEX idx_identifier (identifier),
    INDEX idx_window_start (window_start)
);
