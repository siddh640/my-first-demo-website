import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-anon-key'

// Validate environment variables
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('⚠️ Supabase environment variables not configured. Using demo values.')
  console.warn('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file')
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
  student_ids: string[]
  created_at: string
}

// API Functions
export const studentAPI = {
  // Get student by ID
  async getStudent(id: string) {
    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        teacher:teachers(name, email, specialization),
        parent:parents(name, email, phone)
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // Get all students
  async getAllStudents() {
    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        teacher:teachers(name, email, specialization)
      `)
      .order('name')
    
    if (error) throw error
    return data
  },

  // Update student
  async updateStudent(id: string, updates: Partial<Student>) {
    const { data, error } = await supabase
      .from('students')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

export const teacherAPI = {
  // Get all teachers
  async getAllTeachers() {
    const { data, error } = await supabase
      .from('teachers')
      .select('*')
      .order('name')
    
    if (error) throw error
    return data
  },

  // Get teacher by ID
  async getTeacher(id: string) {
    const { data, error } = await supabase
      .from('teachers')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  }
}

export const feedbackAPI = {
  // Get feedback for a student
  async getStudentFeedback(studentId: string) {
    const { data, error } = await supabase
      .from('teacher_feedback')
      .select(`
        *,
        teacher:teachers(name, email)
      `)
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Create new feedback
  async createFeedback(feedback: Omit<TeacherFeedback, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('teacher_feedback')
      .insert([{
        ...feedback,
        created_at: new Date().toISOString()
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Update feedback
  async updateFeedback(id: string, updates: Partial<TeacherFeedback>) {
    const { data, error } = await supabase
      .from('teacher_feedback')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

export const assignmentAPI = {
  // Get assignments for a student
  async getStudentAssignments(studentId: string) {
    const { data, error } = await supabase
      .from('assignments')
      .select(`
        *,
        teacher:teachers(name, email)
      `)
      .eq('student_id', studentId)
      .order('due_date', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Create new assignment
  async createAssignment(assignment: Omit<Assignment, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('assignments')
      .insert([{
        ...assignment,
        created_at: new Date().toISOString()
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Update assignment
  async updateAssignment(id: string, updates: Partial<Assignment>) {
    const { data, error } = await supabase
      .from('assignments')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

export const progressAPI = {
  // Get progress for a student
  async getStudentProgress(studentId: string) {
    const { data, error } = await supabase
      .from('progress')
      .select('*')
      .eq('student_id', studentId)
      .order('assessment_date', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Create new progress entry
  async createProgress(progress: Omit<Progress, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('progress')
      .insert([{
        ...progress,
        created_at: new Date().toISOString()
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

export const parentAPI = {
  // Get parent by ID
  async getParent(id: string) {
    const { data, error } = await supabase
      .from('parents')
      .select(`
        *,
        students:students(*)
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // Send message to teacher
  async sendMessageToTeacher(message: {
    parent_id: string
    teacher_id: string
    student_id: string
    subject: string
    message: string
  }) {
    const { data, error } = await supabase
      .from('parent_teacher_messages')
      .insert([{
        ...message,
        created_at: new Date().toISOString(),
        status: 'sent'
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}