-- CampusOS Database Schema for Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  deadline TIMESTAMP NULL,
  priority TEXT CHECK (priority IN ('High', 'Medium', 'Low')) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'completed', 'archived')) DEFAULT 'pending',
  source TEXT DEFAULT 'Manual',
  ai_summary TEXT DEFAULT '',
  steps JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Inbox items table
CREATE TABLE IF NOT EXISTS inbox_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  kind TEXT CHECK (kind IN ('Screenshot', 'PDF', 'Voice', 'Manual')) NOT NULL,
  status TEXT CHECK (status IN ('New', 'Processed', 'Archived')) DEFAULT 'New',
  extracted TEXT NOT NULL,
  original_text TEXT NOT NULL,
  file_path TEXT NULL,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Voice notes table
CREATE TABLE IF NOT EXISTS voice_notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  transcript TEXT NOT NULL,
  duration INTEGER DEFAULT 0,
  file_path TEXT NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON tasks(deadline);
CREATE INDEX IF NOT EXISTS idx_inbox_status ON inbox_items(status);
CREATE INDEX IF NOT EXISTS idx_voice_processed ON voice_notes(processed);

-- Sample data for testing
INSERT INTO tasks (title, subject, deadline, priority, status, source, ai_summary, steps)
VALUES 
  ('Complete Physics Lab Report', 'Physics', NOW() + INTERVAL '3 days', 'High', 'pending', 'Manual', 
   'Complete the pendulum experiment lab report including calculations and error analysis.',
   '[{"label": "Gather experimental data", "done": true}, {"label": "Perform calculations", "done": false}, {"label": "Write conclusion", "done": false}]'::jsonb),
  
  ('Study for Math Midterm', 'Mathematics', NOW() + INTERVAL '7 days', 'High', 'pending', 'Manual',
   'Review chapters 5-8 covering calculus and derivatives.',
   '[{"label": "Review lecture notes", "done": false}, {"label": "Practice problems", "done": false}, {"label": "Take practice exam", "done": false}]'::jsonb),
  
  ('Chemistry Problem Set', 'Chemistry', NOW() + INTERVAL '2 days', 'Medium', 'pending', 'Manual',
   'Complete problem set on chemical equilibrium and Le Chatelier principle.',
   '[{"label": "Read chapter 14", "done": true}, {"label": "Complete problems 1-10", "done": false}]'::jsonb),
  
  ('English Essay Draft', 'English', NOW() + INTERVAL '5 days', 'Medium', 'pending', 'Manual',
   'Write first draft of analytical essay on Shakespearean sonnets.',
   '[{"label": "Research sources", "done": true}, {"label": "Create outline", "done": true}, {"label": "Write introduction", "done": false}, {"label": "Write body paragraphs", "done": false}]'::jsonb),
  
  ('Prepare Presentation', 'History', NOW() + INTERVAL '10 days', 'Low', 'pending', 'Manual',
   'Create PowerPoint presentation on World War II.',
   '[{"label": "Research topic", "done": false}, {"label": "Design slides", "done": false}, {"label": "Practice delivery", "done": false}]'::jsonb);

-- Sample inbox items
INSERT INTO inbox_items (kind, status, extracted, original_text)
VALUES
  ('Manual', 'New', 'Review biology chapter 7 before tomorrow', 'Review biology chapter 7 before tomorrow'),
  ('Manual', 'Processed', 'Group project meeting at 3pm', 'Group project meeting at 3pm');
