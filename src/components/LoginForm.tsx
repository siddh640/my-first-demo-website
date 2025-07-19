import React, { useState } from 'react'
import { Eye, EyeOff, Mail, Lock, User, Phone, GraduationCap } from 'lucide-react'
import { useAuth } from './AuthProvider'

interface LoginFormProps {
  onSuccess?: () => void
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { signIn, signUp, resetPassword } = useAuth()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    role: 'student' as 'student' | 'teacher' | 'parent',
    level: 'Beginner',
    specialization: '',
    teacherId: '',
    parentId: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password)
        if (error) {
          setError(error.message)
        } else {
          onSuccess?.()
        }
      } else {
        // Validation for sign up
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match')
          return
        }

        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters')
          return
        }

        const signUpData = {
          email: formData.email,
          password: formData.password,
          name: formData.name,
          phone: formData.phone,
          role: formData.role,
          additionalData: {
            level: formData.role === 'student' ? formData.level : undefined,
            specialization: formData.role === 'teacher' ? formData.specialization : undefined,
            teacher_id: formData.role === 'student' ? formData.teacherId : undefined,
            parent_id: formData.role === 'student' ? formData.parentId : undefined
          }
        }

        const { error } = await signUp(signUpData)
        if (error) {
          setError(error.message)
        } else {
          onSuccess?.()
        }
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError('Please enter your email address')
      return
    }

    setLoading(true)
    try {
      const { error } = await resetPassword(formData.email)
      if (error) {
        setError(error.message)
      } else {
        alert('Password reset email sent! Check your inbox.')
      }
    } catch (err) {
      setError('Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card shadow-lg" style={{ maxWidth: '500px', margin: '0 auto' }}>
      <div className="card-header bg-primary text-white text-center">
        <h3 className="mb-0">{isLogin ? 'Sign In' : 'Create Account'}</h3>
        <p className="mb-0 opacity-75">American Institute Portal</p>
      </div>
      <div className="card-body p-4">
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className="mb-3">
                <label className="form-label">
                  <User size={16} className="me-2" />
                  Full Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Enter your full name"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">
                  <GraduationCap size={16} className="me-2" />
                  Role
                </label>
                <select
                  className="form-select"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  required
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="parent">Parent</option>
                </select>
              </div>

              {formData.role === 'student' && (
                <div className="mb-3">
                  <label className="form-label">English Level</label>
                  <select
                    className="form-select"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Business">Business English</option>
                  </select>
                </div>
              )}

              {formData.role === 'teacher' && (
                <div className="mb-3">
                  <label className="form-label">Specialization</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    placeholder="e.g., Grammar & Conversation"
                    required
                  />
                </div>
              )}

              <div className="mb-3">
                <label className="form-label">
                  <Phone size={16} className="me-2" />
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  className="form-control"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter your phone number"
                />
              </div>
            </>
          )}

          <div className="mb-3">
            <label className="form-label">
              <Mail size={16} className="me-2" />
              Email Address
            </label>
            <input
              type="email"
              className="form-control"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">
              <Lock size={16} className="me-2" />
              Password
            </label>
            <div className="input-group">
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                placeholder="Enter your password"
                minLength={6}
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {!isLogin && (
              <small className="text-muted">Password must be at least 6 characters</small>
            )}
          </div>

          {!isLogin && (
            <div className="mb-3">
              <label className="form-label">
                <Lock size={16} className="me-2" />
                Confirm Password
              </label>
              <input
                type="password"
                className="form-control"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                placeholder="Confirm your password"
              />
            </div>
          )}

          <div className="d-grid gap-2">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  {isLogin ? 'Signing In...' : 'Creating Account...'}
                </>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>

            {isLogin && (
              <button
                type="button"
                className="btn btn-link"
                onClick={handleForgotPassword}
                disabled={loading}
              >
                Forgot Password?
              </button>
            )}
          </div>
        </form>

        <hr />

        <div className="text-center">
          <p className="mb-0">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              type="button"
              className="btn btn-link p-0 ms-1"
              onClick={() => {
                setIsLogin(!isLogin)
                setError('')
                setFormData({
                  email: '',
                  password: '',
                  confirmPassword: '',
                  name: '',
                  phone: '',
                  role: 'student',
                  level: 'Beginner',
                  specialization: '',
                  teacherId: '',
                  parentId: ''
                })
              }}
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginForm