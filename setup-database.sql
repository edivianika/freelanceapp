-- Data Marketing Freelance Database Setup
-- Run this SQL in your Supabase SQL Editor

-- Drop existing tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS override_logs CASCADE;
DROP TABLE IF EXISTS submission_files CASCADE;
DROP TABLE IF EXISTS submissions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'marketer' CHECK (role IN ('admin', 'marketer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create submissions table
CREATE TABLE submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    project_interest TEXT,
    additional_info TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    is_hot_lead BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create submission_files table
CREATE TABLE submission_files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    file_type VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create override_logs table
CREATE TABLE override_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    admin_name VARCHAR(255),
    action_type VARCHAR(50) NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    target_id UUID NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert test users (password for both is 'admin123')
INSERT INTO users (name, email, password_hash, role) VALUES
('Admin User', 'admin@test.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKz2K', 'admin'),
('Marketer User', 'marketer@test.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKz2K', 'marketer');

-- Create indexes for better performance
CREATE INDEX idx_submissions_user_id ON submissions(user_id);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_submissions_created_at ON submissions(created_at);
CREATE INDEX idx_submission_files_submission_id ON submission_files(submission_id);
CREATE INDEX idx_override_logs_admin_id ON override_logs(admin_id);
CREATE INDEX idx_override_logs_created_at ON override_logs(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE override_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can read their own data
CREATE POLICY "Users can read own data" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Admins can read all user data
CREATE POLICY "Admins can read all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'admin'
        )
    );

-- Users can read their own submissions
CREATE POLICY "Users can read own submissions" ON submissions
    FOR SELECT USING (user_id::text = auth.uid()::text);

-- Users can insert their own submissions
CREATE POLICY "Users can insert own submissions" ON submissions
    FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

-- Users can update their own submissions
CREATE POLICY "Users can update own submissions" ON submissions
    FOR UPDATE USING (user_id::text = auth.uid()::text);

-- Admins can read all submissions
CREATE POLICY "Admins can read all submissions" ON submissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'admin'
        )
    );

-- Admins can update all submissions
CREATE POLICY "Admins can update all submissions" ON submissions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'admin'
        )
    );

-- Users can read files for their own submissions
CREATE POLICY "Users can read own submission files" ON submission_files
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM submissions 
            WHERE id = submission_id 
            AND user_id::text = auth.uid()::text
        )
    );

-- Users can insert files for their own submissions
CREATE POLICY "Users can insert own submission files" ON submission_files
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM submissions 
            WHERE id = submission_id 
            AND user_id::text = auth.uid()::text
        )
    );

-- Admins can read all submission files
CREATE POLICY "Admins can read all submission files" ON submission_files
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'admin'
        )
    );

-- Only admins can read override logs
CREATE POLICY "Admins can read override logs" ON override_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'admin'
        )
    );

-- Only admins can insert override logs
CREATE POLICY "Admins can insert override logs" ON override_logs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'admin'
        )
    );

-- Success message
SELECT 'Database setup completed successfully! You can now login with admin@test.com / admin123 or marketer@test.com / admin123' as message;







