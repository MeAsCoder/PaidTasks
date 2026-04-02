import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import Image from 'next/image'

export default function Navbar() {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { currentUser, loading, logout } = useAuth()

  const isActive = (href) => router.pathname === href

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinkStyle = (href) => ({
    color: isActive(href) ? '#E8541A' : '#444',
    textDecoration: 'none',
    fontSize: 15,
    fontWeight: 500,
    padding: '6px 0',
    borderBottom: isActive(href) ? '2px solid #E8541A' : '2px solid transparent',
    transition: 'color 0.2s',
    fontFamily: "'DM Sans', sans-serif",
  })

  if (loading) {
    return (
      <header style={headerStyle(false)}>
        <div style={containerStyle}>
          <LogoMark />
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#f0f0f0', animation: 'pulse 1s infinite' }} />
        </div>
      </header>
    )
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        .nav-link:hover { color: #E8541A !important; }
        .login-btn:hover { background: #f5f5f5 !important; }
        .cta-btn:hover { background: #c94412 !important; }
        @media (max-width: 768px) {
          .desktop-nav, .desktop-cta { display: none !important; }
          .mobile-toggle { display: flex !important; }
        }
        @media (min-width: 769px) {
          .mobile-toggle { display: none !important; }
        }
      `}</style>

      <header style={headerStyle(scrolled)}>
        <div style={containerStyle}>

          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 0 }}>
            <LogoMark />
          </Link>

          {/* Desktop Navigation */}
          <nav className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 36, fontFamily: "'DM Sans', sans-serif" }}>
            <Link href="/" className="nav-link" style={navLinkStyle('/')}>Home</Link>

            {currentUser ? (
              <>
                <Link href="/dashboard" className="nav-link" style={navLinkStyle('/dashboard')}>Dashboard</Link>
                <Link href="/tasks" className="nav-link" style={navLinkStyle('/tasks')}>Tasks</Link>
                <Link href="/profile" className="nav-link" style={navLinkStyle('/profile')}>Profile</Link>
              </>
            ) : (
              <>
                <Link href="/about" className="nav-link" style={navLinkStyle('/about')}>About Us</Link>
                <Link href="/tasks" className="nav-link" style={navLinkStyle('/tasks')}>Opportunities</Link>
                <Link href="/contact" className="nav-link" style={navLinkStyle('/contact')}>FAQ</Link>
              </>
            )}
          </nav>

          {/* Desktop CTA */}
          <div className="desktop-cta" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {currentUser ? (
              <button
                onClick={() => logout()}
                style={{ padding: '9px 22px', borderRadius: 50, border: 'none', background: 'none', color: '#cc3300', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
              >
                Logout
              </button>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="login-btn"
                  style={{ padding: '9px 22px', borderRadius: 50, border: '1.5px solid #222', color: '#222', fontSize: 14, fontWeight: 600, textDecoration: 'none', fontFamily: "'DM Sans', sans-serif", transition: 'background 0.2s' }}
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="cta-btn"
                  style={{ padding: '9px 22px', borderRadius: 50, background: '#E8541A', color: '#fff', fontSize: 14, fontWeight: 700, textDecoration: 'none', fontFamily: "'DM Sans', sans-serif", transition: 'background 0.2s' }}
                >
                  View Opportunities
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#222', padding: 4, alignItems: 'center' }}
            aria-label="Toggle menu"
          >
            <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {mobileMenuOpen
                ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                : <><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></>
              }
            </svg>
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div style={{ background: '#fff', borderTop: '1px solid #f0f0f0', padding: '20px 24px 28px', display: 'flex', flexDirection: 'column', gap: 4, fontFamily: "'DM Sans', sans-serif" }}>
            <MobileLink href="/" label="Home" isActive={isActive('/')} onClick={() => setMobileMenuOpen(false)} />

            {currentUser ? (
              <>
                <MobileLink href="/dashboard" label="Dashboard" isActive={isActive('/dashboard')} onClick={() => setMobileMenuOpen(false)} />
                <MobileLink href="/tasks" label="Tasks" isActive={isActive('/tasks')} onClick={() => setMobileMenuOpen(false)} />
                <MobileLink href="/profile" label="Profile" isActive={isActive('/profile')} onClick={() => setMobileMenuOpen(false)} />
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false) }}
                  style={{ textAlign: 'left', padding: '12px 16px', borderRadius: 10, background: 'none', border: 'none', color: '#cc3300', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <MobileLink href="/about" label="About Us" isActive={isActive('/about')} onClick={() => setMobileMenuOpen(false)} />
                <MobileLink href="/tasks" label="Opportunities" isActive={isActive('/tasks')} onClick={() => setMobileMenuOpen(false)} />
                <MobileLink href="/contact" label="FAQ" isActive={isActive('/contact')} onClick={() => setMobileMenuOpen(false)} />
                <div style={{ display: 'flex', gap: 12, marginTop: 16, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
                  <Link
                    href="/auth/login"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ flex: 1, textAlign: 'center', padding: '11px', borderRadius: 50, border: '1.5px solid #222', color: '#222', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/register"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ flex: 1, textAlign: 'center', padding: '11px', borderRadius: 50, background: '#E8541A', color: '#fff', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}
                  >
                    Sign Up
                  </Link>
                </div>
              </>
            )}
          </div>
        )}
      </header>
    </>
  )
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function LogoMark() {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <Image
        src="/favcon.png"
        alt="EarnFlex Logo"
        width={40}
        height={40}
        priority
      />
    </div>
  )
}

function MobileLink({ href, label, isActive, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      style={{
        display: 'block',
        padding: '12px 16px',
        borderRadius: 10,
        background: isActive ? '#fef3ee' : 'transparent',
        color: isActive ? '#E8541A' : '#333',
        fontSize: 15,
        fontWeight: isActive ? 700 : 500,
        textDecoration: 'none',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {label}
    </Link>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const headerStyle = (scrolled) => ({
  position: 'sticky',
  top: 0,
  zIndex: 100,
  background: 'rgba(255,255,255,0.97)',
  backdropFilter: 'blur(12px)',
  boxShadow: scrolled ? '0 1px 20px rgba(0,0,0,0.08)' : '0 1px 0 #f0f0f0',
  transition: 'box-shadow 0.3s',
  fontFamily: "'DM Sans', sans-serif",
})

const containerStyle = {
  maxWidth: 1200,
  margin: '0 auto',
  padding: '0 24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  height: 68,
}
