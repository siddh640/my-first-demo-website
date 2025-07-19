import { supabase } from './supabase'
import { notificationService } from './notifications'

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
  replies: CommunityReply[]
  category: 'general' | 'homework' | 'events' | 'achievements' | 'concerns'
}

export interface CommunityReply {
  id: string
  parent_id: string
  parent_name: string
  message: string
  timestamp: string
  likes: number
}

class RealtimeService {
  private channels: Map<string, any> = new Map()

  // Chat functionality
  async sendChatMessage(message: Omit<ChatMessage, 'id' | 'timestamp' | 'read'>) {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert([{
        ...message,
        timestamp: new Date().toISOString(),
        read: false
      }])
      .select()
      .single()
    
    if (error) throw error

    // Send notification to recipient
    await notificationService.notifyNewMessage(
      message.recipient_id,
      message.sender_name,
      message.message.substring(0, 50) + '...'
    )

    return data
  }

  async getChatMessages(userId: string, recipientId: string, limit: number = 50) {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .or(`and(sender_id.eq.${userId},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${userId})`)
      .order('timestamp', { ascending: true })
      .limit(limit)
    
    if (error) throw error
    return data
  }

  async markMessagesAsRead(userId: string, senderId: string) {
    const { data, error } = await supabase
      .from('chat_messages')
      .update({ read: true })
      .eq('recipient_id', userId)
      .eq('sender_id', senderId)
      .eq('read', false)
      .select()
    
    if (error) throw error
    return data
  }

  // Community chat functionality
  async sendCommunityMessage(message: Omit<CommunityMessage, 'id' | 'timestamp' | 'likes' | 'replies'>) {
    const { data, error } = await supabase
      .from('community_messages')
      .insert([{
        ...message,
        timestamp: new Date().toISOString(),
        likes: 0
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async getCommunityMessages(limit: number = 20, category?: string) {
    let query = supabase
      .from('community_messages')
      .select(`
        *,
        replies:community_replies(*)
      `)

    if (category && category !== 'general') {
      query = query.eq('category', category)
    }

    const { data, error } = await query
      .order('timestamp', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data
  }

  async likeCommunityMessage(messageId: string, userId: string) {
    // Check if user already liked this message
    const { data: existingLike } = await supabase
      .from('community_likes')
      .select('id')
      .eq('message_id', messageId)
      .eq('user_id', userId)
      .single()

    if (existingLike) {
      // Unlike
      await supabase
        .from('community_likes')
        .delete()
        .eq('message_id', messageId)
        .eq('user_id', userId)

      // Decrease like count
      const { data, error } = await supabase
        .from('community_messages')
        .update({ likes: supabase.sql`likes - 1` })
        .eq('id', messageId)
        .select()
        .single()

      if (error) throw error
      return data
    } else {
      // Like
      await supabase
        .from('community_likes')
        .insert([{ message_id: messageId, user_id: userId }])

      // Increase like count
      const { data, error } = await supabase
        .from('community_messages')
        .update({ likes: supabase.sql`likes + 1` })
        .eq('id', messageId)
        .select()
        .single()

      if (error) throw error
      return data
    }
  }

  async replyCommunityMessage(messageId: string, reply: Omit<CommunityReply, 'id' | 'timestamp' | 'likes'>) {
    const { data, error } = await supabase
      .from('community_replies')
      .insert([{
        ...reply,
        message_id: messageId,
        timestamp: new Date().toISOString(),
        likes: 0
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // Real-time subscriptions
  subscribeToChatMessages(userId: string, callback: (message: ChatMessage) => void) {
    const channelName = `chat-${userId}`
    
    if (this.channels.has(channelName)) {
      this.channels.get(channelName).unsubscribe()
    }

    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `recipient_id=eq.${userId}`
      }, (payload) => {
        callback(payload.new as ChatMessage)
      })
      .subscribe()

    this.channels.set(channelName, channel)
    return channel
  }

  subscribeToCommunityMessages(callback: (message: CommunityMessage) => void) {
    const channelName = 'community-messages'
    
    if (this.channels.has(channelName)) {
      this.channels.get(channelName).unsubscribe()
    }

    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'community_messages'
      }, (payload) => {
        callback(payload.new as CommunityMessage)
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'community_messages'
      }, (payload) => {
        callback(payload.new as CommunityMessage)
      })
      .subscribe()

    this.channels.set(channelName, channel)
    return channel
  }

  subscribeToUserUpdates(userId: string, userType: 'student' | 'teacher' | 'parent', callback: (update: any) => void) {
    const channelName = `user-${userId}`
    
    if (this.channels.has(channelName)) {
      this.channels.get(channelName).unsubscribe()
    }

    const channel = supabase.channel(channelName)

    // Subscribe based on user type
    switch (userType) {
      case 'student':
        channel
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'teacher_feedback',
            filter: `student_id=eq.${userId}`
          }, callback)
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'assignments',
            filter: `student_id=eq.${userId}`
          }, callback)
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'progress',
            filter: `student_id=eq.${userId}`
          }, callback)
        break

      case 'teacher':
        channel
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'parent_teacher_messages',
            filter: `teacher_id=eq.${userId}`
          }, callback)
        break

      case 'parent':
        channel
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'parent_teacher_messages',
            filter: `parent_id=eq.${userId}`
          }, callback)
        break
    }

    channel.subscribe()
    this.channels.set(channelName, channel)
    return channel
  }

  // Presence functionality
  async updateUserPresence(userId: string, status: 'online' | 'away' | 'offline') {
    const { data, error } = await supabase
      .from('user_presence')
      .upsert([{
        user_id: userId,
        status,
        last_seen: new Date().toISOString()
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async getUserPresence(userIds: string[]) {
    const { data, error } = await supabase
      .from('user_presence')
      .select('*')
      .in('user_id', userIds)
    
    if (error) throw error
    return data
  }

  subscribeToPresence(userIds: string[], callback: (presence: any) => void) {
    const channelName = 'presence'
    
    if (this.channels.has(channelName)) {
      this.channels.get(channelName).unsubscribe()
    }

    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_presence',
        filter: `user_id=in.(${userIds.join(',')})`
      }, callback)
      .subscribe()

    this.channels.set(channelName, channel)
    return channel
  }

  // Cleanup
  unsubscribeAll() {
    this.channels.forEach(channel => {
      channel.unsubscribe()
    })
    this.channels.clear()
  }

  unsubscribe(channelName: string) {
    if (this.channels.has(channelName)) {
      this.channels.get(channelName).unsubscribe()
      this.channels.delete(channelName)
    }
  }
}

export const realtimeService = new RealtimeService()