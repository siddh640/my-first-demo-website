/*
  # American Institute Database Schema

  1. New Tables
    - `students` - Student information and enrollment details
    - `teachers` - Teacher profiles and qualifications
    - `parents` - Parent contact information
    - `teacher_feedback` - Feedback from teachers to students
    - `assignments` - Student assignments and submissions
    - `progress` - Academic progress tracking
    - `parent_teacher_messages` - Communication between parents and teachers
    - `class_schedules` - Class scheduling information
    - `attendance` - Student attendance records

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
    - Teachers can access their students' data
    - Parents can access their children's data
*/

-- Create custom types
CREATE TYPE user_role AS ENUM ('student', 'teacher', 'parent', 'admin');
CREATE TYPE assignment_status AS ENUM ('pending', 'submitted', 'graded');
CREATE TYPE feedback_category AS ENUM ('progress', 'behavior', 'homework', 'achievement');
CREATE TYPE message_status AS ENUM ('sent', 'read', 'replied');

-- Students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  level text NOT NULL,
  teacher_id uuid REFERENCES teachers(id),
  parent_id uuid REFERENCES parents(id),
  profile_image text,
  enrollment_date date NOT NULL DEFAULT CURRENT_DATE,
  phone text,
  address text,
  emergency_contact text,
  emergency_phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Teachers table
CREATE TABLE IF NOT EXISTS teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  specialization text NOT NULL,
  bio text,
  profile_image text,
  years_experience integer DEFAULT 0,
  certifications text[] DEFAULT '{}',
  phone text,
  office_hours text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Parents table
CREATE TABLE IF NOT EXISTS parents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  address text,
  student_ids uuid[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Teacher feedback table
CREATE TABLE IF NOT EXISTS teacher_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  subject text NOT NULL,
  message text NOT NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  category feedback_category NOT NULL DEFAULT 'progress',
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Assignments table
CREATE TABLE IF NOT EXISTS assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  due_date date NOT NULL,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  status assignment_status DEFAULT 'pending',
  grade integer CHECK (grade >= 0 AND grade <= 100),
  submission_date timestamptz,
  submission_content text,
  teacher_comments text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Progress tracking table
CREATE TABLE IF NOT EXISTS progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject text NOT NULL,
  current_score integer NOT NULL CHECK (current_score >= 0 AND current_score <= 100),
  previous_score integer CHECK (previous_score >= 0 AND previous_score <= 100),
  assessment_date date NOT NULL DEFAULT CURRENT_DATE,
  assessment_type text DEFAULT 'quiz',
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Parent-teacher messages table
CREATE TABLE IF NOT EXISTS parent_teacher_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject text NOT NULL,
  message text NOT NULL,
  status message_status DEFAULT 'sent',
  reply_to uuid REFERENCES parent_teacher_messages(id),
  created_at timestamptz DEFAULT now(),
  read_at timestamptz
);

-- Class schedules table
CREATE TABLE IF NOT EXISTS class_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  class_name text NOT NULL,
  level text NOT NULL,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  room text,
  max_students integer DEFAULT 15,
  created_at timestamptz DEFAULT now()
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_schedule_id uuid NOT NULL REFERENCES class_schedules(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_teacher_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Create policies for students
CREATE POLICY "Students can read own data"
  ON students
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

CREATE POLICY "Teachers can read their students"
  ON students
  FOR SELECT
  TO authenticated
  USING (teacher_id = auth.uid());

CREATE POLICY "Parents can read their children"
  ON students
  FOR SELECT
  TO authenticated
  USING (parent_id = auth.uid());

-- Create policies for teachers
CREATE POLICY "Teachers can read all teacher data"
  ON teachers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Teachers can update own data"
  ON teachers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create policies for parents
CREATE POLICY "Parents can read own data"
  ON parents
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Parents can update own data"
  ON parents
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create policies for teacher feedback
CREATE POLICY "Students can read own feedback"
  ON teacher_feedback
  FOR SELECT
  TO authenticated
  USING (student_id IN (
    SELECT id FROM students WHERE auth.uid()::text = id::text
  ));

CREATE POLICY "Teachers can read/write feedback for their students"
  ON teacher_feedback
  FOR ALL
  TO authenticated
  USING (teacher_id = auth.uid() OR student_id IN (
    SELECT id FROM students WHERE teacher_id = auth.uid()
  ));

CREATE POLICY "Parents can read feedback for their children"
  ON teacher_feedback
  FOR SELECT
  TO authenticated
  USING (student_id IN (
    SELECT id FROM students WHERE parent_id = auth.uid()
  ));

-- Create policies for assignments
CREATE POLICY "Students can read own assignments"
  ON assignments
  FOR SELECT
  TO authenticated
  USING (student_id IN (
    SELECT id FROM students WHERE auth.uid()::text = id::text
  ));

CREATE POLICY "Teachers can manage assignments for their students"
  ON assignments
  FOR ALL
  TO authenticated
  USING (teacher_id = auth.uid() OR student_id IN (
    SELECT id FROM students WHERE teacher_id = auth.uid()
  ));

CREATE POLICY "Parents can read assignments for their children"
  ON assignments
  FOR SELECT
  TO authenticated
  USING (student_id IN (
    SELECT id FROM students WHERE parent_id = auth.uid()
  ));

-- Create policies for progress
CREATE POLICY "Students can read own progress"
  ON progress
  FOR SELECT
  TO authenticated
  USING (student_id IN (
    SELECT id FROM students WHERE auth.uid()::text = id::text
  ));

CREATE POLICY "Teachers can manage progress for their students"
  ON progress
  FOR ALL
  TO authenticated
  USING (student_id IN (
    SELECT id FROM students WHERE teacher_id = auth.uid()
  ));

CREATE POLICY "Parents can read progress for their children"
  ON progress
  FOR SELECT
  TO authenticated
  USING (student_id IN (
    SELECT id FROM students WHERE parent_id = auth.uid()
  ));

-- Create policies for messages
CREATE POLICY "Parents can read/write own messages"
  ON parent_teacher_messages
  FOR ALL
  TO authenticated
  USING (parent_id = auth.uid());

CREATE POLICY "Teachers can read/write messages for their students"
  ON parent_teacher_messages
  FOR ALL
  TO authenticated
  USING (teacher_id = auth.uid());

-- Create policies for class schedules
CREATE POLICY "Everyone can read class schedules"
  ON class_schedules
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Teachers can manage own class schedules"
  ON class_schedules
  FOR ALL
  TO authenticated
  USING (teacher_id = auth.uid());

-- Create policies for attendance
CREATE POLICY "Students can read own attendance"
  ON attendance
  FOR SELECT
  TO authenticated
  USING (student_id IN (
    SELECT id FROM students WHERE auth.uid()::text = id::text
  ));

CREATE POLICY "Teachers can manage attendance for their classes"
  ON attendance
  FOR ALL
  TO authenticated
  USING (class_schedule_id IN (
    SELECT id FROM class_schedules WHERE teacher_id = auth.uid()
  ));

CREATE POLICY "Parents can read attendance for their children"
  ON attendance
  FOR SELECT
  TO authenticated
  USING (student_id IN (
    SELECT id FROM students WHERE parent_id = auth.uid()
  ));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_students_teacher_id ON students(teacher_id);
CREATE INDEX IF NOT EXISTS idx_students_parent_id ON students(parent_id);
CREATE INDEX IF NOT EXISTS idx_feedback_student_id ON teacher_feedback(student_id);
CREATE INDEX IF NOT EXISTS idx_feedback_teacher_id ON teacher_feedback(teacher_id);
CREATE INDEX IF NOT EXISTS idx_assignments_student_id ON assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_assignments_teacher_id ON assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_progress_student_id ON progress(student_id);
CREATE INDEX IF NOT EXISTS idx_messages_parent_id ON parent_teacher_messages(parent_id);
CREATE INDEX IF NOT EXISTS idx_messages_teacher_id ON parent_teacher_messages(teacher_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);

-- Insert sample data for demonstration
INSERT INTO teachers (id, name, email, specialization, bio, years_experience, certifications) VALUES
  ('demo-teacher-1', 'Sarah Johnson', 'sarah.johnson@americaninstitute.edu', 'Advanced Grammar & Conversation', 'Experienced ESL instructor with expertise in advanced grammar and conversation skills.', 15, '{"TESOL", "Cambridge DELTA"}'),
  ('demo-teacher-2', 'Michael Williams', 'michael.williams@americaninstitute.edu', 'Beginner & Intermediate English', 'Specializes in foundational English skills and vocabulary building.', 8, '{"TEFL", "CELTA"}'),
  ('demo-teacher-3', 'Elena Martinez', 'elena.martinez@americaninstitute.edu', 'Business English', 'Business English specialist with corporate training experience.', 12, '{"TESOL", "Business English Certificate"}');

INSERT INTO parents (id, name, email, phone) VALUES
  ('demo-parent-1', 'Robert Johnson', 'robert.johnson@email.com', '+1-555-0123'),
  ('demo-parent-2', 'Lisa Chen', 'lisa.chen@email.com', '+1-555-0124'),
  ('demo-parent-3', 'Carlos Rodriguez', 'carlos.rodriguez@email.com', '+1-555-0125');

INSERT INTO students (id, name, email, level, teacher_id, parent_id, enrollment_date) VALUES
  ('demo-student-1', 'Emma Johnson', 'emma.johnson@email.com', 'Intermediate', 'demo-teacher-1', 'demo-parent-1', '2024-09-01'),
  ('demo-student-2', 'Michael Chen', 'michael.chen@email.com', 'Beginner', 'demo-teacher-2', 'demo-parent-2', '2024-09-15'),
  ('demo-student-3', 'Sofia Rodriguez', 'sofia.rodriguez@email.com', 'Advanced', 'demo-teacher-3', 'demo-parent-3', '2024-08-20');

-- Insert sample feedback
INSERT INTO teacher_feedback (student_id, teacher_id, subject, message, rating, category, date) VALUES
  ('demo-student-1', 'demo-teacher-1', 'Grammar Progress', 'Emma has shown excellent improvement in her understanding of past perfect tense. She actively participates in class discussions.', 5, 'progress', '2025-01-13'),
  ('demo-student-1', 'demo-teacher-1', 'Vocabulary Achievement', 'Outstanding performance on the vocabulary quiz! Emma scored 95% and demonstrated excellent retention.', 5, 'achievement', '2025-01-12'),
  ('demo-student-2', 'demo-teacher-2', 'Homework Completion', 'Michael consistently submits quality homework on time. His writing shows steady improvement.', 4, 'homework', '2025-01-11');

-- Insert sample assignments
INSERT INTO assignments (title, description, due_date, student_id, teacher_id, status, grade) VALUES
  ('Essay: My Future Goals', 'Write a 300-word essay about your future career goals using future tenses.', '2025-01-15', 'demo-student-1', 'demo-teacher-1', 'pending', NULL),
  ('Grammar Exercise Set 5', 'Complete exercises 1-20 on past perfect tense from the workbook.', '2025-01-14', 'demo-student-1', 'demo-teacher-1', 'submitted', NULL),
  ('Vocabulary Quiz Chapter 8', 'Online quiz covering vocabulary from Chapter 8 - Business Terms.', '2025-01-12', 'demo-student-1', 'demo-teacher-1', 'graded', 95);

-- Insert sample progress data
INSERT INTO progress (student_id, subject, current_score, previous_score, assessment_date) VALUES
  ('demo-student-1', 'Grammar', 88, 82, '2025-01-10'),
  ('demo-student-1', 'Vocabulary', 92, 89, '2025-01-10'),
  ('demo-student-1', 'Speaking', 85, 85, '2025-01-10'),
  ('demo-student-1', 'Writing', 79, 83, '2025-01-10');