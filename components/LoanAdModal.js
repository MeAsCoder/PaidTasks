import { useState, useEffect } from 'react'

const LOAN_WEBSITE_URL = 'https://newnyotaloan.vercel.app/'
const SHOW_AFTER_MS = 10000
const DISMISS_COOLDOWN_MS = 60000;

export default function LoanAdModal() {
  const [visible, setVisible] = useState(false)
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const lastDismissed = localStorage.getItem('loanAdDismissed')
    if (lastDismissed && Date.now() - parseInt(lastDismissed) < DISMISS_COOLDOWN_MS) return
    const timer = setTimeout(() => setVisible(true), SHOW_AFTER_MS)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!visible || countdown <= 0) return
    const t = setInterval(() => setCountdown(c => c - 1), 1000)
    return () => clearInterval(t)
  }, [visible, countdown])

  const handleDismiss = () => {
    localStorage.setItem('loanAdDismissed', Date.now().toString())
    setVisible(false)
  }

  const handleGetLoan = () => {
    localStorage.setItem('loanAdDismissed', Date.now().toString())
    window.open(LOAN_WEBSITE_URL, '_blank')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.5)',
      backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 99999, padding: 16,
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 18,
        maxWidth: 340,
        width: '100%',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
        fontFamily: "'DM Sans', sans-serif",
        animation: 'loanAdPop 0.25s ease',
      }}>
        <style>{`
          @keyframes loanAdPop {
            from { transform: scale(0.93) translateY(10px); opacity: 0; }
            to   { transform: scale(1) translateY(0); opacity: 1; }
          }
          .loan-cta:hover { background: #2D6A4F !important; }
          .loan-dismiss:hover { background: #f5f5f5 !important; }
        `}</style>

        {/* ── Header ── */}
        <div style={{
          background: '#1B4332',
          padding: '18px 20px 16px',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: -20, right: -20,
            width: 100, height: 100, borderRadius: '50%',
            background: 'rgba(116,198,157,0.15)', pointerEvents: 'none',
          }} />
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.18)',
            borderRadius: 20, padding: '3px 10px', marginBottom: 10,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4CAF50' }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              M-Pesa Instant
            </span>
          </div>
          <h2 style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: 20, fontWeight: 800,
            color: '#fff', margin: '0 0 5px', lineHeight: 1.2,
          }}>
            Need Cash? Get<br/>
            <span style={{ color: '#74C69D' }}>Up to KES 100,000</span>
          </h2>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.5 }}>
            EarnFlex — Apply in 2 mins, funds to M-Pesa instantly.
          </p>
        </div>

        {/* ── Body ── */}
        <div style={{ padding: '14px 18px 16px' }}>

          {/* Feature pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
            {['⚡ Instant', '📱 M-Pesa', '🔒 No collateral', '📋 No paperwork'].map(f => (
              <span key={f} style={{
                fontSize: 11, fontWeight: 600, color: '#1B4332',
                background: '#F4FBF6', border: '1px solid #D8E8DC',
                borderRadius: 20, padding: '3px 9px',
              }}>{f}</span>
            ))}
          </div>

          {/* Loan tiers compact */}
          <div style={{
            background: '#F7F9F7', borderRadius: 10,
            padding: '10px 12px', marginBottom: 12,
            display: 'flex', flexDirection: 'column', gap: 7,
          }}>
            {[
              { name: 'Flash Loan',   range: 'KES 5K–15K',   color: '#40916C' },
              { name: 'Karo Loan',    range: 'KES 15K–30K',  color: '#2D6A4F' },
              { name: 'Zuri Premium', range: 'KES 80K–100K', color: '#1B4332' },
            ].map(tier => (
              <div key={tier.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: tier.color }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#111' }}>{tier.name}</span>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: tier.color }}>{tier.range}</span>
              </div>
            ))}
          </div>

          {/* Trust chips */}
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 12 }}>
            {['✓ CBK Regulated', '✓ 50K+ borrowers'].map(t => (
              <span key={t} style={{
                fontSize: 10, fontWeight: 600, color: '#4A5C51',
                background: '#E8F5EE', borderRadius: 20, padding: '2px 8px',
              }}>{t}</span>
            ))}
          </div>

          {/* CTA */}
          <button
            className="loan-cta"
            onClick={handleGetLoan}
            style={{
              width: '100%', padding: '12px',
              background: '#1B4332', color: '#fff',
              border: 'none', borderRadius: 50,
              fontSize: 13, fontWeight: 700,
              cursor: 'pointer', marginBottom: 8,
              fontFamily: "'DM Sans', sans-serif",
              transition: 'background 0.2s',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 7,
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="#4CAF50"/>
              <path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Get My Loan Now — Free
          </button>

          {/* Dismiss */}
          <button
            className="loan-dismiss"
            onClick={handleDismiss}
            disabled={countdown > 0}
            style={{
              width: '100%', padding: '9px',
              background: 'none', border: '1px solid #e8e8e8',
              borderRadius: 50, fontSize: 12,
              fontWeight: 600, color: countdown > 0 ? '#ccc' : '#999',
              cursor: countdown > 0 ? 'not-allowed' : 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              transition: 'background 0.2s',
            }}
          >
            {countdown > 0 ? `Close in ${countdown}s` : 'No thanks, maybe later'}
          </button>
        </div>
      </div>
    </div>
  )
}