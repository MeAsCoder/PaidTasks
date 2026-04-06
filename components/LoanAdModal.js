import { useState, useEffect } from 'react'

const LOAN_WEBSITE_URL = 'https://newnyotaloan.vercel.app/'
const SHOW_AFTER_MS = 10000      // show after 10 seconds
const DISMISS_COOLDOWN_MS = 10 // don't show again for 5 minutes after dismiss

export default function LoanAdModal() {
  const [visible, setVisible] = useState(false)
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    // Check if user recently dismissed
    const lastDismissed = localStorage.getItem('loanAdDismissed')
    if (lastDismissed && Date.now() - parseInt(lastDismissed) < DISMISS_COOLDOWN_MS) return

    const timer = setTimeout(() => setVisible(true), SHOW_AFTER_MS)
    return () => clearTimeout(timer)
  }, [])

  // Countdown timer on the close button
  useEffect(() => {
    if (!visible) return
    if (countdown <= 0) return
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
      background: 'rgba(0,0,0,0.55)',
      backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 99999, padding: 20,
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 24,
        maxWidth: 420,
        width: '100%',
        overflow: 'hidden',
        boxShadow: '0 32px 80px rgba(0,0,0,0.2)',
        fontFamily: "'DM Sans', sans-serif",
        animation: 'loanAdPop 0.3s ease',
      }}>
        <style>{`
          @keyframes loanAdPop {
            from { transform: scale(0.92) translateY(12px); opacity: 0; }
            to   { transform: scale(1) translateY(0); opacity: 1; }
          }
          .loan-ad-cta:hover { background: #c94412 !important; transform: translateY(-1px); }
          .loan-ad-dismiss:hover { background: #f5f5f5 !important; }
        `}</style>

        {/* ── Header banner ── */}
        <div style={{
          background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 60%, #40916C 100%)',
          padding: '28px 28px 24px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Decorative circle */}
          <div style={{
            position: 'absolute', top: -30, right: -30,
            width: 140, height: 140, borderRadius: '50%',
            background: 'rgba(116,198,157,0.15)',
            pointerEvents: 'none',
          }} />

          {/* M-Pesa badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 20, padding: '4px 12px',
            marginBottom: 14,
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4CAF50' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.9)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              M-Pesa Instant Disbursement
            </span>
          </div>

          <h2 style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: 26, fontWeight: 800,
            color: '#fff', margin: '0 0 8px',
            lineHeight: 1.15, letterSpacing: '-0.5px',
          }}>
            Need Cash Fast?<br/>
            <span style={{ color: '#74C69D' }}>Get Up to KES 100,000</span>
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.5 }}>
            ZuriCredit — Kenya&apos;s trusted instant lender. Apply in 2 minutes, receive funds directly on M-Pesa.
          </p>
        </div>

        {/* ── Body ── */}
        <div style={{ padding: '22px 28px 24px' }}>

          {/* Feature pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {[
              { icon: '⚡', label: 'Instant approval' },
              { icon: '📱', label: 'M-Pesa payout' },
              { icon: '🔒', label: 'No collateral' },
              { icon: '📋', label: 'No paperwork' },
            ].map(f => (
              <div key={f.label} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: '#F4FBF6', border: '1px solid #D8E8DC',
                borderRadius: 20, padding: '5px 12px',
              }}>
                <span style={{ fontSize: 13 }}>{f.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#1B4332' }}>{f.label}</span>
              </div>
            ))}
          </div>

          {/* Loan tiers */}
          <div style={{
            background: '#F7F9F7', borderRadius: 14,
            padding: '14px 16px', marginBottom: 20,
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            {[
              { name: 'Flash Loan',   range: 'KES 5,000 – 15,000',  period: '7–14 days',   color: '#40916C' },
              { name: 'Karo Loan',    range: 'KES 15,000 – 30,000', period: '1–2 months',  color: '#2D6A4F' },
              { name: 'Zuri Premium', range: 'KES 80,000 – 100,000',period: '6–12 months', color: '#1B4332' },
            ].map(tier => (
              <div key={tier.name} style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: tier.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{tier.name}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: tier.color }}>{tier.range}</div>
                  <div style={{ fontSize: 11, color: '#888' }}>{tier.period}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Trust row */}
          <div style={{
            display: 'flex', gap: 6, flexWrap: 'wrap',
            marginBottom: 20,
          }}>
            {['✓ CBK Regulated', '✓ CRB Compliant', '✓ 50,000+ borrowers'].map(t => (
              <span key={t} style={{
                fontSize: 11, fontWeight: 600,
                color: '#4A5C51', background: '#E8F5EE',
                borderRadius: 20, padding: '3px 10px',
              }}>{t}</span>
            ))}
          </div>

          {/* CTA button */}
          <button
            className="loan-ad-cta"
            onClick={handleGetLoan}
            style={{
              width: '100%', padding: '15px',
              background: '#1B4332', color: '#fff',
              border: 'none', borderRadius: 50,
              fontSize: 15, fontWeight: 700,
              cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              transition: 'background 0.2s, transform 0.15s',
              marginBottom: 10,
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 8,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="#4CAF50"/>
              <path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Get My Loan Now — It&apos;s Free
          </button>

          {/* Dismiss */}
          <button
            className="loan-ad-dismiss"
            onClick={handleDismiss}
            disabled={countdown > 0}
            style={{
              width: '100%', padding: '11px',
              background: 'none', border: '1.5px solid #e8e8e8',
              borderRadius: 50, fontSize: 13,
              fontWeight: 600, color: countdown > 0 ? '#bbb' : '#888',
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