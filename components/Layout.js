import Head from 'next/head'
import Navbar from './Navbar'
import { motion } from 'framer-motion'
import Link from 'next/link'

const fadeIn = {
  hidden:   { opacity: 0, y: 8 },
  visible:  { opacity: 1, y: 0 }
}

export default function Layout({ children, title = "HandShake AI - Earn Money Online" }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fafafa', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }

        .layout-footer-link {
          color: #777;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          transition: color 0.18s;
        }
        .layout-footer-link:hover { color: #E8541A; }

        .layout-social-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1.5px solid rgba(232,84,26,0.2);
          color: #888;
          font-size: 12px;
          font-weight: 700;
          text-decoration: none;
          font-family: 'DM Sans', sans-serif;
          transition: background 0.18s, color 0.18s, border-color 0.18s;
        }
        .layout-social-link:hover {
          background: #E8541A;
          color: #fff;
          border-color: #E8541A;
        }
      `}</style>

      <Head>
        <title>{title}</title>
        <meta name="description" content="Complete AI tasks and earn money online — flexible work from anywhere." />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </Head>

      <Navbar />

      <motion.main
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        style={{ flexGrow: 1 }}
      >
        {children}
      </motion.main>

      {/* ── Footer ── */}
      <footer style={{
        background: 'linear-gradient(135deg, #fef3ee 0%, #fce8d8 30%, #e8f4fd 70%, #dbeeff 100%)',
        borderTop: '1px solid rgba(232,84,26,0.10)',
        padding: '64px 24px 36px',
        fontFamily: "'DM Sans', sans-serif",
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          {/* Top grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '40px 32px',
            marginBottom: 48,
          }}>

            {/* Brand column */}
            <div style={{ gridColumn: 'span 1' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 22, color: '#111', letterSpacing: '-0.5px' }}>Earn</span>
                <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 22, color: '#E8541A', letterSpacing: '-0.5px', fontStyle: 'italic' }}>Flex</span>
              </div>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.3em', color: '#E8541A', marginBottom: 14 }}>EARN · FLEX · GROW</p>
              <p style={{ fontSize: 14, color: '#888', lineHeight: 1.7, maxWidth: 220 }}>
                Your reliable platform to earn money by contributing to AI development — from anywhere in the world.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: '#111', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 18 }}>
                Quick Links
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'Tasks',        href: '/tasks'     },
                  { label: 'Dashboard',    href: '/dashboard' },
                  { label: 'About Us',     href: '/about'     },
                  { label: 'Contact',      href: '/contact'   },
                ].map(item => (
                  <li key={item.label}>
                    <Link href={item.href} className="layout-footer-link">{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: '#111', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 18 }}>
                Resources
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'FAQ',          href: '/faq'         },
                  { label: 'How It Works', href: '/#how'        },
                  { label: 'Blog',         href: '/blog'        },
                  { label: 'Support',      href: '/contact'     },
                ].map(item => (
                  <li key={item.label}>
                    <Link href={item.href} className="layout-footer-link">{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: '#111', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 18 }}>
                Legal
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'Terms of Service', href: '/terms'            },
                  { label: 'Privacy Policy',   href: '/legal-compliance' },
                  { label: 'Cookie Policy',    href: '/cookies'          },
                ].map(item => (
                  <li key={item.label}>
                    <Link href={item.href} className="layout-footer-link">{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Connect */}
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: '#111', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 18 }}>
                Connect
              </h4>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                {[
                  { label: 'FB',  href: '#' },
                  { label: 'TW',  href: '#' },
                  { label: 'IG',  href: '#' },
                  { label: 'LI',  href: '#' },
                ].map(s => (
                  <a key={s.label} href={s.href} className="layout-social-link">{s.label}</a>
                ))}
              </div>
              <p style={{ fontSize: 13, color: '#aaa' }}>
                Questions?{' '}
                <Link href="/contact" style={{ color: '#E8541A', fontWeight: 600, textDecoration: 'none' }}>
                  Get in touch →
                </Link>
              </p>
            </div>

          </div>

          {/* Trust strip */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: '10px 28px',
            justifyContent: 'center', marginBottom: 28,
            padding: '16px 0',
            borderTop: '1px solid rgba(232,84,26,0.10)',
            borderBottom: '1px solid rgba(232,84,26,0.10)',
          }}>
            {["🔒 SSL Encrypted", "✅ Verified Partners", "🌍 120+ Countries", "⚡ Instant Payouts", "🆓 Free to Join"].map((item, i) => (
              <span key={i} style={{ fontSize: 12, color: '#888', fontWeight: 600 }}>{item}</span>
            ))}
          </div>

          {/* Bottom bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <p style={{ fontSize: 13, color: '#bbb', margin: 0 }}>
              © {new Date().getFullYear()} HandShake AI. All rights reserved.
            </p>
            <div style={{ display: 'flex', gap: 20 }}>
              {[
                { label: 'Terms', href: '/terms' },
                { label: 'Privacy', href: '/legal-compliance' },
              ].map(item => (
                <Link key={item.label} href={item.href} className="layout-footer-link" style={{ fontSize: 13 }}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

        </div>
      </footer>
    </div>
  )
}
