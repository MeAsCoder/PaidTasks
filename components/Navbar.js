import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'

export default function Navbar() {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { currentUser, loading, logout } = useAuth()

  // Check if current route matches href
  const isActive = (href) => router.pathname === href

  // Loading state for auth
  if (loading) {
    return (
      <header className="sticky top-0 z-50 bg-white shadow-lg">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            Task<span className="text-orange-500">Earn</span>
          </Link>
          <div className="animate-pulse bg-gray-200 h-8 w-8 rounded-full"></div>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 bg-white shadow-lg">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-blue-600">
          Task<span className="text-orange-500">Earn</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link 
            href="/" 
            className={`py-2 transition ${isActive('/') ? 'text-blue-600 font-semibold border-b-2 border-blue-600' : 'hover:text-blue-600'}`}
          >
            Home
          </Link>
          
          {currentUser ? (
            <>
              <Link 
                href="/dashboard" 
                className={`py-2 transition ${isActive('/dashboard') ? 'text-blue-600 font-semibold border-b-2 border-blue-600' : 'hover:text-blue-600'}`}
              >
                Dashboard
              </Link>
              <Link 
                href="/tasks" 
                className={`py-2 transition ${isActive('/tasks') ? 'text-blue-600 font-semibold border-b-2 border-blue-600' : 'hover:text-blue-600'}`}
              >
                Tasks
              </Link>
              <Link 
                href="/profile" 
                className={`py-2 transition ${isActive('/profile') ? 'text-blue-600 font-semibold border-b-2 border-blue-600' : 'hover:text-blue-600'}`}
              >
                Profile
              </Link>
              <button
                onClick={() => logout()}
                className="py-2 text-red-600 hover:text-red-800 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link 
                href="/about" 
                className={`py-2 transition ${isActive('/about') ? 'text-blue-600 font-semibold border-b-2 border-blue-600' : 'hover:text-blue-600'}`}
              >
                About
              </Link>
              <Link 
                href="/contact" 
                className={`py-2 transition ${isActive('/contact') ? 'text-blue-600 font-semibold border-b-2 border-blue-600' : 'hover:text-blue-600'}`}
              >
                Contact
              </Link>
              <Link 
                href="/auth/login" 
                className={`py-2 transition ${isActive('/auth/login') ? 'text-blue-600 font-semibold border-b-2 border-blue-600' : 'hover:text-blue-600'}`}
              >
                Login
              </Link>
              <Link 
                href="/auth/register" 
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                Register
              </Link>
            </>
          )}
        </nav>
        
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-gray-700"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white pb-4 px-4 space-y-2">
          <Link 
            href="/" 
            className={`block py-2 px-2 ${isActive('/') ? 'text-blue-600 font-semibold bg-blue-50 rounded' : 'hover:text-blue-600 hover:bg-blue-50 rounded'}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>
          
          {currentUser ? (
            <>
              <Link 
                href="/dashboard" 
                className={`block py-2 px-2 ${isActive('/dashboard') ? 'text-blue-600 font-semibold bg-blue-50 rounded' : 'hover:text-blue-600 hover:bg-blue-50 rounded'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link 
                href="/tasks" 
                className={`block py-2 px-2 ${isActive('/tasks') ? 'text-blue-600 font-semibold bg-blue-50 rounded' : 'hover:text-blue-600 hover:bg-blue-50 rounded'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Tasks
              </Link>
              <Link 
                href="/profile" 
                className={`block py-2 px-2 ${isActive('/profile') ? 'text-blue-600 font-semibold bg-blue-50 rounded' : 'hover:text-blue-600 hover:bg-blue-50 rounded'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Profile
              </Link>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left py-2 px-2 text-red-600 hover:bg-red-50 rounded"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link 
                href="/about" 
                className={`block py-2 px-2 ${isActive('/about') ? 'text-blue-600 font-semibold bg-blue-50 rounded' : 'hover:text-blue-600 hover:bg-blue-50 rounded'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                href="/contact" 
                className={`block py-2 px-2 ${isActive('/contact') ? 'text-blue-600 font-semibold bg-blue-50 rounded' : 'hover:text-blue-600 hover:bg-blue-50 rounded'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <div className="pt-2 border-t border-gray-200 mt-2">
                <Link 
                  href="/auth/login" 
                  className={`block py-2 px-2 ${isActive('/auth/login') ? 'text-blue-600 font-semibold bg-blue-50 rounded' : 'hover:text-blue-600 hover:bg-blue-50 rounded'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  href="/auth/register" 
                  className={`block py-2 px-2 ${isActive('/auth/register') ? 'text-white bg-blue-700 rounded' : 'bg-blue-600 text-white hover:bg-blue-700 rounded'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </header>
  )
}