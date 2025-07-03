import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { AuthProvider } from '../context/AuthContext' // Import AuthProvider
import Layout from '../components/Layout'
import LoadingSpinner from '../components/LoadingSpinner'
import '../styles/globals.css'

export default function MyApp({ Component, pageProps }) {
  const router = useRouter()
  const [pageLoading, setPageLoading] = useState(false) // Renamed to avoid confusion with AuthProvider's loading

  useEffect(() => {
    const handleStart = () => setPageLoading(true)
    const handleComplete = () => setPageLoading(false)

    router.events.on('routeChangeStart', handleStart)
    router.events.on('routeChangeComplete', handleComplete)
    router.events.on('routeChangeError', handleComplete)

    return () => {
      router.events.off('routeChangeStart', handleStart)
      router.events.off('routeChangeComplete', handleComplete)
      router.events.off('routeChangeError', handleComplete)
    }
  }, [router])

  return (
    <AuthProvider>
     
        {pageLoading && <LoadingSpinner />}
        <Component {...pageProps} />
      
    </AuthProvider>
  )
}