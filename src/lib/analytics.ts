import { supabase } from './supabase'

export interface AnalyticsData {
  student_performance: {
    average_grade: number
    attendance_rate: number
    assignment_completion: number
    improvement_trend: 'up' | 'down' | 'stable'
  }
  teacher_metrics: {
    total_students: number
    average_feedback_rating: number
    assignments_created: number
    response_time: number
  }
  class_statistics: {
    enrollment_count: number
    level_distribution: Record<string, number>
    completion_rates: Record<string, number>
  }
}

class AnalyticsService {
  // Student Analytics
  async getStudentPerformance(studentId: string, dateFrom?: string, dateTo?: string) {
    try {
      // Get assignments data
      let assignmentQuery = supabase
        .from('assignments')
        .select('status, grade, created_at')
        .eq('student_id', studentId)

      if (dateFrom) assignmentQuery = assignmentQuery.gte('created_at', dateFrom)
      if (dateTo) assignmentQuery = assignmentQuery.lte('created_at', dateTo)

      const { data: assignments } = await assignmentQuery

      // Get attendance data
      let attendanceQuery = supabase
        .from('attendance')
        .select('status, date')
        .eq('student_id', studentId)

      if (dateFrom) attendanceQuery = attendanceQuery.gte('date', dateFrom)
      if (dateTo) attendanceQuery = attendanceQuery.lte('date', dateTo)

      const { data: attendance } = await attendanceQuery

      // Get progress data
      let progressQuery = supabase
        .from('progress')
        .select('current_score, previous_score, assessment_date')
        .eq('student_id', studentId)

      if (dateFrom) progressQuery = progressQuery.gte('assessment_date', dateFrom)
      if (dateTo) progressQuery = progressQuery.lte('assessment_date', dateTo)

      const { data: progress } = await progressQuery.order('assessment_date', { ascending: true })

      // Calculate metrics
      const gradedAssignments = assignments?.filter(a => a.grade !== null) || []
      const averageGrade = gradedAssignments.length > 0 
        ? gradedAssignments.reduce((sum, a) => sum + (a.grade || 0), 0) / gradedAssignments.length 
        : 0

      const totalAttendance = attendance?.length || 0
      const presentCount = attendance?.filter(a => a.status === 'present' || a.status === 'late').length || 0
      const attendanceRate = totalAttendance > 0 ? (presentCount / totalAttendance) * 100 : 0

      const totalAssignments = assignments?.length || 0
      const completedAssignments = assignments?.filter(a => a.status !== 'pending').length || 0
      const assignmentCompletion = totalAssignments > 0 ? (completedAssignments / totalAssignments) * 100 : 0

      // Calculate improvement trend
      let improvementTrend: 'up' | 'down' | 'stable' = 'stable'
      if (progress && progress.length >= 2) {
        const recent = progress.slice(-3)
        const averageRecent = recent.reduce((sum, p) => sum + p.current_score, 0) / recent.length
        const older = progress.slice(-6, -3)
        if (older.length > 0) {
          const averageOlder = older.reduce((sum, p) => sum + p.current_score, 0) / older.length
          improvementTrend = averageRecent > averageOlder ? 'up' : 
                           averageRecent < averageOlder ? 'down' : 'stable'
        }
      }

      return {
        average_grade: Math.round(averageGrade),
        attendance_rate: Math.round(attendanceRate),
        assignment_completion: Math.round(assignmentCompletion),
        improvement_trend: improvementTrend,
        total_assignments: totalAssignments,
        graded_assignments: gradedAssignments.length,
        total_attendance_records: totalAttendance
      }
    } catch (error) {
      console.error('Error getting student performance:', error)
      throw error
    }
  }

  // Teacher Analytics
  async getTeacherMetrics(teacherId: string, dateFrom?: string, dateTo?: string) {
    try {
      // Get students count
      const { data: students } = await supabase
        .from('students')
        .select('id')
        .eq('teacher_id', teacherId)

      const studentIds = students?.map(s => s.id) || []

      // Get feedback ratings
      let feedbackQuery = supabase
        .from('teacher_feedback')
        .select('rating, created_at')
        .eq('teacher_id', teacherId)

      if (dateFrom) feedbackQuery = feedbackQuery.gte('created_at', dateFrom)
      if (dateTo) feedbackQuery = feedbackQuery.lte('created_at', dateTo)

      const { data: feedback } = await feedbackQuery

      // Get assignments created
      let assignmentQuery = supabase
        .from('assignments')
        .select('id, created_at')
        .eq('teacher_id', teacherId)

      if (dateFrom) assignmentQuery = assignmentQuery.gte('created_at', dateFrom)
      if (dateTo) assignmentQuery = assignmentQuery.lte('created_at', dateTo)

      const { data: assignments } = await assignmentQuery

      // Get message response times
      const { data: messages } = await supabase
        .from('parent_teacher_messages')
        .select('created_at, read_at')
        .eq('teacher_id', teacherId)
        .not('read_at', 'is', null)

      // Calculate metrics
      const averageFeedbackRating = feedback && feedback.length > 0
        ? feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length
        : 0

      const averageResponseTime = messages && messages.length > 0
        ? messages.reduce((sum, m) => {
            const responseTime = new Date(m.read_at!).getTime() - new Date(m.created_at).getTime()
            return sum + (responseTime / (1000 * 60 * 60)) // Convert to hours
          }, 0) / messages.length
        : 0

      return {
        total_students: studentIds.length,
        average_feedback_rating: Math.round(averageFeedbackRating * 10) / 10,
        assignments_created: assignments?.length || 0,
        response_time: Math.round(averageResponseTime * 10) / 10,
        feedback_given: feedback?.length || 0,
        messages_responded: messages?.length || 0
      }
    } catch (error) {
      console.error('Error getting teacher metrics:', error)
      throw error
    }
  }

  // Class Analytics
  async getClassStatistics(teacherId?: string) {
    try {
      let studentQuery = supabase.from('students').select('level, enrollment_date')
      
      if (teacherId) {
        studentQuery = studentQuery.eq('teacher_id', teacherId)
      }

      const { data: students } = await studentQuery

      // Level distribution
      const levelDistribution: Record<string, number> = {}
      students?.forEach(student => {
        levelDistribution[student.level] = (levelDistribution[student.level] || 0) + 1
      })

      // Get completion rates by level
      const completionRates: Record<string, number> = {}
      
      for (const level of Object.keys(levelDistribution)) {
        const levelStudents = students?.filter(s => s.level === level).map(s => s.id) || []
        
        if (levelStudents.length > 0) {
          const { data: assignments } = await supabase
            .from('assignments')
            .select('status')
            .in('student_id', levelStudents)

          const totalAssignments = assignments?.length || 0
          const completedAssignments = assignments?.filter(a => a.status !== 'pending').length || 0
          
          completionRates[level] = totalAssignments > 0 
            ? Math.round((completedAssignments / totalAssignments) * 100)
            : 0
        }
      }

      return {
        enrollment_count: students?.length || 0,
        level_distribution: levelDistribution,
        completion_rates: completionRates
      }
    } catch (error) {
      console.error('Error getting class statistics:', error)
      throw error
    }
  }

  // Dashboard Analytics
  async getDashboardAnalytics(userId: string, userType: 'student' | 'teacher' | 'parent') {
    try {
      switch (userType) {
        case 'student':
          const studentPerf = await this.getStudentPerformance(userId)
          
          // Get recent activity
          const { data: recentFeedback } = await supabase
            .from('teacher_feedback')
            .select('created_at')
            .eq('student_id', userId)
            .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

          const { data: upcomingAssignments } = await supabase
            .from('assignments')
            .select('due_date')
            .eq('student_id', userId)
            .eq('status', 'pending')
            .gte('due_date', new Date().toISOString().split('T')[0])

          return {
            ...studentPerf,
            recent_feedback_count: recentFeedback?.length || 0,
            upcoming_assignments: upcomingAssignments?.length || 0
          }

        case 'teacher':
          const teacherMetrics = await this.getTeacherMetrics(userId)
          const classStats = await this.getClassStatistics(userId)
          
          // Get pending items
          const { data: pendingAssignments } = await supabase
            .from('assignments')
            .select('id')
            .eq('teacher_id', userId)
            .eq('status', 'submitted')

          const { data: unreadMessages } = await supabase
            .from('parent_teacher_messages')
            .select('id')
            .eq('teacher_id', userId)
            .eq('status', 'sent')

          return {
            ...teacherMetrics,
            ...classStats,
            pending_grading: pendingAssignments?.length || 0,
            unread_messages: unreadMessages?.length || 0
          }

        case 'parent':
          // Get children's data
          const { data: children } = await supabase
            .from('students')
            .select('id, name')
            .eq('parent_id', userId)

          if (!children || children.length === 0) {
            return { children_count: 0 }
          }

          const childrenIds = children.map(c => c.id)
          
          // Get aggregated data for all children
          const { data: recentFeedback } = await supabase
            .from('teacher_feedback')
            .select('rating')
            .in('student_id', childrenIds)
            .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

          const { data: pendingAssignments } = await supabase
            .from('assignments')
            .select('id')
            .in('student_id', childrenIds)
            .eq('status', 'pending')

          const { data: unreadMessages } = await supabase
            .from('parent_teacher_messages')
            .select('id')
            .eq('parent_id', userId)
            .eq('status', 'sent')

          const averageRating = recentFeedback && recentFeedback.length > 0
            ? recentFeedback.reduce((sum, f) => sum + f.rating, 0) / recentFeedback.length
            : 0

          return {
            children_count: children.length,
            children_names: children.map(c => c.name),
            recent_feedback_count: recentFeedback?.length || 0,
            average_feedback_rating: Math.round(averageRating * 10) / 10,
            pending_assignments: pendingAssignments?.length || 0,
            unread_messages: unreadMessages?.length || 0
          }

        default:
          throw new Error('Invalid user type')
      }
    } catch (error) {
      console.error('Error getting dashboard analytics:', error)
      throw error
    }
  }

  // Generate reports
  async generateStudentReport(studentId: string, dateFrom: string, dateTo: string) {
    try {
      const performance = await this.getStudentPerformance(studentId, dateFrom, dateTo)
      
      const { data: student } = await supabase
        .from('students')
        .select(`
          name, level, enrollment_date,
          teacher:teachers(name, email),
          parent:parents(name, email)
        `)
        .eq('id', studentId)
        .single()

      const { data: feedback } = await supabase
        .from('teacher_feedback')
        .select(`
          subject, message, rating, category, date,
          teacher:teachers(name)
        `)
        .eq('student_id', studentId)
        .gte('date', dateFrom)
        .lte('date', dateTo)
        .order('date', { ascending: false })

      const { data: assignments } = await supabase
        .from('assignments')
        .select('title, status, grade, due_date')
        .eq('student_id', studentId)
        .gte('due_date', dateFrom)
        .lte('due_date', dateTo)
        .order('due_date', { ascending: false })

      return {
        student_info: student,
        performance_metrics: performance,
        feedback_history: feedback,
        assignment_history: assignments,
        report_period: { from: dateFrom, to: dateTo },
        generated_at: new Date().toISOString()
      }
    } catch (error) {
      console.error('Error generating student report:', error)
      throw error
    }
  }

  async generateClassReport(teacherId: string, dateFrom: string, dateTo: string) {
    try {
      const teacherMetrics = await this.getTeacherMetrics(teacherId, dateFrom, dateTo)
      const classStats = await this.getClassStatistics(teacherId)

      const { data: teacher } = await supabase
        .from('teachers')
        .select('name, email, specialization')
        .eq('id', teacherId)
        .single()

      const { data: students } = await supabase
        .from('students')
        .select(`
          id, name, level,
          assignments:assignments(status, grade),
          feedback:teacher_feedback(rating),
          attendance:attendance(status)
        `)
        .eq('teacher_id', teacherId)

      // Calculate individual student summaries
      const studentSummaries = students?.map(student => {
        const assignments = student.assignments || []
        const feedback = student.feedback || []
        const attendance = student.attendance || []

        const averageGrade = assignments.filter(a => a.grade).length > 0
          ? assignments.filter(a => a.grade).reduce((sum, a) => sum + (a.grade || 0), 0) / assignments.filter(a => a.grade).length
          : 0

        const averageRating = feedback.length > 0
          ? feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length
          : 0

        const attendanceRate = attendance.length > 0
          ? (attendance.filter(a => a.status === 'present' || a.status === 'late').length / attendance.length) * 100
          : 0

        return {
          id: student.id,
          name: student.name,
          level: student.level,
          average_grade: Math.round(averageGrade),
          average_rating: Math.round(averageRating * 10) / 10,
          attendance_rate: Math.round(attendanceRate),
          total_assignments: assignments.length,
          total_feedback: feedback.length
        }
      }) || []

      return {
        teacher_info: teacher,
        teacher_metrics: teacherMetrics,
        class_statistics: classStats,
        student_summaries: studentSummaries,
        report_period: { from: dateFrom, to: dateTo },
        generated_at: new Date().toISOString()
      }
    } catch (error) {
      console.error('Error generating class report:', error)
      throw error
    }
  }
}

export const analyticsService = new AnalyticsService()