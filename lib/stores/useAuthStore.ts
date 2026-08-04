import { create } from 'zustand'
import { supabase } from '@/lib/supabaseClient'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: 'Administrator' | 'Project Manager' | 'Team Member'
  department: string
  joined: string
}

interface AuthState {
  currentUser: AuthUser | null
  isLoading: boolean
  signIn: (email: string, pass: string) => Promise<{ error: string | null }>
  signUp: (name: string, email: string, pass: string, department?: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  initializeAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: null,
  isLoading: true,

  signIn: async (email, password) => {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) return { error: authError.message }

    if (authData.user) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single()

      if (profileData) {
        set({
          currentUser: {
            id: profileData.id,
            name: profileData.name,
            email: profileData.email,
            role: profileData.role,
            department: profileData.department,
            joined: profileData.joined,
          },
        })
      }
    }
    return { error: null }
  },

  signUp: async (name, email, password, department = 'Engineering') => {
    // 1. Register user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) return { error: authError.message }

    if (authData.user) {
      const newProfile = {
        id: authData.user.id,
        name,
        email,
        role: 'Team Member' as const,
        department,
        joined: 'Jan 2026',
      }

      // 2. Insert corresponding row into public.profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([newProfile])

      if (profileError) return { error: profileError.message }

      set({ currentUser: newProfile })
    }

    return { error: null }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ currentUser: null })
  },

  initializeAuth: async () => {
    set({ isLoading: true })
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session?.user) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (profileData) {
        set({
          currentUser: {
            id: profileData.id,
            name: profileData.name,
            email: profileData.email,
            role: profileData.role,
            department: profileData.department,
            joined: profileData.joined,
          },
        })
      }
    }
    set({ isLoading: false })
  },
}))