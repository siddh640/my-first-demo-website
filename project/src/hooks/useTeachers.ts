import { useState, useEffect } from 'react'
import { teacherAPI, Teacher } from '../lib/supabase'

export const useTeachers = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTeachers = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await teacherAPI.getAllTeachers()
      setTeachers(data)
    } catch (error) {
      console.error('Error fetching teachers:', error)
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTeachers()
  }, [])

  return {
    teachers,
    loading,
    error,
    refreshTeachers: fetchTeachers
  }
}