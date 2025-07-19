import { supabase } from './supabase'

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

class NotificationService {
  // Create notification
  async createNotification(notification: Omit<Notification, 'id' | 'created_at' | 'read'>) {
    const { data, error } = await supabase
      .from('notifications')
      .insert([{
        ...notification,
        read: false,
        created_at: new Date().toISOString()
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // Get user notifications
  async getUserNotifications(userId: string, limit: number = 20) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data
  }

  // Mark notification as read
  async markAsRead(notificationId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // Mark all notifications as read
  async markAllAsRead(userId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false)
      .select()
    
    if (error) throw error
    return data
  }

  // Delete notification
  async deleteNotification(notificationId: string) {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
    
    if (error) throw error
    return true
  }

  // Get unread count
  async getUnreadCount(userId: string) {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false)
    
    if (error) throw error
    return count || 0
  }

  // Subscribe to real-time notifications
  subscribeToNotifications(userId: string, callback: (notification: Notification) => void) {
    return supabase
      .channel(`notifications-${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        callback(payload.new as Notification)
      })
      .subscribe()
  }

  // Automated notification triggers
  async notifyNewFeedback(studentId: string, teacherId: string, feedbackSubject: string) {
    // Notify student
    await this.createNotification({
      user_id: studentId,
      title: 'New Teacher Feedback',
      message: `You have received new feedback: ${feedbackSubject}`,
      type: 'info',
      action_url: '/dashboard/feedback'
    })

    // Notify parent
    const { data: student } = await supabase
      .from('students')
      .select('parent_id')
      .eq('id', studentId)
      .single()

    if (student?.parent_id) {
      await this.createNotification({
        user_id: student.parent_id,
        title: 'New Teacher Feedback',
        message: `Your child has received new feedback: ${feedbackSubject}`,
        type: 'info',
        action_url: '/parent-dashboard/feedback'
      })
    }
  }

  async notifyNewAssignment(studentId: string, assignmentTitle: string, dueDate: string) {
    // Notify student
    await this.createNotification({
      user_id: studentId,
      title: 'New Assignment',
      message: `New assignment: ${assignmentTitle} (Due: ${dueDate})`,
      type: 'info',
      action_url: '/dashboard/assignments'
    })

    // Notify parent
    const { data: student } = await supabase
      .from('students')
      .select('parent_id')
      .eq('id', studentId)
      .single()

    if (student?.parent_id) {
      await this.createNotification({
        user_id: student.parent_id,
        title: 'New Assignment for Your Child',
        message: `New assignment: ${assignmentTitle} (Due: ${dueDate})`,
        type: 'info',
        action_url: '/parent-dashboard/assignments'
      })
    }
  }

  async notifyGradeUpdate(studentId: string, assignmentTitle: string, grade: number) {
    const gradeMessage = grade >= 90 ? 'Excellent work!' : 
                        grade >= 80 ? 'Great job!' : 
                        grade >= 70 ? 'Good effort!' : 'Keep working hard!'

    // Notify student
    await this.createNotification({
      user_id: studentId,
      title: 'Assignment Graded',
      message: `${assignmentTitle} - Grade: ${grade}%. ${gradeMessage}`,
      type: grade >= 70 ? 'success' : 'warning',
      action_url: '/dashboard/assignments'
    })

    // Notify parent
    const { data: student } = await supabase
      .from('students')
      .select('parent_id')
      .eq('id', studentId)
      .single()

    if (student?.parent_id) {
      await this.createNotification({
        user_id: student.parent_id,
        title: 'Assignment Graded',
        message: `Your child's assignment "${assignmentTitle}" has been graded: ${grade}%`,
        type: grade >= 70 ? 'success' : 'warning',
        action_url: '/parent-dashboard/assignments'
      })
    }
  }

  async notifyNewMessage(recipientId: string, senderName: string, subject: string) {
    await this.createNotification({
      user_id: recipientId,
      title: 'New Message',
      message: `New message from ${senderName}: ${subject}`,
      type: 'info',
      action_url: '/messages'
    })
  }
}

export const notificationService = new NotificationService()