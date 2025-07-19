import { supabase } from './supabase'
import type { Student, Teacher, Parent, TeacherFeedback, Assignment, Progress } from './supabase'

// Enhanced Student API
export const studentAPI = {
  // Get all students (for teachers/admin)
  async getAllStudents() {
    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        teacher:teachers(id, name, email, specialization),
        parent:parents(id, name, email, phone)
      `)
      .order('name')
    
    if (error) throw error
    return data
  },

  // Get students by teacher
  async getStudentsByTeacher(teacherId: string) {
    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        parent:parents(id, name, email, phone)
      `)
      .eq('teacher_id', teacherId)
      .order('name')
    
    if (error) throw error
    return data
  },

  // Get students by parent
  async getStudentsByParent(parentId: string) {
    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        teacher:teachers(id, name, email, specialization)
      `)
      .eq('parent_id', parentId)
      .order('name')
    
    if (error) throw error
    return data
  },

  // Create new student
  async createStudent(studentData: Omit<Student, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('students')
      .insert([{
        ...studentData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Update student
  async updateStudent(id: string, updates: Partial<Student>) {
    const { data, error } = await supabase
      .from('students')
      .update({ 
        ...updates, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Delete student
  async deleteStudent(id: string) {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  },

  // Search students
  async searchStudents(query: string) {
    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        teacher:teachers(name, email),
        parent:parents(name, email)
      `)
      .or(`name.ilike.%${query}%,email.ilike.%${query}%,level.ilike.%${query}%`)
      .order('name')
    
    if (error) throw error
    return data
  }
}

// Enhanced Teacher API
export const teacherAPI = {
  // Create new teacher
  async createTeacher(teacherData: Omit<Teacher, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('teachers')
      .insert([{
        ...teacherData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Update teacher
  async updateTeacher(id: string, updates: Partial<Teacher>) {
    const { data, error } = await supabase
      .from('teachers')
      .update({ 
        ...updates, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Get teacher with students
  async getTeacherWithStudents(teacherId: string) {
    const { data, error } = await supabase
      .from('teachers')
      .select(`
        *,
        students:students(
          id, name, email, level, enrollment_date,
          parent:parents(name, email, phone)
        )
      `)
      .eq('id', teacherId)
      .single()
    
    if (error) throw error
    return data
  },

  // Search teachers
  async searchTeachers(query: string) {
    const { data, error } = await supabase
      .from('teachers')
      .select('*')
      .or(`name.ilike.%${query}%,email.ilike.%${query}%,specialization.ilike.%${query}%`)
      .order('name')
    
    if (error) throw error
    return data
  }
}

// Enhanced Parent API
export const parentAPI = {
  // Create new parent
  async createParent(parentData: Omit<Parent, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('parents')
      .insert([{
        ...parentData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Update parent
  async updateParent(id: string, updates: Partial<Parent>) {
    const { data, error } = await supabase
      .from('parents')
      .update({ 
        ...updates, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Get parent with children
  async getParentWithChildren(parentId: string) {
    const { data, error } = await supabase
      .from('parents')
      .select(`
        *,
        students:students(
          id, name, email, level, enrollment_date,
          teacher:teachers(name, email, specialization)
        )
      `)
      .eq('id', parentId)
      .single()
    
    if (error) throw error
    return data
  },

  // Get messages between parent and teacher
  async getMessages(parentId: string, teacherId?: string) {
    let query = supabase
      .from('parent_teacher_messages')
      .select(`
        *,
        teacher:teachers(name, email),
        student:students(name),
        parent:parents(name)
      `)
      .eq('parent_id', parentId)
      .order('created_at', { ascending: false })

    if (teacherId) {
      query = query.eq('teacher_id', teacherId)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  },

  // Send message to teacher (enhanced)
  async sendMessageToTeacher(message: {
    parent_id: string
    teacher_id: string
    student_id: string
    subject: string
    message: string
    reply_to?: string
  }) {
    const { data, error } = await supabase
      .from('parent_teacher_messages')
      .insert([{
        ...message,
        created_at: new Date().toISOString(),
        status: 'sent'
      }])
      .select(`
        *,
        teacher:teachers(name, email),
        student:students(name),
        parent:parents(name)
      `)
      .single()
    
    if (error) throw error
    return data
  },

  // Mark message as read
  async markMessageAsRead(messageId: string) {
    const { data, error } = await supabase
      .from('parent_teacher_messages')
      .update({ 
        status: 'read',
        read_at: new Date().toISOString()
      })
      .eq('id', messageId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Enhanced Feedback API
export const feedbackAPI = {
  // Get feedback with filters
  async getFeedbackWithFilters(filters: {
    student_id?: string
    teacher_id?: string
    category?: string
    date_from?: string
    date_to?: string
  }) {
    let query = supabase
      .from('teacher_feedback')
      .select(`
        *,
        teacher:teachers(name, email),
        student:students(name, level)
      `)

    if (filters.student_id) query = query.eq('student_id', filters.student_id)
    if (filters.teacher_id) query = query.eq('teacher_id', filters.teacher_id)
    if (filters.category) query = query.eq('category', filters.category)
    if (filters.date_from) query = query.gte('date', filters.date_from)
    if (filters.date_to) query = query.lte('date', filters.date_to)

    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  // Get feedback statistics
  async getFeedbackStats(studentId: string) {
    const { data, error } = await supabase
      .from('teacher_feedback')
      .select('rating, category')
      .eq('student_id', studentId)

    if (error) throw error

    const stats = {
      average_rating: 0,
      total_feedback: data.length,
      by_category: {
        progress: 0,
        achievement: 0,
        homework: 0,
        behavior: 0
      }
    }

    if (data.length > 0) {
      stats.average_rating = data.reduce((sum, item) => sum + item.rating, 0) / data.length
      data.forEach(item => {
        stats.by_category[item.category as keyof typeof stats.by_category]++
      })
    }

    return stats
  },

  // Bulk create feedback
  async bulkCreateFeedback(feedbackList: Omit<TeacherFeedback, 'id' | 'created_at'>[]) {
    const { data, error } = await supabase
      .from('teacher_feedback')
      .insert(feedbackList.map(feedback => ({
        ...feedback,
        created_at: new Date().toISOString()
      })))
      .select()
    
    if (error) throw error
    return data
  }
}

// Enhanced Assignment API
export const assignmentAPI = {
  // Get assignments with filters
  async getAssignmentsWithFilters(filters: {
    student_id?: string
    teacher_id?: string
    status?: string
    due_date_from?: string
    due_date_to?: string
  }) {
    let query = supabase
      .from('assignments')
      .select(`
        *,
        teacher:teachers(name, email),
        student:students(name, level)
      `)

    if (filters.student_id) query = query.eq('student_id', filters.student_id)
    if (filters.teacher_id) query = query.eq('teacher_id', filters.teacher_id)
    if (filters.status) query = query.eq('status', filters.status)
    if (filters.due_date_from) query = query.gte('due_date', filters.due_date_from)
    if (filters.due_date_to) query = query.lte('due_date', filters.due_date_to)

    const { data, error } = await query.order('due_date', { ascending: false })
    if (error) throw error
    return data
  },

  // Submit assignment
  async submitAssignment(assignmentId: string, submissionContent: string) {
    const { data, error } = await supabase
      .from('assignments')
      .update({
        status: 'submitted',
        submission_content: submissionContent,
        submission_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', assignmentId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Grade assignment
  async gradeAssignment(assignmentId: string, grade: number, comments?: string) {
    const { data, error } = await supabase
      .from('assignments')
      .update({
        status: 'graded',
        grade,
        teacher_comments: comments,
        updated_at: new Date().toISOString()
      })
      .eq('id', assignmentId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Get assignment statistics
  async getAssignmentStats(studentId: string) {
    const { data, error } = await supabase
      .from('assignments')
      .select('status, grade')
      .eq('student_id', studentId)

    if (error) throw error

    const stats = {
      total: data.length,
      pending: data.filter(a => a.status === 'pending').length,
      submitted: data.filter(a => a.status === 'submitted').length,
      graded: data.filter(a => a.status === 'graded').length,
      average_grade: 0
    }

    const gradedAssignments = data.filter(a => a.grade !== null)
    if (gradedAssignments.length > 0) {
      stats.average_grade = gradedAssignments.reduce((sum, a) => sum + (a.grade || 0), 0) / gradedAssignments.length
    }

    return stats
  }
}

// Enhanced Progress API
export const progressAPI = {
  // Get progress trends
  async getProgressTrends(studentId: string, subject?: string) {
    let query = supabase
      .from('progress')
      .select('*')
      .eq('student_id', studentId)

    if (subject) query = query.eq('subject', subject)

    const { data, error } = await query.order('assessment_date', { ascending: true })
    if (error) throw error
    return data
  },

  // Get class averages
  async getClassAverages(teacherId: string, subject: string) {
    const { data, error } = await supabase
      .from('progress')
      .select(`
        current_score,
        student:students!inner(teacher_id)
      `)
      .eq('students.teacher_id', teacherId)
      .eq('subject', subject)

    if (error) throw error

    if (data.length === 0) return { average: 0, count: 0 }

    const average = data.reduce((sum, item) => sum + item.current_score, 0) / data.length
    return { average: Math.round(average), count: data.length }
  },

  // Bulk update progress
  async bulkUpdateProgress(progressList: Omit<Progress, 'id' | 'created_at'>[]) {
    const { data, error } = await supabase
      .from('progress')
      .insert(progressList.map(progress => ({
        ...progress,
        created_at: new Date().toISOString()
      })))
      .select()
    
    if (error) throw error
    return data
  }
}

// Attendance API
export const attendanceAPI = {
  // Record attendance
  async recordAttendance(attendanceData: {
    student_id: string
    class_schedule_id: string
    date: string
    status: 'present' | 'absent' | 'late' | 'excused'
    notes?: string
  }) {
    const { data, error } = await supabase
      .from('attendance')
      .insert([{
        ...attendanceData,
        created_at: new Date().toISOString()
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Get attendance for student
  async getStudentAttendance(studentId: string, dateFrom?: string, dateTo?: string) {
    let query = supabase
      .from('attendance')
      .select(`
        *,
        class_schedule:class_schedules(class_name, start_time, end_time)
      `)
      .eq('student_id', studentId)

    if (dateFrom) query = query.gte('date', dateFrom)
    if (dateTo) query = query.lte('date', dateTo)

    const { data, error } = await query.order('date', { ascending: false })
    if (error) throw error
    return data
  },

  // Get attendance statistics
  async getAttendanceStats(studentId: string) {
    const { data, error } = await supabase
      .from('attendance')
      .select('status')
      .eq('student_id', studentId)

    if (error) throw error

    const stats = {
      total: data.length,
      present: data.filter(a => a.status === 'present').length,
      absent: data.filter(a => a.status === 'absent').length,
      late: data.filter(a => a.status === 'late').length,
      excused: data.filter(a => a.status === 'excused').length,
      attendance_rate: 0
    }

    if (stats.total > 0) {
      stats.attendance_rate = Math.round(((stats.present + stats.late) / stats.total) * 100)
    }

    return stats
  }
}

// Class Schedule API
export const scheduleAPI = {
  // Create class schedule
  async createSchedule(scheduleData: {
    teacher_id: string
    class_name: string
    level: string
    day_of_week: number
    start_time: string
    end_time: string
    room?: string
    max_students?: number
  }) {
    const { data, error } = await supabase
      .from('class_schedules')
      .insert([{
        ...scheduleData,
        created_at: new Date().toISOString()
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Get schedules by teacher
  async getTeacherSchedules(teacherId: string) {
    const { data, error } = await supabase
      .from('class_schedules')
      .select('*')
      .eq('teacher_id', teacherId)
      .order('day_of_week')
      .order('start_time')
    
    if (error) throw error
    return data
  },

  // Get all schedules
  async getAllSchedules() {
    const { data, error } = await supabase
      .from('class_schedules')
      .select(`
        *,
        teacher:teachers(name, email)
      `)
      .order('day_of_week')
      .order('start_time')
    
    if (error) throw error
    return data
  }
}

// Real-time subscriptions
export const realtimeAPI = {
  // Subscribe to student updates
  subscribeToStudentUpdates(studentId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`student-${studentId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'teacher_feedback',
        filter: `student_id=eq.${studentId}`
      }, callback)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'assignments',
        filter: `student_id=eq.${studentId}`
      }, callback)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'progress',
        filter: `student_id=eq.${studentId}`
      }, callback)
      .subscribe()
  },

  // Subscribe to teacher updates
  subscribeToTeacherUpdates(teacherId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`teacher-${teacherId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'parent_teacher_messages',
        filter: `teacher_id=eq.${teacherId}`
      }, callback)
      .subscribe()
  },

  // Subscribe to parent updates
  subscribeToParentUpdates(parentId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`parent-${parentId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'parent_teacher_messages',
        filter: `parent_id=eq.${parentId}`
      }, callback)
      .subscribe()
  }
}