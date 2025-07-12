import { useState, useEffect } from 'react'
import { studentAPI, feedbackAPI, assignmentAPI, progressAPI, Student, TeacherFeedback, Assignment, Progress } from '../lib/supabase'

export interface StudentData {
  student: Student | null
  feedback: TeacherFeedback[]
  assignments: Assignment[]
  progress: Progress[]
  loading: boolean
  error: string | null
}

export const useStudentData = (studentId: string) => {
  const [data, setData] = useState<StudentData>({
    student: null,
    feedback: [],
    assignments: [],
    progress: [],
    loading: true,
    error: null
  })

  const fetchStudentData = async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }))

      // Fetch all data in parallel
      const [student, feedback, assignments, progress] = await Promise.all([
        studentAPI.getStudent(studentId),
        feedbackAPI.getStudentFeedback(studentId),
        assignmentAPI.getStudentAssignments(studentId),
        progressAPI.getStudentProgress(studentId)
      ])

      setData({
        student,
        feedback,
        assignments,
        progress,
        loading: false,
        error: null
      })
    } catch (error) {
      console.error('Error fetching student data:', error)
      setData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'An error occurred'
      }))
    }
  }

  const refreshData = () => {
    fetchStudentData()
  }

  const addFeedback = async (newFeedback: Omit<TeacherFeedback, 'id' | 'created_at'>) => {
    try {
      const feedback = await feedbackAPI.createFeedback(newFeedback)
      setData(prev => ({
        ...prev,
        feedback: [feedback, ...prev.feedback]
      }))
      return feedback
    } catch (error) {
      console.error('Error adding feedback:', error)
      throw error
    }
  }

  const updateAssignment = async (assignmentId: string, updates: Partial<Assignment>) => {
    try {
      const updatedAssignment = await assignmentAPI.updateAssignment(assignmentId, updates)
      setData(prev => ({
        ...prev,
        assignments: prev.assignments.map(assignment =>
          assignment.id === assignmentId ? updatedAssignment : assignment
        )
      }))
      return updatedAssignment
    } catch (error) {
      console.error('Error updating assignment:', error)
      throw error
    }
  }

  useEffect(() => {
    if (studentId) {
      fetchStudentData()
    }
  }, [studentId])

  return {
    ...data,
    refreshData,
    addFeedback,
    updateAssignment
  }
}