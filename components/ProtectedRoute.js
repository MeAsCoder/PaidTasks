// components/ProtectedRoute.js
import { useRouter } from 'next/router'
import { useAuth } from '@/context/AuthContext'
import { useEffect } from 'react'
import LoadingSpinner from '@/components/LoadingSpinner' // Create this component for loading state

export default function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !currentUser) {
      router.push('/auth/login')
    }
  }, [currentUser, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return currentUser ? children : null
}