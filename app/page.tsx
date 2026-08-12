'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/useAuthStore'

export default function Home() {
  const router = useRouter()
  const currentUser = useAuthStore((state) => state.currentUser)
  const initializeAuth = useAuthStore((state) => state.initializeAuth)
  const isLoading = useAuthStore((state) => state.isLoading)

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  useEffect(() => {
    if (!isLoading) {
      if (currentUser) {
        router.replace('/dashboard')
      } else {
        router.replace('/login')
      }
    }
  }, [currentUser, isLoading, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        <p className="text-sm font-medium text-muted-foreground">Loading Nexus Workspace...</p>
      </div>
    </div>
  )
}