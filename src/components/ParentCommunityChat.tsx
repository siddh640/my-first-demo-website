import React, { useState, useEffect, useRef } from 'react'
import { Send, MessageCircle, Users, Clock, Star, ThumbsUp, Reply } from 'lucide-react'

interface CommunityMessage {
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

interface CommunityReply {
  id: string
  parent_id: string
  parent_name: string
  message: string
  timestamp: string
  likes: number
}

interface ParentCommunityChatProps {
  currentParentId: string
  currentParentName: string
  studentName: string
}

const ParentCommunityChat: React.FC<ParentCommunityChatProps> = ({
  currentParentId,
  currentParentName,
  studentName
}) => {
  const [messages, setMessages] = useState<CommunityMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<CommunityMessage['category']>('general')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Mock community data
  useEffect(() => {
    const mockMessages: CommunityMessage[] = [
      {
        id: '1',
        parent_id: 'parent-2',
        parent_name: 'Lisa Chen',
        student_name: 'Michael Chen',
        message: 'Has anyone found good resources for helping with grammar homework? My son is struggling with past tense exercises.',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        likes: 5,
        category: 'homework',
        replies: [
          {
            id: 'r1',
            parent_id: 'parent-3',
            parent_name: 'Carlos Rodriguez',
            message: 'I recommend the Grammar Galaxy app! My daughter loves the interactive exercises.',
            timestamp: new Date(Date.now() - 5400000).toISOString(),
            likes: 3
          },
          {
            id: 'r2',
            parent_id: currentParentId,
            parent_name: currentParentName,
            message: 'We use flashcards and practice 15 minutes daily. It really helps with retention!',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            likes: 2
          }
        ]
      },
      {
        id: '2',
        parent_id: 'parent-3',
        parent_name: 'Carlos Rodriguez',
        student_name: 'Sofia Rodriguez',
        message: 'Great news! Sofia just passed her intermediate level exam with flying colors! Thank you to all the parents who shared study tips.',
        timestamp: new Date(Date.now() - 10800000).toISOString(),
        likes: 12,
        category: 'achievements',
        replies: [
          {
            id: 'r3',
            parent_id: 'parent-2',
            parent_name: 'Lisa Chen',
            message: 'Congratulations! That\'s wonderful news. Sofia has been working so hard.',
            timestamp: new Date(Date.now() - 9000000).toISOString(),
            likes: 1
          }
        ]
      },
      {
        id: '3',
        parent_id: 'parent-4',
        parent_name: 'Maria Garcia',
        student_name: 'Diego Garcia',
        message: 'Don\'t forget about the parent-teacher conference next Friday! I found it really helpful last time to prepare questions in advance.',
        timestamp: new Date(Date.now() - 14400000).toISOString(),
        likes: 8,
        category: 'events',
        replies: []
      }
    ]

    setTimeout(() => {
      setMessages(mockMessages)
      setLoading(false)
    }, 1000)
  }, [currentParentId, currentParentName])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const message: CommunityMessage = {
      id: Date.now().toString(),
      parent_id: currentParentId,
      parent_name: currentParentName,
      student_name: studentName,
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
      likes: 0,
      category: selectedCategory,
      replies: []
    }

    setMessages(prev => [message, ...prev])
    setNewMessage('')
  }

  const handleReply = (messageId: string) => {
    if (!replyText.trim()) return

    const reply: CommunityReply = {
      id: Date.now().toString(),
      parent_id: currentParentId,
      parent_name: currentParentName,
      message: replyText.trim(),
      timestamp: new Date().toISOString(),
      likes: 0
    }

    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, replies: [...msg.replies, reply] }
        : msg
    ))

    setReplyText('')
    setReplyingTo(null)
  }

  const handleLike = (messageId: string, isReply: boolean = false, replyId?: string) => {
    if (isReply && replyId) {
      setMessages(prev => prev.map(msg => ({
        ...msg,
        replies: msg.replies.map(reply => 
          reply.id === replyId 
            ? { ...reply, likes: reply.likes + 1 }
            : reply
        )
      })))
    } else {
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, likes: msg.likes + 1 }
          : msg
      ))
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const getCategoryColor = (category: CommunityMessage['category']) => {
    switch (category) {
      case 'homework': return 'bg-info'
      case 'achievements': return 'bg-success'
      case 'events': return 'bg-warning'
      case 'concerns': return 'bg-danger'
      default: return 'bg-primary'
    }
  }

  const getCategoryIcon = (category: CommunityMessage['category']) => {
    switch (category) {
      case 'homework': return '📚'
      case 'achievements': return '🏆'
      case 'events': return '📅'
      case 'concerns': return '⚠️'
      default: return '💬'
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading community...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="card shadow-sm">
      {/* Community Header */}
      <div className="card-header bg-primary text-white">
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <Users size={20} className="me-2" />
            <div>
              <h6 className="mb-0">Parent Community</h6>
              <small className="opacity-75">Connect with other parents</small>
            </div>
          </div>
          <span className="badge bg-light text-primary">
            {messages.length} discussions
          </span>
        </div>
      </div>

      {/* New Message Form */}
      <div className="card-body border-bottom">
        <form onSubmit={handleSendMessage}>
          <div className="mb-3">
            <label className="form-label">Category</label>
            <select 
              className="form-select form-select-sm"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as CommunityMessage['category'])}
            >
              <option value="general">💬 General Discussion</option>
              <option value="homework">📚 Homework Help</option>
              <option value="achievements">🏆 Achievements</option>
              <option value="events">📅 Events & News</option>
              <option value="concerns">⚠️ Concerns</option>
            </select>
          </div>
          <div className="input-group">
            <textarea
              className="form-control"
              placeholder="Share with the parent community..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              rows={2}
              maxLength={500}
            />
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={!newMessage.trim()}
            >
              <Send size={16} />
            </button>
          </div>
          <small className="text-muted">
            {newMessage.length}/500 characters
          </small>
        </form>
      </div>

      {/* Messages Area */}
      <div 
        className="messages-container p-3" 
        style={{ height: '500px', overflowY: 'auto', backgroundColor: '#f8f9fa' }}
      >
        {messages.map((message) => (
          <div key={message.id} className="card mb-3 border-0 shadow-sm">
            <div className="card-body">
              {/* Message Header */}
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div className="d-flex align-items-center">
                  <div className="me-3">
                    <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                      {message.parent_name.charAt(0)}
                    </div>
                  </div>
                  <div>
                    <h6 className="mb-0">{message.parent_name}</h6>
                    <small className="text-muted">Parent of {message.student_name}</small>
                  </div>
                </div>
                <div className="text-end">
                  <span className={`badge ${getCategoryColor(message.category)} mb-1`}>
                    {getCategoryIcon(message.category)} {message.category}
                  </span>
                  <br />
                  <small className="text-muted">
                    <Clock size={12} className="me-1" />
                    {formatTime(message.timestamp)}
                  </small>
                </div>
              </div>

              {/* Message Content */}
              <p className="mb-3">{message.message}</p>

              {/* Message Actions */}
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex gap-2">
                  <button 
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => handleLike(message.id)}
                  >
                    <ThumbsUp size={14} className="me-1" />
                    {message.likes}
                  </button>
                  <button 
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => setReplyingTo(replyingTo === message.id ? null : message.id)}
                  >
                    <Reply size={14} className="me-1" />
                    Reply ({message.replies.length})
                  </button>
                </div>
              </div>

              {/* Replies */}
              {message.replies.length > 0 && (
                <div className="mt-3 ps-4 border-start border-2 border-light">
                  {message.replies.map((reply) => (
                    <div key={reply.id} className="mb-2 p-2 bg-white rounded">
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <small className="fw-bold text-primary">{reply.parent_name}</small>
                        <div className="d-flex align-items-center gap-2">
                          <button 
                            className="btn btn-sm btn-link p-0 text-muted"
                            onClick={() => handleLike(message.id, true, reply.id)}
                          >
                            <ThumbsUp size={12} className="me-1" />
                            {reply.likes}
                          </button>
                          <small className="text-muted">{formatTime(reply.timestamp)}</small>
                        </div>
                      </div>
                      <p className="mb-0 small">{reply.message}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply Form */}
              {replyingTo === message.id && (
                <div className="mt-3 ps-4 border-start border-2 border-primary">
                  <div className="input-group input-group-sm">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Write a reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      maxLength={200}
                    />
                    <button 
                      className="btn btn-primary"
                      onClick={() => handleReply(message.id)}
                      disabled={!replyText.trim()}
                    >
                      <Send size={14} />
                    </button>
                  </div>
                  <small className="text-muted">{replyText.length}/200 characters</small>
                </div>
              )}
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Community Guidelines */}
      <div className="card-footer bg-light">
        <small className="text-muted">
          <strong>Community Guidelines:</strong> Be respectful, stay on topic, and focus on supporting each other's children's education.
        </small>
      </div>
    </div>
  )
}

export default ParentCommunityChat