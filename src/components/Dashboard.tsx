import React, { useState, useEffect } from 'react'
import { useAuth } from './AuthProvider'
import { analyticsService } from '../lib/analytics'
import { TrendingUp, Users, BookOpen, MessageCircle, Calendar, Award, Clock, Target } from 'lucide-react'
import NotificationCenter from './NotificationCenter'

const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth()
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const loadAnalytics = async () => {
      try {
        const data = await analyticsService.getDashboardAnalytics(user.id, user.role)
        setAnalytics(data)
      } catch (error) {
        console.error('Error loading analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAnalytics()
  }, [user])

  const handleSignOut = async () => {
    try {
      await signOut()
      window.location.href = '/'
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (!user) return null

  const renderStudentDashboard = () => (
    <div className="row">
      <div className="col-lg-8">
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">Academic Performance</h5>
          </div>
          <div className="card-body">
            {loading ? (
              <div className="text-center">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <div className="row text-center">
                <div className="col-md-3">
                  <div className="mb-3">
                    <TrendingUp size={32} className="text-success mb-2" />
                    <h4 className="text-success">{analytics?.average_grade || 0}%</h4>
                    <small className="text-muted">Average Grade</small>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="mb-3">
                    <Calendar size={32} className="text-info mb-2" />
                    <h4 className="text-info">{analytics?.attendance_rate || 0}%</h4>
                    <small className="text-muted">Attendance</small>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="mb-3">
                    <BookOpen size={32} className="text-warning mb-2" />
                    <h4 className="text-warning">{analytics?.assignment_completion || 0}%</h4>
                    <small className="text-muted">Assignments</small>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="mb-3">
                    <Award size={32} className="text-primary mb-2" />
                    <h4 className="text-primary">{analytics?.recent_feedback_count || 0}</h4>
                    <small className="text-muted">Recent Feedback</small>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="col-lg-4">
        <div className="card shadow-sm">
          <div className="card-header bg-light">
            <h5 className="mb-0">Quick Actions</h5>
          </div>
          <div className="card-body">
            <div className="d-grid gap-2">
              <a href="/assignments" className="btn btn-outline-primary">
                <BookOpen size={16} className="me-2" />
                View Assignments
              </a>
              <a href="/progress" className="btn btn-outline-success">
                <TrendingUp size={16} className="me-2" />
                Check Progress
              </a>
              <a href="/feedback" className="btn btn-outline-info">
                <MessageCircle size={16} className="me-2" />
                Teacher Feedback
              </a>
              <a href="/schedule" className="btn btn-outline-warning">
                <Calendar size={16} className="me-2" />
                Class Schedule
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderTeacherDashboard = () => (
    <div className="row">
      <div className="col-lg-8">
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-success text-white">
            <h5 className="mb-0">Teaching Metrics</h5>
          </div>
          <div className="card-body">
            {loading ? (
              <div className="text-center">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <div className="row text-center">
                <div className="col-md-3">
                  <div className="mb-3">
                    <Users size={32} className="text-primary mb-2" />
                    <h4 className="text-primary">{analytics?.total_students || 0}</h4>
                    <small className="text-muted">Students</small>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="mb-3">
                    <Star size={32} className="text-warning mb-2" />
                    <h4 className="text-warning">{analytics?.average_feedback_rating || 0}</h4>
                    <small className="text-muted">Avg Rating</small>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="mb-3">
                    <BookOpen size={32} className="text-info mb-2" />
                    <h4 className="text-info">{analytics?.assignments_created || 0}</h4>
                    <small className="text-muted">Assignments</small>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="mb-3">
                    <Clock size={32} className="text-success mb-2" />
                    <h4 className="text-success">{analytics?.response_time || 0}h</h4>
                    <small className="text-muted">Response Time</small>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="col-lg-4">
        <div className="card shadow-sm">
          <div className="card-header bg-light">
            <h5 className="mb-0">Quick Actions</h5>
          </div>
          <div className="card-body">
            <div className="d-grid gap-2">
              <a href="/teacher-dashboard" className="btn btn-outline-primary">
                <Users size={16} className="me-2" />
                Manage Students
              </a>
              <a href="/create-assignment" className="btn btn-outline-success">
                <BookOpen size={16} className="me-2" />
                Create Assignment
              </a>
              <a href="/feedback" className="btn btn-outline-info">
                <MessageCircle size={16} className="me-2" />
                Give Feedback
              </a>
              <a href="/reports" className="btn btn-outline-warning">
                <TrendingUp size={16} className="me-2" />
                View Reports
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderParentDashboard = () => (
    <div className="row">
      <div className="col-lg-8">
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-info text-white">
            <h5 className="mb-0">Children Overview</h5>
          </div>
          <div className="card-body">
            {loading ? (
              <div className="text-center">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <div className="row text-center">
                <div className="col-md-3">
                  <div className="mb-3">
                    <Users size={32} className="text-primary mb-2" />
                    <h4 className="text-primary">{analytics?.children_count || 0}</h4>
                    <small className="text-muted">Children</small>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="mb-3">
                    <Star size={32} className="text-warning mb-2" />
                    <h4 className="text-warning">{analytics?.average_feedback_rating || 0}</h4>
                    <small className="text-muted">Avg Rating</small>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="mb-3">
                    <BookOpen size={32} className="text-info mb-2" />
                    <h4 className="text-info">{analytics?.pending_assignments || 0}</h4>
                    <small className="text-muted">Pending Work</small>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="mb-3">
                    <MessageCircle size={32} className="text-success mb-2" />
                    <h4 className="text-success">{analytics?.recent_feedback_count || 0}</h4>
                    <small className="text-muted">New Feedback</small>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="col-lg-4">
        <div className="card shadow-sm">
          <div className="card-header bg-light">
            <h5 className="mb-0">Quick Actions</h5>
          </div>
          <div className="card-body">
            <div className="d-grid gap-2">
              <a href="/sections/parent-resources.html" className="btn btn-outline-primary">
                <Users size={16} className="me-2" />
                Parent Dashboard
              </a>
              <a href="/messages" className="btn btn-outline-success">
                <MessageCircle size={16} className="me-2" />
                Message Teachers
              </a>
              <a href="/progress" className="btn btn-outline-info">
                <TrendingUp size={16} className="me-2" />
                View Progress
              </a>
              <a href="/community" className="btn btn-outline-warning">
                <Users size={16} className="me-2" />
                Parent Community
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1">Welcome back, {user.profile?.name || user.email}!</h2>
              <p className="text-muted mb-0">
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard
              </p>
            </div>
            <div className="d-flex align-items-center gap-3">
              <NotificationCenter />
              <div className="dropdown">
                <button
                  className="btn btn-outline-secondary dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                >
                  {user.profile?.name || user.email}
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li><a className="dropdown-item" href="/profile">Profile Settings</a></li>
                  <li><a className="dropdown-item" href="/help">Help & Support</a></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item" onClick={handleSignOut}>
                      Sign Out
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      {user.role === 'student' && renderStudentDashboard()}
      {user.role === 'teacher' && renderTeacherDashboard()}
      {user.role === 'parent' && renderParentDashboard()}

      {/* Recent Activity */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-light">
              <h5 className="mb-0">Recent Activity</h5>
            </div>
            <div className="card-body">
              <div className="text-center text-muted py-4">
                <Clock size={48} className="mb-3 opacity-50" />
                <p>Recent activity will appear here</p>
                <small>Check back later for updates on assignments, feedback, and messages</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard