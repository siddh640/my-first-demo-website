import { useState, useEffect, useCallback } from 'react'
import { realtimeService, ChatMessage, CommunityMessage } from '../lib/realtime'
import { useAuth } from '../components/AuthProvider'

export const useChat = (recipientId: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const loadMessages = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      const data = await realtimeService.getChatMessages(user.id, recipientId)
      setMessages(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages')
    } finally {
      setLoading(false)
    }
  }, [user, recipientId])

  const sendMessage = useCallback(async (message: string, studentId?: string, studentName?: string) => {
    if (!user) return

    try {
      const newMessage = await realtimeService.sendChatMessage({
        sender_id: user.id,
        sender_name: user.profile?.name || user.email,
        sender_type: user.role as any,
        recipient_id: recipientId,
        message,
        student_id: studentId,
        student_name: studentName
      })

      setMessages(prev => [...prev, newMessage])
      return newMessage
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message')
      throw err
    }
  }, [user, recipientId])

  const markAsRead = useCallback(async () => {
    if (!user) return

    try {
      await realtimeService.markMessagesAsRead(user.id, recipientId)
      setMessages(prev => prev.map(msg => 
        msg.sender_id === recipientId ? { ...msg, read: true } : msg
      ))
    } catch (err) {
      console.error('Failed to mark messages as read:', err)
    }
  }, [user, recipientId])

  useEffect(() => {
    loadMessages()
  }, [loadMessages])

  useEffect(() => {
    if (!user) return

    const subscription = realtimeService.subscribeToChatMessages(user.id, (newMessage) => {
      if (newMessage.sender_id === recipientId) {
        setMessages(prev => [...prev, newMessage])
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [user, recipientId])

  return {
    messages,
    loading,
    error,
    sendMessage,
    markAsRead,
    refreshMessages: loadMessages
  }
}

export const useCommunityChat = () => {
  const [messages, setMessages] = useState<CommunityMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const loadMessages = useCallback(async (category?: string) => {
    try {
      setLoading(true)
      const data = await realtimeService.getCommunityMessages(20, category)
      setMessages(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages')
    } finally {
      setLoading(false)
    }
  }, [])

  const sendMessage = useCallback(async (
    message: string, 
    category: CommunityMessage['category'],
    studentName: string
  ) => {
    if (!user) return

    try {
      const newMessage = await realtimeService.sendCommunityMessage({
        parent_id: user.id,
        parent_name: user.profile?.name || user.email,
        student_name: studentName,
        message,
        category
      })

      setMessages(prev => [newMessage, ...prev])
      return newMessage
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message')
      throw err
    }
  }, [user])

  const likeMessage = useCallback(async (messageId: string) => {
    if (!user) return

    try {
      await realtimeService.likeCommunityMessage(messageId, user.id)
      // The real-time subscription will update the UI
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to like message')
    }
  }, [user])

  const replyToMessage = useCallback(async (messageId: string, replyText: string) => {
    if (!user) return

    try {
      const reply = await realtimeService.replyCommunityMessage(messageId, {
        parent_id: user.id,
        parent_name: user.profile?.name || user.email,
        message: replyText
      })

      // Update the message with the new reply
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, replies: [...(msg.replies || []), reply] }
          : msg
      ))

      return reply
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reply')
      throw err
    }
  }, [user])

  useEffect(() => {
    loadMessages()
  }, [loadMessages])

  useEffect(() => {
    const subscription = realtimeService.subscribeToCommunityMessages((updatedMessage) => {
      setMessages(prev => {
        const existingIndex = prev.findIndex(msg => msg.id === updatedMessage.id)
        if (existingIndex >= 0) {
          // Update existing message
          const newMessages = [...prev]
          newMessages[existingIndex] = updatedMessage
          return newMessages
        } else {
          // Add new message
          return [updatedMessage, ...prev]
        }
      })
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return {
    messages,
    loading,
    error,
    sendMessage,
    likeMessage,
    replyToMessage,
    refreshMessages: loadMessages
  }
}

export const usePresence = (userIds: string[]) => {
  const [presence, setPresence] = useState<Record<string, any>>({})
  const { user } = useAuth()

  const updateStatus = useCallback(async (status: 'online' | 'away' | 'offline') => {
    if (!user) return

    try {
      await realtimeService.updateUserPresence(user.id, status)
    } catch (err) {
      console.error('Failed to update presence:', err)
    }
  }, [user])

  useEffect(() => {
    if (userIds.length === 0) return

    const loadPresence = async () => {
      try {
        const data = await realtimeService.getUserPresence(userIds)
        const presenceMap = data.reduce((acc, item) => {
          acc[item.user_id] = item
          return acc
        }, {} as Record<string, any>)
        setPresence(presenceMap)
      } catch (err) {
        console.error('Failed to load presence:', err)
      }
    }

    loadPresence()

    const subscription = realtimeService.subscribeToPresence(userIds, (payload) => {
      const updatedPresence = payload.new
      setPresence(prev => ({
        ...prev,
        [updatedPresence.user_id]: updatedPresence
      }))
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [userIds])

  // Update status to online when component mounts
  useEffect(() => {
    updateStatus('online')

    // Update to offline when page unloads
    const handleBeforeUnload = () => {
      updateStatus('offline')
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      updateStatus('offline')
    }
  }, [updateStatus])

  return {
    presence,
    updateStatus
  }
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const loadNotifications = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      const [notificationsData, count] = await Promise.all([
        realtimeService.getUserNotifications?.(user.id) || [],
        realtimeService.getUnreadCount?.(user.id) || 0
      ])
      
      setNotifications(notificationsData)
      setUnreadCount(count)
    } catch (err) {
      console.error('Failed to load notifications:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadNotifications()
  }, [loadNotifications])

  useEffect(() => {
    if (!user) return

    const subscription = realtimeService.subscribeToUserUpdates(
      user.id,
      user.role,
      () => {
        loadNotifications()
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [user, loadNotifications])

  return {
    notifications,
    unreadCount,
    loading,
    refreshNotifications: loadNotifications
  }
}