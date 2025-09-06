import React, { useState } from 'react'
import { MessageCircle, TrendingUp, Calendar, Bell, Star, BookOpen, Clock, Award, User, Mail, Phone } from 'lucide-react'
import { useStudentData } from '../hooks/useStudentData'
import { useTeachers } from '../hooks/useTeachers'
import { parentAPI } from '../lib/supabase'

// Mock student ID for demo - in real app this would come from authentication
const DEMO_STUDENT_ID = 'demo-student-1'

interface StudentProfileProps {
  student: any
  loading: boolean
}

const StudentProfile: React.FC<StudentProfileProps> = ({ student, loading }) => {
  if (loading) {
    return (
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="text-center py-4">
            <User size={48} className="text-muted mb-3" />
            <h5>Student Profile</h5>
            <p className="text-muted mb-0">Student information will appear here once logged in.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body">
        <div className="row align-items-center">
          <div className="col-md-3 text-center">
            <img 
              src={student.profile_image || 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg'} 
              alt={student.name}
              className="rounded-circle mb-2"
              style={{ width: '100px', height: '100px', objectFit: 'cover' }}
            />
          </div>
          <div className="col-md-9">
            <h3 className="mb-2">{student.name}</h3>
            <p className="text-muted mb-1"><strong>Level:</strong> {student.level}</p>
            <p className="text-muted mb-1"><strong>Primary Teacher:</strong> {student.teacher?.name || 'Not assigned'}</p>
            <p className="text-muted mb-1"><strong>Enrolled:</strong> {new Date(student.enrollment_date).toLocaleDateString()}</p>
            <div className="d-flex gap-2 mt-3">
              <span className="badge bg-success">Active Student</span>
              <span className="badge bg-primary">Regular Attendance</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface TeacherFeedbackCardProps {
  feedback: any
}

const TeacherFeedbackCard: React.FC<TeacherFeedbackCardProps> = ({ feedback }) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'progress': return <TrendingUp className="text-success" size={20} />
      case 'achievement': return <Award className="text-warning" size={20} />
      case 'homework': return <BookOpen className="text-info" size={20} />
      case 'behavior': return <Star className="text-primary" size={20} />
      default: return <MessageCircle className="text-secondary" size={20} />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'progress': return 'border-success'
      case 'achievement': return 'border-warning'
      case 'homework': return 'border-info'
      case 'behavior': return 'border-primary'
      default: return 'border-secondary'
    }
  }

  return (
    <div className={`card mb-3 ${getCategoryColor(feedback.category)}`} style={{ borderLeftWidth: '4px' }}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div className="d-flex align-items-center">
            {getCategoryIcon(feedback.category)}
            <h5 className="card-title mb-0 ms-2">{feedback.subject}</h5>
          </div>
          <div className="d-flex align-items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={16}
                className={i < feedback.rating ? 'text-warning' : 'text-muted'}
                fill={i < feedback.rating ? 'currentColor' : 'none'}
              />
            ))}
          </div>
        </div>
        <p className="card-text">{feedback.message}</p>
        <div className="d-flex justify-content-between align-items-center">
          <small className="text-muted">
            <strong>{feedback.teacher?.name || 'Teacher'}</strong>
          </small>
          <small className="text-muted">
            <Clock size={14} className="me-1" />
            {new Date(feedback.date || feedback.created_at).toLocaleDateString()}
          </small>
        </div>
      </div>
    </div>
  )
}

interface ProgressChartProps {
  progress: any[]
}

const ProgressChart: React.FC<ProgressChartProps> = ({ progress }) => {
  // Group progress by subject and get latest scores
  const progressBySubject = progress.reduce((acc, item) => {
    if (!acc[item.subject] || new Date(item.assessment_date) > new Date(acc[item.subject].assessment_date)) {
      acc[item.subject] = item
    }
    return acc
  }, {} as Record<string, any>)

  const subjects = Object.values(progressBySubject)

  if (subjects.length === 0) {
    return (
      <div className="card shadow-sm">
        <div className="card-header bg-light">
          <h4 className="mb-0">Academic Progress</h4>
        </div>
        <div className="card-body">
          <div className="alert alert-info">
            <p className="mb-0">No progress data available yet. Progress will be updated after assessments.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-light">
        <h4 className="mb-0">Academic Progress</h4>
      </div>
      <div className="card-body">
        {subjects.map((item, index) => {
          const trend = item.current_score > item.previous_score ? 'up' : 
                      item.current_score < item.previous_score ? 'down' : 'stable'
          
          return (
            <div key={index} className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="fw-medium">{item.subject}</span>
                <div className="d-flex align-items-center">
                  <span className="me-2">{item.current_score}%</span>
                  {trend === 'up' && <TrendingUp size={16} className="text-success" />}
                  {trend === 'down' && <TrendingUp size={16} className="text-danger" style={{ transform: 'rotate(180deg)' }} />}
                  {trend === 'stable' && <span className="text-muted">—</span>}
                </div>
              </div>
              <div className="progress" style={{ height: '8px' }}>
                <div 
                  className={`progress-bar ${trend === 'up' ? 'bg-success' : trend === 'down' ? 'bg-warning' : 'bg-info'}`}
                  style={{ width: `${item.current_score}%` }}
                ></div>
              </div>
              <small className="text-muted">
                Previous: {item.previous_score}% 
                <span className={`ms-1 ${trend === 'up' ? 'text-success' : trend === 'down' ? 'text-danger' : 'text-muted'}`}>
                  ({item.current_score > item.previous_score ? '+' : ''}{item.current_score - item.previous_score})
                </span>
              </small>
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface AssignmentTrackerProps {
  assignments: any[]
}

const AssignmentTracker: React.FC<AssignmentTrackerProps> = ({ assignments }) => {
  if (assignments.length === 0) {
    return (
      <div className="card shadow-sm">
        <div className="card-header bg-light">
          <h4 className="mb-0">Recent Assignments</h4>
        </div>
        <div className="card-body">
          <div className="alert alert-info">
            <p className="mb-0">No assignments available yet.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-light">
        <h4 className="mb-0">Recent Assignments</h4>
      </div>
      <div className="card-body">
        {assignments.slice(0, 5).map((assignment) => (
          <div key={assignment.id} className="d-flex justify-content-between align-items-center py-2 border-bottom">
            <div>
              <h6 className="mb-1">{assignment.title}</h6>
              <small className="text-muted">Due: {new Date(assignment.due_date).toLocaleDateString()}</small>
            </div>
            <div className="text-end">
              <span className={`badge ${
                assignment.status === 'graded' ? 'bg-success' :
                assignment.status === 'submitted' ? 'bg-info' : 'bg-warning'
              }`}>
                {assignment.status}
              </span>
              {assignment.grade && (
                <div className="mt-1">
                  <small className="fw-bold text-success">{assignment.grade}%</small>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const MessageTeacher: React.FC = () => {
  const [message, setMessage] = useState('')
  const [subject, setSubject] = useState('')
  const [selectedTeacher, setSelectedTeacher] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { teachers, loading: teachersLoading } = useTeachers()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // In a real app, you'd get the parent ID from authentication
      await parentAPI.sendMessageToTeacher({
        parent_id: 'demo-parent-1',
        teacher_id: selectedTeacher,
        student_id: DEMO_STUDENT_ID,
        subject,
        message
      })
      
      alert('Message sent successfully! Your teacher will respond within 24 hours.')
      setMessage('')
      setSubject('')
      setSelectedTeacher('')
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Error sending message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-light">
        <h4 className="mb-0">Message Teacher</h4>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="teacherSelect" className="form-label">Select Teacher</label>
            <select 
              className="form-select" 
              id="teacherSelect" 
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              required
              disabled={teachersLoading}
            >
              <option value="">Choose a teacher...</option>
              {teachers.map(teacher => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name} - {teacher.specialization}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label htmlFor="messageSubject" className="form-label">Subject</label>
            <input 
              type="text" 
              className="form-control" 
              id="messageSubject" 
              placeholder="Enter subject" 
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required 
            />
          </div>
          <div className="mb-3">
            <label htmlFor="messageText" className="form-label">Message</label>
            <textarea 
              className="form-control" 
              id="messageText" 
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              required
            ></textarea>
          </div>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Sending...
              </>
            ) : (
              <>
                <MessageCircle size={16} className="me-2" />
                Send Message
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

const ParentDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const { student, feedback, assignments, progress, loading, error } = useStudentData(DEMO_STUDENT_ID)

  if (error) {
    return (
      <div className="container">
        <div className="alert alert-danger">
          <h5>Error Loading Data</h5>
          <p>{error}</p>
          <p className="mb-0">This is likely because the database is not yet set up. In a real application, you would need to configure Supabase.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="row mb-4">
        <div className="col-12">
          <h2 className="mb-4">Parent Dashboard</h2>
          
          {/* Navigation Tabs */}
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <TrendingUp size={16} className="me-2" />
                Overview
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'feedback' ? 'active' : ''}`}
                onClick={() => setActiveTab('feedback')}
              >
                <MessageCircle size={16} className="me-2" />
                Teacher Feedback
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'assignments' ? 'active' : ''}`}
                onClick={() => setActiveTab('assignments')}
              >
                <BookOpen size={16} className="me-2" />
                Assignments
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'message' ? 'active' : ''}`}
                onClick={() => setActiveTab('message')}
              >
                <Bell size={16} className="me-2" />
                Contact Teacher
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Student Profile - Always visible */}
      <StudentProfile student={student} loading={loading} />

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="row">
          <div className="col-lg-8">
            <ProgressChart progress={progress} />
          </div>
          <div className="col-lg-4">
            <div className="card shadow-sm">
              <div className="card-header bg-light">
                <h4 className="mb-0">Quick Stats</h4>
              </div>
              <div className="card-body">
                <div className="row text-center">
                  <div className="col-6 mb-3">
                    <div className="border-end">
                      <h3 className="text-primary mb-1">95%</h3>
                      <small className="text-muted">Attendance</small>
                    </div>
                  </div>
                  <div className="col-6 mb-3">
                    <h3 className="text-success mb-1">A-</h3>
                    <small className="text-muted">Overall Grade</small>
                  </div>
                  <div className="col-6">
                    <div className="border-end">
                      <h3 className="text-info mb-1">{assignments.length}</h3>
                      <small className="text-muted">Assignments</small>
                    </div>
                  </div>
                  <div className="col-6">
                    <h3 className="text-warning mb-1">{feedback.filter(f => f.category === 'achievement').length}</h3>
                    <small className="text-muted">Achievements</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'feedback' && (
        <div className="row">
          <div className="col-12">
            <h3 className="mb-4">Recent Teacher Feedback</h3>
            {feedback.length === 0 ? (
              <div className="alert alert-info">
                <p className="mb-0">No feedback available yet. Teachers will provide feedback as your child progresses.</p>
              </div>
            ) : (
              feedback.map((feedbackItem) => (
                <TeacherFeedbackCard key={feedbackItem.id} feedback={feedbackItem} />
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'assignments' && (
        <div className="row">
          <div className="col-lg-8">
            <AssignmentTracker assignments={assignments} />
          </div>
          <div className="col-lg-4">
            <div className="card shadow-sm">
              <div className="card-header bg-light">
                <h4 className="mb-0">Upcoming Deadlines</h4>
              </div>
              <div className="card-body">
                {assignments.filter(a => a.status === 'pending').slice(0, 3).map((assignment, index) => (
                  <div key={assignment.id} className="d-flex align-items-center mb-3">
                    <Calendar size={20} className="text-primary me-3" />
                    <div>
                      <h6 className="mb-1">{assignment.title}</h6>
                      <small className="text-muted">Due: {new Date(assignment.due_date).toLocaleDateString()}</small>
                    </div>
                  </div>
                ))}
                {assignments.filter(a => a.status === 'pending').length === 0 && (
                  <p className="text-muted mb-0">No upcoming deadlines</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'message' && (
        <div className="row">
          <div className="col-lg-8">
            <MessageTeacher />
          </div>
          <div className="col-lg-4">
            <div className="card shadow-sm">
              <div className="card-header bg-light">
                <h4 className="mb-0">Teacher Availability</h4>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <h6>Ms. Sarah Johnson</h6>
                  <small className="text-success">● Online now</small>
                  <p className="small text-muted mt-1">Usually responds within 2 hours</p>
                </div>
                <div className="mb-3">
                  <h6>Mr. Michael Williams</h6>
                  <small className="text-warning">● Away</small>
                  <p className="small text-muted mt-1">Usually responds within 24 hours</p>
                </div>
                <div>
                  <h6>Dr. Elena Martinez</h6>
                  <small className="text-muted">● Offline</small>
                  <p className="small text-muted mt-1">Available during office hours</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ParentDashboard