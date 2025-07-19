/*
  # Additional Tables for Real-time Features

  1. New Tables
    - `notifications` - User notifications system
    - `chat_messages` - Direct messaging between users
    - `community_messages` - Parent community discussions
    - `community_replies` - Replies to community messages
    - `community_likes` - Like system for community posts
    - `user_presence` - Online/offline status tracking

  2. Security
    - Enable RLS on all new tables
    - Add appropriate policies for each user type
*/

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
  read boolean DEFAULT false,
  action_url text,
  created_at timestamptz DEFAULT now()
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL,
  sender_name text NOT NULL,
  sender_type text NOT NULL CHECK (sender_type IN ('parent', 'teacher', 'student')),
  recipient_id uuid NOT NULL,
  message text NOT NULL,
  timestamp timestamptz DEFAULT now(),
  read boolean DEFAULT false,
  student_id uuid,
  student_name text
);

-- Community messages table
CREATE TABLE IF NOT EXISTS community_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL,
  parent_name text NOT NULL,
  student_name text NOT NULL,
  message text NOT NULL,
  timestamp timestamptz DEFAULT now(),
  likes integer DEFAULT 0,
  category text NOT NULL CHECK (category IN ('general', 'homework', 'events', 'achievements', 'concerns'))
);

-- Community replies table
CREATE TABLE IF NOT EXISTS community_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES community_messages(id) ON DELETE CASCADE,
  parent_id uuid NOT NULL,
  parent_name text NOT NULL,
  message text NOT NULL,
  timestamp timestamptz DEFAULT now(),
  likes integer DEFAULT 0
);

-- Community likes table
CREATE TABLE IF NOT EXISTS community_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES community_messages(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(message_id, user_id)
);

-- User presence table
CREATE TABLE IF NOT EXISTS user_presence (
  user_id uuid PRIMARY KEY,
  status text NOT NULL CHECK (status IN ('online', 'away', 'offline')),
  last_seen timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;

-- Notifications policies
CREATE POLICY "Users can read own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id::text);

-- Chat messages policies
CREATE POLICY "Users can read own chat messages"
  ON chat_messages
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = sender_id::text OR auth.uid()::text = recipient_id::text);

CREATE POLICY "Users can send chat messages"
  ON chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = sender_id::text);

CREATE POLICY "Users can update own sent messages"
  ON chat_messages
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = sender_id::text OR auth.uid()::text = recipient_id::text);

-- Community messages policies
CREATE POLICY "Parents can read all community messages"
  ON community_messages
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Parents can create community messages"
  ON community_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = parent_id::text);

CREATE POLICY "Parents can update own community messages"
  ON community_messages
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = parent_id::text);

-- Community replies policies
CREATE POLICY "Parents can read all community replies"
  ON community_replies
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Parents can create community replies"
  ON community_replies
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = parent_id::text);

-- Community likes policies
CREATE POLICY "Users can manage own likes"
  ON community_likes
  FOR ALL
  TO authenticated
  USING (auth.uid()::text = user_id::text);

-- User presence policies
CREATE POLICY "Users can read all presence"
  ON user_presence
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own presence"
  ON user_presence
  FOR ALL
  TO authenticated
  USING (auth.uid()::text = user_id::text);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_recipient ON chat_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON chat_messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_community_messages_parent ON community_messages(parent_id);
CREATE INDEX IF NOT EXISTS idx_community_messages_category ON community_messages(category);
CREATE INDEX IF NOT EXISTS idx_community_messages_timestamp ON community_messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_community_replies_message ON community_replies(message_id);
CREATE INDEX IF NOT EXISTS idx_community_likes_message ON community_likes(message_id);
CREATE INDEX IF NOT EXISTS idx_user_presence_status ON user_presence(status);

-- Insert sample community data
INSERT INTO community_messages (id, parent_id, parent_name, student_name, message, category, likes, timestamp) VALUES
  ('comm-1', 'demo-parent-2', 'Lisa Chen', 'Michael Chen', 'Has anyone found good resources for helping with grammar homework? My son is struggling with past tense exercises.', 'homework', 5, now() - interval '2 hours'),
  ('comm-2', 'demo-parent-3', 'Carlos Rodriguez', 'Sofia Rodriguez', 'Great news! Sofia just passed her intermediate level exam with flying colors! Thank you to all the parents who shared study tips.', 'achievements', 12, now() - interval '3 hours'),
  ('comm-3', 'demo-parent-1', 'Robert Johnson', 'Emma Johnson', 'Don''t forget about the parent-teacher conference next Friday! I found it really helpful last time to prepare questions in advance.', 'events', 8, now() - interval '4 hours');

INSERT INTO community_replies (message_id, parent_id, parent_name, message, likes, timestamp) VALUES
  ('comm-1', 'demo-parent-3', 'Carlos Rodriguez', 'I recommend the Grammar Galaxy app! My daughter loves the interactive exercises.', 3, now() - interval '1.5 hours'),
  ('comm-1', 'demo-parent-1', 'Robert Johnson', 'We use flashcards and practice 15 minutes daily. It really helps with retention!', 2, now() - interval '1 hour'),
  ('comm-2', 'demo-parent-2', 'Lisa Chen', 'Congratulations! That''s wonderful news. Sofia has been working so hard.', 1, now() - interval '2.5 hours');

-- Insert sample notifications
INSERT INTO notifications (user_id, title, message, type, action_url) VALUES
  ('demo-student-1', 'New Assignment', 'You have a new essay assignment due next week.', 'info', '/dashboard/assignments'),
  ('demo-parent-1', 'Teacher Feedback', 'Your child has received new feedback from Ms. Johnson.', 'success', '/parent-dashboard/feedback'),
  ('demo-teacher-1', 'New Message', 'You have a new message from Robert Johnson.', 'info', '/messages');