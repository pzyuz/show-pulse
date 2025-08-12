-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE show_status AS ENUM ('returning', 'ended', 'cancelled', 'unknown');
CREATE TYPE notification_type AS ENUM ('renewal', 'cancellation', 'date_change', 'all');

-- Shows table
CREATE TABLE shows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tmdb_id INTEGER UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    poster_url TEXT,
    status show_status NOT NULL DEFAULT 'unknown',
    next_air_date DATE,
    last_air_date DATE,
    network VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User shows table (junction table for user-show relationships)
CREATE TABLE user_shows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    show_id UUID NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
    notify_on notification_type NOT NULL DEFAULT 'all',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, show_id)
);

-- Show snapshots table for tracking changes
CREATE TABLE show_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    show_id UUID NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
    payload_json JSONB NOT NULL,
    payload_hash VARCHAR(64) NOT NULL,
    fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_shows_tmdb_id ON shows(tmdb_id);
CREATE INDEX idx_shows_status ON shows(status);
CREATE INDEX idx_user_shows_user_id ON user_shows(user_id);
CREATE INDEX idx_user_shows_show_id ON user_shows(show_id);
CREATE INDEX idx_show_snapshots_show_id ON show_snapshots(show_id);
CREATE INDEX idx_show_snapshots_fetched_at ON show_snapshots(fetched_at);

-- Enable Row Level Security
ALTER TABLE shows ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_shows ENABLE ROW LEVEL SECURITY;
ALTER TABLE show_snapshots ENABLE ROW LEVEL SECURITY;

-- RLS Policies for shows table
-- Anyone can read show information
CREATE POLICY "Anyone can read shows" ON shows
    FOR SELECT USING (true);

-- Only authenticated users can insert/update shows (for admin purposes)
CREATE POLICY "Authenticated users can manage shows" ON shows
    FOR ALL USING (auth.role() = 'authenticated');

-- RLS Policies for user_shows table
-- Users can only see their own show relationships
CREATE POLICY "Users can view own user_shows" ON user_shows
    FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert/update their own show relationships
CREATE POLICY "Users can manage own user_shows" ON user_shows
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for show_snapshots table
-- No public read access to snapshots
CREATE POLICY "No public read access to snapshots" ON show_snapshots
    FOR SELECT USING (false);

-- Only authenticated users can insert snapshots (for system updates)
CREATE POLICY "Authenticated users can insert snapshots" ON show_snapshots
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_shows_updated_at 
    BEFORE UPDATE ON shows 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for testing
INSERT INTO shows (tmdb_id, title, status, network, created_at, updated_at) VALUES
(1399, 'Game of Thrones', 'ended', 'HBO', NOW(), NOW()),
(1396, 'Breaking Bad', 'ended', 'AMC', NOW(), NOW()),
(1398, 'The Walking Dead', 'ended', 'AMC', NOW(), NOW()),
(1397, 'Stranger Things', 'returning', 'Netflix', NOW(), NOW()),
(1395, 'The Office', 'ended', 'NBC', NOW(), NOW())
ON CONFLICT (tmdb_id) DO NOTHING;
