import React, { useState, useEffect } from 'react'
import { Bell, X, Check, AlertCircle, Info, CheckCircle, AlertTriangle } from 'lucide-react'
import { useAuth } from './AuthProvider'
import { notificationService } from '../lib/notifications'

interface NotificationCenterProps {
  className?: string
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ className = '' }) => {
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    const loadNotifications = async () => {
      try {
        const [notificationsData, count] = await Promise.all([
          notificationService.getUserNotifications(user.id),
          notificationService.getUnreadCount(user.id)
        ])
        
        setNotifications(notificationsData)
        setUnreadCount(count)
      } catch (error) {
        console.error('Error loading notifications:', error)
      } finally {
        setLoading(false)
      }
    }

    loadNotifications()

    // Subscribe to real-time notifications
    const subscription = notificationService.subscribeToNotifications(user.id, (newNotification) => {
      setNotifications(prev => [newNotification, ...prev])
      setUnreadCount(prev => prev + 1)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [user])

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId)
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    if (!user) return

    try {
      await notificationService.markAllAsRead(user.id)
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId)
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      if (!notifications.find(n => n.id === notificationId)?.read) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle size={16} className="text-success" />
      case 'warning': return <AlertTriangle size={16} className="text-warning" />
      case 'error': return <AlertCircle size={16} className="text-danger" />
      default: return <Info size={16} className="text-info" />
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

  if (!user) return null

  return (
    <div className={`dropdown ${className}`}>
      <button
        className="btn btn-outline-secondary position-relative"
        type="button"
        onClick={() => setShowDropdown(!showDropdown)}
        aria-expanded={showDropdown}
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="dropdown-menu dropdown-menu-end show" style={{ width: '350px', maxHeight: '500px' }}>
          <div className="dropdown-header d-flex justify-content-between align-items-center">
            <h6 className="mb-0">Notifications</h6>
            {unreadCount > 0 && (
              <button
                className="btn btn-sm btn-link p-0"
                onClick={handleMarkAllAsRead}
              >
                <Check size={14} className="me-1" />
                Mark all read
              </button>
            )}
          </div>

          <div className="dropdown-divider"></div>

          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {loading ? (
              <div className="text-center p-3">
                <div className="spinner-border spinner-border-sm" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center p-3 text-muted">
                <Bell size={24} className="mb-2 opacity-50" />
                <p className="mb-0">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`dropdown-item-text p-3 border-bottom ${!notification.read ? 'bg-light' : ''}`}
                >
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center mb-1">
                        {getNotificationIcon(notification.type)}
                        <h6 className="mb-0 ms-2">{notification.title}</h6>
                        {!notification.read && (
                          <span className="badge bg-primary ms-2">New</span>
                        )}
                      </div>
                      <p className="mb-1 small text-muted">{notification.message}</p>
                      <small className="text-muted">{formatTime(notification.created_at)}</small>
                    </div>
                    <div className="dropdown">
                      <button
                        className="btn btn-sm btn-link text-muted p-0"
                        type="button"
                        data-bs-toggle="dropdown"
                      >
                        ⋮
                      </button>
                      <ul className="dropdown-menu dropdown-menu-end">
                        {!notification.read && (
                          <li>
                            <button
                              className="dropdown-item"
                              onClick={() => handleMarkAsRead(notification.id)}
                            >
                              <Check size={14} className="me-2" />
                              Mark as read
                            </button>
                          </li>
                        )}
                        <li>
                          <button
                            className="dropdown-item text-danger"
                            onClick={() => handleDeleteNotification(notification.id)}
                          >
                            <X size={14} className="me-2" />
                            Delete
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                  {notification.action_url && (
                    <div className="mt-2">
                      <a
                        href={notification.action_url}
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        View Details
                      </a>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <>
              <div className="dropdown-divider"></div>
              <div className="text-center p-2">
                <a href="/notifications" className="btn btn-sm btn-link">
                  View All Notifications
                </a>
              </div>
            </>
          )}
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {showDropdown && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100"
          style={{ zIndex: -1 }}
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  )
}

export default NotificationCenter