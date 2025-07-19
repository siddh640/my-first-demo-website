import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
export interface Student {
  id: string
  name: string
  email: string
  level: string
  teacher_id: string
  profile_image?: string
  enrollment_date: string
  parent_id: string
  created_at: string
  updated_at: string
}

export interface Teacher {
  id: string
  name: string
  email: string
  specialization: string
  bio: string
  profile_image?: string
  years_experience: number
  certifications: string[]
  created_at: string
}

export interface TeacherFeedback {
  id: string
  student_id: string
  teacher_id: string
  subject: string
  message: string
  rating: number
  category: 'progress' | 'behavior' | 'homework' | 'achievement'
  date: string
  created_at: string
}

export interface Assignment {
  id: string
  title: string
  description: string
  due_date: string
  student_id: string
  teacher_id: string
  status: 'pending' | 'submitted' | 'graded'
  grade?: number
  submission_date?: string
  created_at: string
}

export interface Progress {
  id: string
  student_id: string
  subject: string
  current_score: number
  previous_score: number
  assessment_date: string
  created_at: string
}

export interface Parent {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  created_at: string
  updated_at: string
}

// Additional interfaces for new features
export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  created_at: string
  action_url?: string
}

export interface ChatMessage {
  id: string
  sender_id: string
  sender_name: string
  sender_type: 'parent' | 'teacher' | 'student'
  recipient_id: string
  message: string
  timestamp: string
  read: boolean
  student_id?: string
  student_name?: string
}

export interface CommunityMessage {
  id: string
  parent_id: string
  parent_name: string
  student_name: string
  message: string
  timestamp: string
  likes: number
  category: 'general' | 'homework' | 'events' | 'achievements' | 'concerns'
}

export interface CommunityReply {
  id: string
  message_id: string
  parent_id: string
  parent_name: string
  message: string
  timestamp: string
  likes: number
}

export interface UserPresence {
  user_id: string
  status: 'online' | 'away' | 'offline'
  last_seen: string
}

export interface ClassSchedule {
  id: string
  teacher_id: string
  class_name: string
  level: string
  day_of_week: number
  start_time: string
  end_time: string
  room?: string
  max_students: number
  created_at: string
}

export interface Attendance {
  id: string
  student_id: string
  class_schedule_id: string
  date: string
  status: 'present' | 'absent' | 'late' | 'excused'
  notes?: string
  created_at: string
}

// Legacy API functions for backward compatibility
export { studentAPI, teacherAPI, feedbackAPI, assignmentAPI, progressAPI, parentAPI } from './api'