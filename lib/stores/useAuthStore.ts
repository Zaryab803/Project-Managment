import { create } from 'zustand'
import { createBrowserClient } from '@supabase/ssr'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: 'Administrator' | 'Project Manager' | 'Team Member' | string
  department: string
  phone?: string
  joined: string
}

interface AuthState {
  currentUser: AuthUser | null
  isLoading: boolean
  signIn: (email: string, pass: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  initializeAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => {
  // Initialize the SSR-compatible browser client
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  return {
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
              phone: profileData.phone || '',
              joined: profileData.joined || profileData.joined_at,
            },
          })
        }
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
              phone: profileData.phone || '',
              joined: profileData.joined || profileData.joined_at,
            },
          })
        }
      }
      set({ isLoading: false })
    },
  }
})