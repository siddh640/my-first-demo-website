import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { MessageCircle, TrendingUp, Calendar, Bell, Star, BookOpen, Clock, Award } from 'lucide-react';

// Types
interface Student {
  id: string;
  name: string;
  level: string;
  teacher: string;
  profileImage: string;
}

interface TeacherFeedback {
  id: string;
  teacherName: string;
  date: string;
  subject: string;
  message: string;
  rating: number;
  category: 'progress' | 'behavior' | 'homework' | 'achievement';
}

interface ProgressData {
  subject: string;
  currentScore: number;
  previousScore: number;
  trend: 'up' | 'down' | 'stable';
}

interface Assignment {
  id: string;
  title: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded';
  grade?: number;
}

// Mock data
const mockStudent: Student = {
  id: '1',
  name: 'Emma Johnson',
  level: 'Intermediate',
  teacher: 'Ms. Sarah Johnson',
  profileImage: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg'
};

const mockFeedback: TeacherFeedback[] = [
  {
    id: '1',
    teacherName: 'Ms. Sarah Johnson',
    date: '2025-01-13',
    subject: 'Grammar Progress',
    message: 'Emma has shown excellent improvement in her understanding of past perfect tense. She actively participates in class discussions and helps other students.',
    rating: 5,
    category: 'progress'
  },
  {
    id: '2',
    teacherName: 'Mr. Michael Williams',
    date: '2025-01-12',
    subject: 'Vocabulary Achievement',
    message: 'Outstanding performance on the vocabulary quiz! Emma scored 95% and demonstrated excellent retention of new words.',
    rating: 5,
    category: 'achievement'
  },
  {
    id: '3',
    teacherName: 'Ms. Sarah Johnson',
    date: '2025-01-10',
    subject: 'Homework Completion',
    message: 'Emma consistently submits high-quality homework on time. Her writing assignments show creativity and proper grammar usage.',
    rating: 4,
    category: 'homework'
  }
];

const mockProgress: ProgressData[] = [
  { subject: 'Grammar', currentScore: 88, previousScore: 82, trend: 'up' },
  { subject: 'Vocabulary', currentScore: 92, previousScore: 89, trend: 'up' },
  { subject: 'Speaking', currentScore: 85, previousScore: 85, trend: 'stable' },
  { subject: 'Writing', currentScore: 79, previousScore: 83, trend: 'down' }
];

const mockAssignments: Assignment[] = [
  { id: '1', title: 'Essay: My Future Goals', dueDate: '2025-01-15', status: 'pending' },
  { id: '2', title: 'Grammar Exercise Set 5', dueDate: '2025-01-14', status: 'submitted' },
  { id: '3', title: 'Vocabulary Quiz Chapter 8', dueDate: '2025-01-12', status: 'graded', grade: 95 }
];

// Components
const StudentProfile: React.FC<{ student: Student }> = ({ student }) => (
  <div className="card shadow-sm mb-4">
    <div className="card-body">
      <div className="row align-items-center">
        <div className="col-md-3 text-center">
          <img 
            src={student.profileImage} 
            alt={student.name}
            className="rounded-circle mb-2"
            style={{ width: '100px', height: '100px', objectFit: 'cover' }}
          />
        </div>
        <div className="col-md-9">
          <h3 className="mb-2">{student.name}</h3>
          <p className="text-muted mb-1"><strong>Level:</strong> {student.level}</p>
          <p className="text-muted mb-1"><strong>Primary Teacher:</strong> {student.teacher}</p>
          <div className="d-flex gap-2 mt-3">
            <span className="badge bg-success">Active Student</span>
            <span className="badge bg-primary">Regular Attendance</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const TeacherFeedbackCard: React.FC<{ feedback: TeacherFeedback }> = ({ feedback }) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'progress': return <TrendingUp className="text-success" size={20} />;
      case 'achievement': return <Award className="text-warning" size={20} />;
      case 'homework': return <BookOpen className="text-info" size={20} />;
      case 'behavior': return <Star className="text-primary" size={20} />;
      default: return <MessageCircle className="text-secondary" size={20} />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'progress': return 'border-success';
      case 'achievement': return 'border-warning';
      case 'homework': return 'border-info';
      case 'behavior': return 'border-primary';
      default: return 'border-secondary';
    }
  };

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
            <strong>{feedback.teacherName}</strong>
          </small>
          <small className="text-muted">
            <Clock size={14} className="me-1" />
            {new Date(feedback.date).toLocaleDateString()}
          </small>
        </div>
      </div>
    </div>
  );
};

const ProgressChart: React.FC<{ progress: ProgressData[] }> = ({ progress }) => (
  <div className="card shadow-sm">
    <div className="card-header bg-light">
      <h4 className="mb-0">Academic Progress</h4>
    </div>
    <div className="card-body">
      {progress.map((item, index) => (
        <div key={index} className="mb-3">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <span className="fw-medium">{item.subject}</span>
            <div className="d-flex align-items-center">
              <span className="me-2">{item.currentScore}%</span>
              {item.trend === 'up' && <TrendingUp size={16} className="text-success" />}
              {item.trend === 'down' && <TrendingUp size={16} className="text-danger" style={{ transform: 'rotate(180deg)' }} />}
              {item.trend === 'stable' && <span className="text-muted">—</span>}
            </div>
          </div>
          <div className="progress" style={{ height: '8px' }}>
            <div 
              className={`progress-bar ${item.trend === 'up' ? 'bg-success' : item.trend === 'down' ? 'bg-warning' : 'bg-info'}`}
              style={{ width: `${item.currentScore}%` }}
            ></div>
          </div>
          <small className="text-muted">
            Previous: {item.previousScore}% 
            <span className={`ms-1 ${item.trend === 'up' ? 'text-success' : item.trend === 'down' ? 'text-danger' : 'text-muted'}`}>
              ({item.currentScore > item.previousScore ? '+' : ''}{item.currentScore - item.previousScore})
            </span>
          </small>
        </div>
      ))}
    </div>
  </div>
);

const AssignmentTracker: React.FC<{ assignments: Assignment[] }> = ({ assignments }) => (
  <div className="card shadow-sm">
    <div className="card-header bg-light">
      <h4 className="mb-0">Recent Assignments</h4>
    </div>
    <div className="card-body">
      {assignments.map((assignment) => (
        <div key={assignment.id} className="d-flex justify-content-between align-items-center py-2 border-bottom">
          <div>
            <h6 className="mb-1">{assignment.title}</h6>
            <small className="text-muted">Due: {new Date(assignment.dueDate).toLocaleDateString()}</small>
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
);

const MessageTeacher: React.FC = () => {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      alert('Message sent successfully! Your teacher will respond within 24 hours.');
      setMessage('');
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-light">
        <h4 className="mb-0">Message Teacher</h4>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="teacherSelect" className="form-label">Select Teacher</label>
            <select className="form-select" id="teacherSelect" required>
              <option value="">Choose a teacher...</option>
              <option value="sarah">Ms. Sarah Johnson</option>
              <option value="michael">Mr. Michael Williams</option>
              <option value="elena">Dr. Elena Martinez</option>
            </select>
          </div>
          <div className="mb-3">
            <label htmlFor="messageSubject" className="form-label">Subject</label>
            <input type="text" className="form-control" id="messageSubject" placeholder="Enter subject" required />
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
  );
};

// Main Dashboard Component
const ParentDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

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
      <StudentProfile student={mockStudent} />

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="row">
          <div className="col-lg-8">
            <ProgressChart progress={mockProgress} />
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
                      <h3 className="text-info mb-1">12</h3>
                      <small className="text-muted">Assignments</small>
                    </div>
                  </div>
                  <div className="col-6">
                    <h3 className="text-warning mb-1">3</h3>
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
            {mockFeedback.map((feedback) => (
              <TeacherFeedbackCard key={feedback.id} feedback={feedback} />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'assignments' && (
        <div className="row">
          <div className="col-lg-8">
            <AssignmentTracker assignments={mockAssignments} />
          </div>
          <div className="col-lg-4">
            <div className="card shadow-sm">
              <div className="card-header bg-light">
                <h4 className="mb-0">Upcoming Deadlines</h4>
              </div>
              <div className="card-body">
                <div className="d-flex align-items-center mb-3">
                  <Calendar size={20} className="text-primary me-3" />
                  <div>
                    <h6 className="mb-1">Essay Due Tomorrow</h6>
                    <small className="text-muted">My Future Goals</small>
                  </div>
                </div>
                <div className="d-flex align-items-center">
                  <Calendar size={20} className="text-warning me-3" />
                  <div>
                    <h6 className="mb-1">Quiz Next Week</h6>
                    <small className="text-muted">Grammar Chapter 9</small>
                  </div>
                </div>
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
  );
};

// Initialize the React component
const container = document.getElementById('parent-dashboard-root');
if (container) {
  const root = createRoot(container);
  root.render(<ParentDashboard />);
}