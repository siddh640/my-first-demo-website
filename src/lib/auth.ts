import { supabase } from './supabase'

export interface AuthUser {
  id: string
  email: string
  role: 'student' | 'teacher' | 'parent' | 'admin'
  profile?: any
}

export interface SignUpData {
  email: string
  password: string
  role: 'student' | 'teacher' | 'parent'
  name: string
  phone?: string
  additionalData?: any
}

export interface SignInData {
  email: string
  password: string
}

class AuthService {
  // Sign up new user
  async signUp(data: SignUpData) {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            role: data.role,
            name: data.name
          }
        }
      })

      if (authError) throw authError

      if (authData.user) {
        // Create profile based on role
        await this.createUserProfile(authData.user.id, data)
      }

      return { user: authData.user, error: null }
    } catch (error) {
      console.error('Sign up error:', error)
      return { user: null, error: error as Error }
    }
  }

  // Sign in user
  async signIn(data: SignInData) {
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      })

      if (error) throw error

      return { user: authData.user, error: null }
    } catch (error) {
      console.error('Sign in error:', error)
      return { user: null, error: error as Error }
    }
  }

  // Sign out user
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Sign out error:', error)
      return { error: error as Error }
    }
  }

  // Get current user
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const role = user.user_metadata?.role || 'student'
      let profile = null

      // Get user profile based on role
      switch (role) {
        case 'student':
          const { data: studentData } = await supabase
            .from('students')
            .select('*')
            .eq('id', user.id)
            .single()
          profile = studentData
          break
        case 'teacher':
          const { data: teacherData } = await supabase
            .from('teachers')
            .select('*')
            .eq('id', user.id)
            .single()
          profile = teacherData
          break
        case 'parent':
          const { data: parentData } = await supabase
            .from('parents')
            .select('*')
            .eq('id', user.id)
            .single()
          profile = parentData
          break
      }

      return {
        id: user.id,
        email: user.email!,
        role,
        profile
      }
    } catch (error) {
      console.error('Get current user error:', error)
      return null
    }
  }

  // Create user profile based on role
  private async createUserProfile(userId: string, data: SignUpData) {
    try {
      switch (data.role) {
        case 'student':
          await supabase.from('students').insert([{
            id: userId,
            name: data.name,
            email: data.email,
            level: data.additionalData?.level || 'Beginner',
            phone: data.phone,
            teacher_id: data.additionalData?.teacher_id,
            parent_id: data.additionalData?.parent_id
          }])
          break

        case 'teacher':
          await supabase.from('teachers').insert([{
            id: userId,
            name: data.name,
            email: data.email,
            specialization: data.additionalData?.specialization || 'General English',
            bio: data.additionalData?.bio || '',
            years_experience: data.additionalData?.years_experience || 0,
            phone: data.phone
          }])
          break

        case 'parent':
          await supabase.from('parents').insert([{
            id: userId,
            name: data.name,
            email: data.email,
            phone: data.phone,
            address: data.additionalData?.address
          }])
          break
      }
    } catch (error) {
      console.error('Create profile error:', error)
      throw error
    }
  }

  // Reset password
  async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Reset password error:', error)
      return { error: error as Error }
    }
  }

  // Update password
  async updatePassword(newPassword: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })
      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Update password error:', error)
      return { error: error as Error }
    }
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const user = await this.getCurrentUser()
        callback(user)
      } else {
        callback(null)
      }
    })
  }
}

export const authService = new AuthService()