import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'

export default function Navbar() {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { currentUser, loading, logout } = useAuth()

  const isActive = (href) => router.pathname === href

  if (loading) {
    return (
      <header className="sticky top-0 z-50 bg-gradient-to-r from-blue-900 to-blue-800 shadow-lg">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex flex-col items-start gap-0.5 select-none">
            <div className="flex items-center gap-0.5">
              <span className="px-3 py-1.5 bg-white/15 rounded-lg text-white text-xl font-black tracking-widest">EARN</span>
              <span className="px-3 py-1.5 bg-emerald-400 rounded-lg text-emerald-950 text-xl font-black tracking-widest italic">FLEX</span>
            </div>
            <span className="text-[10px] tracking-[0.3em] text-blue-300 pl-1">EARN · FLEX · GROW</span>
          </div>
          <div className="animate-pulse bg-white/20 h-8 w-8 rounded-full"></div>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-blue-900 to-blue-800 shadow-lg">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">

        {/* Logo */}
        <Link href="/" className="flex flex-col items-start select-none gap-0.5">
          <div className="flex items-center gap-0.5">
            <span className="px-3 py-1.5 bg-white/15 border border-white/20 rounded-lg text-white text-xl font-black tracking-widest">
              EARN
            </span>
            <span className="px-3 py-1.5 bg-emerald-400 rounded-lg text-emerald-950 text-xl font-black tracking-widest italic">
              FLEX
            </span>
          </div>
          <span className="text-[10px] tracking-[0.3em] text-blue-300 pl-1">
            EARN · FLEX · GROW
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="/"
            className={`py-2 text-sm font-medium transition ${isActive('/') ? 'text-white border-b-2 border-emerald-400' : 'text-blue-200 hover:text-white'}`}
          >
            Home
          </Link>

          {currentUser ? (
            <>
              <Link
                href="/dashboard"
                className={`py-2 text-sm font-medium transition ${isActive('/dashboard') ? 'text-white border-b-2 border-emerald-400' : 'text-blue-200 hover:text-white'}`}
              >
                Dashboard
              </Link>
              <Link
                href="/tasks"
                className={`py-2 text-sm font-medium transition ${isActive('/tasks') ? 'text-white border-b-2 border-emerald-400' : 'text-blue-200 hover:text-white'}`}
              >
                Tasks
              </Link>
              <Link
                href="/profile"
                className={`py-2 text-sm font-medium transition ${isActive('/profile') ? 'text-white border-b-2 border-emerald-400' : 'text-blue-200 hover:text-white'}`}
              >
                Profile
              </Link>
              <button
                onClick={() => logout()}
                className="py-2 text-sm font-medium text-red-300 hover:text-red-200 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/about"
                className={`py-2 text-sm font-medium transition ${isActive('/about') ? 'text-white border-b-2 border-emerald-400' : 'text-blue-200 hover:text-white'}`}
              >
                About
              </Link>
              <Link
                href="/contact"
                className={`py-2 text-sm font-medium transition ${isActive('/contact') ? 'text-white border-b-2 border-emerald-400' : 'text-blue-200 hover:text-white'}`}
              >
                Contact
              </Link>
              <Link
                href="/auth/login"
                className={`py-2 text-sm font-medium transition ${isActive('/auth/login') ? 'text-white border-b-2 border-emerald-400' : 'text-blue-200 hover:text-white'}`}
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className="bg-emerald-400 hover:bg-emerald-300 text-emerald-950 text-sm font-bold px-4 py-2 rounded-lg transition"
              >
                Register
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-blue-900 border-t border-white/10 pb-4 px-4 space-y-1">
          <Link
            href="/"
            className={`block py-2 px-3 rounded text-sm font-medium ${isActive('/') ? 'text-white bg-white/10' : 'text-blue-200 hover:text-white hover:bg-white/10'}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>

          {currentUser ? (
            <>
              <Link href="/dashboard" className={`block py-2 px-3 rounded text-sm font-medium ${isActive('/dashboard') ? 'text-white bg-white/10' : 'text-blue-200 hover:text-white hover:bg-white/10'}`} onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
              <Link href="/tasks" className={`block py-2 px-3 rounded text-sm font-medium ${isActive('/tasks') ? 'text-white bg-white/10' : 'text-blue-200 hover:text-white hover:bg-white/10'}`} onClick={() => setMobileMenuOpen(false)}>Tasks</Link>
              <Link href="/profile" className={`block py-2 px-3 rounded text-sm font-medium ${isActive('/profile') ? 'text-white bg-white/10' : 'text-blue-200 hover:text-white hover:bg-white/10'}`} onClick={() => setMobileMenuOpen(false)}>Profile</Link>
              <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="block w-full text-left py-2 px-3 text-sm font-medium text-red-300 hover:bg-white/10 rounded">Logout</button>
            </>
          ) : (
            <>
              <Link href="/about" className={`block py-2 px-3 rounded text-sm font-medium ${isActive('/about') ? 'text-white bg-white/10' : 'text-blue-200 hover:text-white hover:bg-white/10'}`} onClick={() => setMobileMenuOpen(false)}>About</Link>
              <Link href="/contact" className={`block py-2 px-3 rounded text-sm font-medium ${isActive('/contact') ? 'text-white bg-white/10' : 'text-blue-200 hover:text-white hover:bg-white/10'}`} onClick={() => setMobileMenuOpen(false)}>Contact</Link>
              <div className="pt-2 border-t border-white/10 mt-2 space-y-1">
                <Link href="/auth/login" className={`block py-2 px-3 rounded text-sm font-medium ${isActive('/auth/login') ? 'text-white bg-white/10' : 'text-blue-200 hover:text-white hover:bg-white/10'}`} onClick={() => setMobileMenuOpen(false)}>Login</Link>
                <Link href="/auth/register" className="block py-2 px-3 rounded text-sm font-bold bg-emerald-400 text-emerald-950 hover:bg-emerald-300" onClick={() => setMobileMenuOpen(false)}>Register</Link>
              </div>
            </>
          )}
        </div>
      )}
    </header>
  )
}
