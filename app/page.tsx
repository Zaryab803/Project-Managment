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
    <div className="min-h-screen bg-[#090d16] flex items-center justify-center text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
        <p className="text-sm text-slate-400 font-medium">Loading Nexus Workspace...</p>
      </div>
    </div>
  )
}