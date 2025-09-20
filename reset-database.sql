-- Reset database and create clean schema without RLS issues

-- Drop existing tables if they exist
DROP TABLE IF EXISTS override_logs CASCADE;
DROP TABLE IF EXISTS status_logs CASCADE;
DROP TABLE IF EXISTS submission_files CASCADE;
DROP TABLE IF EXISTS submissions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop types if they exist
DROP TYPE IF EXISTS follow_up_status CASCADE;
DROP TYPE IF EXISTS submission_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- Drop functions if they exist
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS check_ownership_rules() CASCADE;
DROP FUNCTION IF EXISTS log_status_change() CASCADE;
DROP FUNCTION IF EXISTS release_expired_ownership() CASCADE;

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'marketer');
CREATE TYPE submission_status AS ENUM ('own', 'duplicate', 'expired', 'hot_lead');
CREATE TYPE follow_up_status AS ENUM ('follow-up', 'pending', 'no_response', 'closing');

-- Users table
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'marketer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Submissions table
CREATE TABLE submissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    project_interest VARCHAR(255) NOT NULL,
    notes TEXT,
    status submission_status NOT NULL DEFAULT 'own',
    follow_up_status follow_up_status,
    is_hot_lead BOOLEAN DEFAULT FALSE,
    ownership_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Submission files table
CREATE TABLE submission_files (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Status logs table
CREATE TABLE status_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    status submission_status NOT NULL,
    follow_up_status follow_up_status,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Override logs table
CREATE TABLE override_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    old_owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    new_owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_submissions_phone ON submissions(phone_number);
CREATE INDEX idx_submissions_user_id ON submissions(user_id);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_submissions_created_at ON submissions(created_at);
CREATE INDEX idx_submissions_ownership_expires ON submissions(ownership_expires_at);
CREATE INDEX idx_submission_files_submission_id ON submission_files(submission_id);
CREATE INDEX idx_status_logs_submission_id ON status_logs(submission_id);
CREATE INDEX idx_override_logs_admin_id ON override_logs(admin_id);
CREATE INDEX idx_override_logs_submission_id ON override_logs(submission_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_submissions_updated_at BEFORE UPDATE ON submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to check ownership rules
CREATE OR REPLACE FUNCTION check_ownership_rules()
RETURNS TRIGGER AS $$
DECLARE
    existing_submission submissions%ROWTYPE;
    submission_count INTEGER;
    two_months_ago TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Set two months ago timestamp
    two_months_ago := NOW() - INTERVAL '2 months';
    
    -- Check if phone number already exists
    SELECT * INTO existing_submission 
    FROM submissions 
    WHERE phone_number = NEW.phone_number 
    AND id != COALESCE(NEW.id, uuid_nil())
    ORDER BY created_at DESC 
    LIMIT 1;
    
    IF existing_submission.id IS NOT NULL THEN
        -- Check if existing submission is older than 2 months
        IF existing_submission.created_at < two_months_ago THEN
            -- Ownership moves to new marketer
            NEW.status := 'own';
            NEW.ownership_expires_at := NOW() + INTERVAL '30 days';
            
            -- Update old submission to expired
            UPDATE submissions 
            SET status = 'expired', 
                ownership_expires_at = NULL
            WHERE id = existing_submission.id;
        ELSE
            -- Keep with old marketer
            NEW.status := 'duplicate';
            NEW.ownership_expires_at := NULL;
        END IF;
    ELSE
        -- New phone number, owned by submitting marketer
        NEW.status := 'own';
        NEW.ownership_expires_at := NOW() + INTERVAL '30 days';
    END IF;
    
    -- Check for hot lead (3+ submissions of same phone number)
    SELECT COUNT(*) INTO submission_count
    FROM submissions 
    WHERE phone_number = NEW.phone_number;
    
    IF submission_count >= 3 THEN
        NEW.is_hot_lead := TRUE;
        NEW.status := 'hot_lead';
        
        -- Update all previous submissions of this phone number to hot lead
        UPDATE submissions 
        SET is_hot_lead = TRUE, status = 'hot_lead'
        WHERE phone_number = NEW.phone_number 
        AND id != NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for ownership rules
CREATE TRIGGER check_ownership_rules_trigger
    BEFORE INSERT OR UPDATE ON submissions
    FOR EACH ROW EXECUTE FUNCTION check_ownership_rules();

-- Function to log status changes
CREATE OR REPLACE FUNCTION log_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Only log if status or follow_up_status changed
    IF OLD.status IS DISTINCT FROM NEW.status OR OLD.follow_up_status IS DISTINCT FROM NEW.follow_up_status THEN
        INSERT INTO status_logs (submission_id, status, follow_up_status)
        VALUES (NEW.id, NEW.status, NEW.follow_up_status);
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for status logging
CREATE TRIGGER log_status_change_trigger
    AFTER UPDATE ON submissions
    FOR EACH ROW EXECUTE FUNCTION log_status_change();

-- Function to release expired ownership
CREATE OR REPLACE FUNCTION release_expired_ownership()
RETURNS void AS $$
BEGIN
    UPDATE submissions 
    SET status = 'expired', 
        ownership_expires_at = NULL,
        follow_up_status = NULL
    WHERE ownership_expires_at IS NOT NULL 
    AND ownership_expires_at < NOW()
    AND status NOT IN ('expired', 'hot_lead');
END;
$$ language 'plpgsql';

-- Insert default admin user (password: admin123)
INSERT INTO users (name, email, password_hash, role) VALUES 
('Admin User', 'admin@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Create a test marketer user (password: marketer123)
INSERT INTO users (name, email, password_hash, role) VALUES 
('Test Marketer', 'marketer@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'marketer');

-- Create submission-files bucket in storage (run this in Supabase dashboard)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('submission-files', 'submission-files', true);


