import React, { useState, useEffect, useRef } from 'react'
import { Send, MessageCircle, User, Clock, CheckCircle2, AlertCircle } from 'lucide-react'

interface Message {
  id: string
  sender_id: string
  sender_name: string
  sender_type: 'parent' | 'teacher'
  message: string
  timestamp: string
  read: boolean
  student_name?: string
}

interface ChatProps {
  currentUserId: string
  currentUserType: 'parent' | 'teacher'
  currentUserName: string
  recipientId: string
  recipientName: string
  studentId: string
  studentName: string
}

const ParentTeacherChat: React.FC<ChatProps> = ({
  currentUserId,
  currentUserType,
  currentUserName,
  recipientId,
  recipientName,
  studentId,
  studentName
}) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isOnline, setIsOnline] = useState(false)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Mock data for demonstration
  useEffect(() => {
    // Simulate loading messages
    const mockMessages: Message[] = [
      {
        id: '1',
        sender_id: currentUserType === 'parent' ? recipientId : currentUserId,
        sender_name: currentUserType === 'parent' ? recipientName : currentUserName,
        sender_type: currentUserType === 'parent' ? 'teacher' : 'parent',
        message: `Hello! I wanted to discuss ${studentName}'s recent progress in class.`,
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        read: true,
        student_name: studentName
      },
      {
        id: '2',
        sender_id: currentUserType === 'parent' ? currentUserId : recipientId,
        sender_name: currentUserType === 'parent' ? currentUserName : recipientName,
        sender_type: currentUserType,
        message: `Hi! Yes, I'd love to hear about how ${studentName} is doing. Any specific areas of concern?`,
        timestamp: new Date(Date.now() - 3000000).toISOString(),
        read: true,
        student_name: studentName
      },
      {
        id: '3',
        sender_id: currentUserType === 'parent' ? recipientId : currentUserId,
        sender_name: currentUserType === 'parent' ? recipientName : currentUserName,
        sender_type: currentUserType === 'parent' ? 'teacher' : 'parent',
        message: `${studentName} has shown excellent improvement in grammar this week. However, I think we could work on pronunciation during speaking exercises.`,
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        read: false,
        student_name: studentName
      }
    ]

    setTimeout(() => {
      setMessages(mockMessages)
      setLoading(false)
      setIsOnline(Math.random() > 0.3) // Random online status
    }, 1000)
  }, [currentUserId, recipientId, studentName, currentUserType, recipientName, currentUserName])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const message: Message = {
      id: Date.now().toString(),
      sender_id: currentUserId,
      sender_name: currentUserName,
      sender_type: currentUserType,
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
      read: false,
      student_name: studentName
    }

    setMessages(prev => [...prev, message])
    setNewMessage('')

    // Simulate message being sent
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === message.id ? { ...msg, read: true } : msg
        )
      )
    }, 1000)

    // Simulate typing indicator and response (for demo)
    if (Math.random() > 0.5) {
      setTimeout(() => {
        setIsTyping(true)
        setTimeout(() => {
          setIsTyping(false)
          const responses = [
            "Thank you for sharing that information.",
            "I'll make sure to focus on that area in our next class.",
            "That's great to hear! Let's continue with this approach.",
            "I appreciate you bringing this to my attention.",
            "Let's schedule a meeting to discuss this further."
          ]
          const response: Message = {
            id: (Date.now() + 1).toString(),
            sender_id: recipientId,
            sender_name: recipientName,
            sender_type: currentUserType === 'parent' ? 'teacher' : 'parent',
            message: responses[Math.floor(Math.random() * responses.length)],
            timestamp: new Date().toISOString(),
            read: false,
            student_name: studentName
          }
          setMessages(prev => [...prev, response])
        }, 2000)
      }, 1000)
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else {
      return date.toLocaleDateString()
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading chat...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="card shadow-sm">
      {/* Chat Header */}
      <div className="card-header bg-primary text-white">
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <MessageCircle size={20} className="me-2" />
            <div>
              <h6 className="mb-0">Chat with {recipientName}</h6>
              <small className="opacity-75">About: {studentName}</small>
            </div>
          </div>
          <div className="d-flex align-items-center">
            <span className={`badge ${isOnline ? 'bg-success' : 'bg-secondary'} me-2`}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
            <User size={16} />
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="card-body p-0">
        <div 
          className="messages-container p-3" 
          style={{ height: '400px', overflowY: 'auto', backgroundColor: '#f8f9fa' }}
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`d-flex mb-3 ${
                message.sender_id === currentUserId ? 'justify-content-end' : 'justify-content-start'
              }`}
            >
              <div
                className={`message-bubble p-3 rounded-3 ${
                  message.sender_id === currentUserId
                    ? 'bg-primary text-white'
                    : 'bg-white border'
                }`}
                style={{ maxWidth: '70%' }}
              >
                <div className="d-flex justify-content-between align-items-start mb-1">
                  <small className={`fw-bold ${
                    message.sender_id === currentUserId ? 'text-white-50' : 'text-muted'
                  }`}>
                    {message.sender_name}
                  </small>
                  <small className={`ms-2 ${
                    message.sender_id === currentUserId ? 'text-white-50' : 'text-muted'
                  }`}>
                    {formatTime(message.timestamp)}
                  </small>
                </div>
                <p className="mb-1">{message.message}</p>
                {message.sender_id === currentUserId && (
                  <div className="text-end">
                    {message.read ? (
                      <CheckCircle2 size={14} className="text-white-50" />
                    ) : (
                      <Clock size={14} className="text-white-50" />
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="d-flex justify-content-start mb-3">
              <div className="bg-white border p-3 rounded-3">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <small className="text-muted">{recipientName} is typing...</small>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="card-footer bg-white">
        <form onSubmit={handleSendMessage}>
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder={`Message ${recipientName} about ${studentName}...`}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
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

      {/* Typing Indicator Styles */}
      <style jsx>{`
        .typing-indicator {
          display: inline-flex;
          align-items: center;
          margin-right: 8px;
        }
        
        .typing-indicator span {
          height: 8px;
          width: 8px;
          background-color: #6c757d;
          border-radius: 50%;
          display: inline-block;
          margin-right: 3px;
          animation: typing 1.4s infinite ease-in-out;
        }
        
        .typing-indicator span:nth-child(1) {
          animation-delay: -0.32s;
        }
        
        .typing-indicator span:nth-child(2) {
          animation-delay: -0.16s;
        }
        
        @keyframes typing {
          0%, 80%, 100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}

export default ParentTeacherChat