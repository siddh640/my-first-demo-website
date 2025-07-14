import React, { useState } from 'react'
import { User, MessageCircle, BookOpen, TrendingUp, Star, Calendar, Plus, Edit, Save, X } from 'lucide-react'
import { useStudentData } from '../hooks/useStudentData'
import { feedbackAPI, assignmentAPI, progressAPI } from '../lib/supabase'
import ParentTeacherChat from './ParentTeacherChat'

const TeacherDashboard: React.FC = () => {
  const [selectedStudent, setSelectedStudent] = useState('demo-student-1')
  const [showAddFeedback, setShowAddFeedback] = useState(false)
  const [showAddAssignment, setShowAddAssignment] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const { student, feedback, assignments, progress, loading, addFeedback, refreshData } = useStudentData(selectedStudent)

  const [newFeedback, setNewFeedback] = useState({
    subject: '',
    message: '',
    rating: 5,
    category: 'progress' as const
  })

  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    due_date: ''
  })

  const handleAddFeedback = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await addFeedback({
        student_id: selectedStudent,
        teacher_id: 'demo-teacher-1', // In real app, get from auth
        subject: newFeedback.subject,
        message: newFeedback.message,
        rating: newFeedback.rating,
        category: newFeedback.category,
        date: new Date().toISOString()
      })
      
      setNewFeedback({ subject: '', message: '', rating: 5, category: 'progress' })
      setShowAddFeedback(false)
      alert('Feedback added successfully!')
    } catch (error) {
      console.error('Error adding feedback:', error)
      alert('Error adding feedback. Please try again.')
    }
  }

  const handleAddAssignment = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await assignmentAPI.createAssignment({
        title: newAssignment.title,
        description: newAssignment.description,
        due_date: newAssignment.due_date,
        student_id: selectedStudent,
        teacher_id: 'demo-teacher-1', // In real app, get from auth
        status: 'pending'
      })
      
      setNewAssignment({ title: '', description: '', due_date: '' })
      setShowAddAssignment(false)
      refreshData()
      alert('Assignment created successfully!')
    } catch (error) {
      console.error('Error creating assignment:', error)
      alert('Error creating assignment. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="container">
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="row mb-4">
        <div className="col-12">
          <h2 className="mb-4">Teacher Dashboard</h2>
          
          {/* Student Selector */}
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-md-6">
                  <label htmlFor="studentSelect" className="form-label">Select Student</label>
                  <select 
                    className="form-select" 
                    id="studentSelect"
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                  >
                    <option value="demo-student-1">Emma Johnson</option>
                    <option value="demo-student-2">Michael Chen</option>
                    <option value="demo-student-3">Sofia Rodriguez</option>
                  </select>
                </div>
                <div className="col-md-6 text-md-end">
                  <button 
                    className="btn btn-primary me-2"
                    onClick={() => setShowAddFeedback(true)}
                  >
                    <Plus size={16} className="me-2" />
                    Add Feedback
                  </button>
                  <button 
                    className="btn btn-outline-primary"
                    onClick={() => setShowAddAssignment(true)}
                  >
                    <Plus size={16} className="me-2" />
                    Create Assignment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Student Info */}
      {student && (
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <div className="row align-items-center">
              <div className="col-md-2 text-center">
                <img 
                  src={student.profile_image || 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg'} 
                  alt={student.name}
                  className="rounded-circle"
                  style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                />
              </div>
              <div className="col-md-10">
                <h4 className="mb-2">{student.name}</h4>
                <div className="row">
                  <div className="col-md-3">
                    <small className="text-muted">Level:</small>
                    <p className="mb-1">{student.level}</p>
                  </div>
                  <div className="col-md-3">
                    <small className="text-muted">Enrolled:</small>
                    <p className="mb-1">{new Date(student.enrollment_date).toLocaleDateString()}</p>
                  </div>
                  <div className="col-md-3">
                    <small className="text-muted">Assignments:</small>
                    <p className="mb-1">{assignments.length} total</p>
                  </div>
                  <div className="col-md-3">
                    <small className="text-muted">Feedback:</small>
                    <p className="mb-1">{feedback.length} entries</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="row">
        <div className="col-lg-8">
          {/* Recent Feedback */}
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-light d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Feedback</h5>
              <span className="badge bg-primary">{feedback.length} total</span>
            </div>
            <div className="card-body">
              {feedback.length === 0 ? (
                <div className="alert alert-info">
                  <p className="mb-0">No feedback provided yet. Click "Add Feedback" to start.</p>
                </div>
              ) : (
                feedback.slice(0, 3).map((item) => (
                  <div key={item.id} className="border-bottom pb-3 mb-3">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h6 className="mb-1">{item.subject}</h6>
                        <p className="mb-2">{item.message}</p>
                        <small className="text-muted">
                          {new Date(item.date || item.created_at).toLocaleDateString()}
                        </small>
                      </div>
                      <div className="text-end">
                        <span className={`badge ${
                          item.category === 'achievement' ? 'bg-warning' :
                          item.category === 'progress' ? 'bg-success' :
                          item.category === 'homework' ? 'bg-info' : 'bg-primary'
                        }`}>
                          {item.category}
                        </span>
                        <div className="mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={i < item.rating ? 'text-warning' : 'text-muted'}
                              fill={i < item.rating ? 'currentColor' : 'none'}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Assignments */}
          <div className="card shadow-sm">
            <div className="card-header bg-light d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Assignments</h5>
              <span className="badge bg-info">{assignments.length} total</span>
            </div>
            <div className="card-body">
              {assignments.length === 0 ? (
                <div className="alert alert-info">
                  <p className="mb-0">No assignments created yet. Click "Create Assignment" to start.</p>
                </div>
              ) : (
                assignments.map((assignment) => (
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
                          <small className="fw-bold">{assignment.grade}%</small>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          {/* Quick Actions */}
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-light">
              <h5 className="mb-0">Quick Actions</h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <button 
                  className="btn btn-outline-primary"
                  onClick={() => setShowAddFeedback(true)}
                >
                  <MessageCircle size={16} className="me-2" />
                  Add Feedback
                </button>
                <button 
                  className="btn btn-outline-info"
                  onClick={() => setShowAddAssignment(true)}
                >
                  <BookOpen size={16} className="me-2" />
                  Create Assignment
                </button>
                <button 
                  className="btn btn-outline-success me-2"
                  onClick={() => setShowChat(true)}
                >
                  <MessageCircle size={16} className="me-2" />
                  Chat with Parent
                </button>
                <button className="btn btn-outline-success">
                  <TrendingUp size={16} className="me-2" />
                  Update Progress
                </button>
                <button 
                  className="btn btn-outline-warning"
                  onClick={() => setShowChat(true)}
                >
                  <MessageCircle size={16} className="me-2" />
                  Chat with Parent
                </button>
              </div>
            </div>
          </div>

          {/* Student Stats */}
          <div className="card shadow-sm">
            <div className="card-header bg-light">
              <h5 className="mb-0">Student Statistics</h5>
            </div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col-6 mb-3">
                  <h4 className="text-primary mb-1">95%</h4>
                  <small className="text-muted">Attendance</small>
                </div>
                <div className="col-6 mb-3">
                  <h4 className="text-success mb-1">A-</h4>
                  <small className="text-muted">Avg Grade</small>
                </div>
                <div className="col-6">
                  <h4 className="text-info mb-1">{assignments.filter(a => a.status === 'submitted').length}</h4>
                  <small className="text-muted">Submitted</small>
                </div>
                <div className="col-6">
                  <h4 className="text-warning mb-1">{assignments.filter(a => a.status === 'pending').length}</h4>
                  <small className="text-muted">Pending</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Feedback Modal */}
      {showAddFeedback && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Student Feedback</h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowAddFeedback(false)}
                ></button>
              </div>
              <form onSubmit={handleAddFeedback}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Subject</label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={newFeedback.subject}
                      onChange={(e) => setNewFeedback({...newFeedback, subject: e.target.value})}
                      required 
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Category</label>
                    <select 
                      className="form-select"
                      value={newFeedback.category}
                      onChange={(e) => setNewFeedback({...newFeedback, category: e.target.value as any})}
                    >
                      <option value="progress">Progress</option>
                      <option value="achievement">Achievement</option>
                      <option value="homework">Homework</option>
                      <option value="behavior">Behavior</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Rating</label>
                    <select 
                      className="form-select"
                      value={newFeedback.rating}
                      onChange={(e) => setNewFeedback({...newFeedback, rating: parseInt(e.target.value)})}
                    >
                      <option value={5}>5 - Excellent</option>
                      <option value={4}>4 - Very Good</option>
                      <option value={3}>3 - Good</option>
                      <option value={2}>2 - Needs Improvement</option>
                      <option value={1}>1 - Poor</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Message</label>
                    <textarea 
                      className="form-control" 
                      rows={4}
                      value={newFeedback.message}
                      onChange={(e) => setNewFeedback({...newFeedback, message: e.target.value})}
                      required
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowAddFeedback(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <Save size={16} className="me-2" />
                    Save Feedback
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Assignment Modal */}
      {showAddAssignment && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create New Assignment</h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowAddAssignment(false)}
                ></button>
              </div>
              <form onSubmit={handleAddAssignment}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Title</label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={newAssignment.title}
                      onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})}
                      required 
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea 
                      className="form-control" 
                      rows={3}
                      value={newAssignment.description}
                      onChange={(e) => setNewAssignment({...newAssignment, description: e.target.value})}
                      required
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Due Date</label>
                    <input 
                      type="date" 
                      className="form-control"
                      value={newAssignment.due_date}
                      onChange={(e) => setNewAssignment({...newAssignment, due_date: e.target.value})}
                      required 
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowAddAssignment(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <Save size={16} className="me-2" />
                    Create Assignment
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {showChat && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Chat with Parent</h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowChat(false)}
                ></button>
              </div>
              <div className="modal-body p-0">
                <ParentTeacherChat
                  currentUserId="demo-teacher-1"
                  currentUserType="teacher"
                  currentUserName="Ms. Sarah Johnson"
                  recipientId="demo-parent-1"
                  recipientName="Robert Johnson"
                  studentId={selectedStudent}
                  studentName={student?.name || "Emma Johnson"}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TeacherDashboard