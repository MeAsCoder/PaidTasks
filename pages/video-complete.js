import Layout from '../components/Layout'
import Link from 'next/link'
import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function VideoComplete() {

  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/tasks')
    }, 5000) // Redirect after 5 seconds
    return () => clearTimeout(timer)
  }, [])


  return (
    <Layout title="Video Complete">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8 my-8 text-center">
        <div className="mb-6">
          <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-4">Video Watching Completed Successfully!</h2>
        <p className="text-gray-600 mb-6">
          Thank you for your time. Your watch duration has been recorded and your reward will be credited shortly.
        </p>
        <Link 
          href="/dashboard" 
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
        >
          Back to Dashboard
        </Link>
      </div>
    </Layout>
  )
}