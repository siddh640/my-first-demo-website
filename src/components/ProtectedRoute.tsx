import React from 'react'
import { useAuth } from './AuthProvider'
import LoginForm from './LoginForm'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: ('student' | 'teacher' | 'parent' | 'admin')[]
  fallback?: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles,
  fallback 
}) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return fallback || (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <LoginForm />
          </div>
        </div>
      </div>
    )
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning text-center">
          <h4>Access Denied</h4>
          <p>You don't have permission to access this page.</p>
          <p>Required roles: {allowedRoles.join(', ')}</p>
          <p>Your role: {user.role}</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export default ProtectedRoute