/**
 * pages/subscription.jsx
 *
 * Subscription plans page with PayHero M-Pesa STK Push integration.
 * Flow:
 *   1. User selects a plan → modal opens
 *   2. User enters phone number → STK push sent → spinner while waiting
 *   3. User pastes M-Pesa SMS confirmation
 *   4. We cross-check SMS against PayHero transaction result
 *   5. On success → Firebase subscription updated → redirect to /tasks
 */

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, set, update } from 'firebase/database';
import Layout from '../components/Layout';
import { FiCheck, FiX, FiZap, FiAward, FiArrowRight, FiPhone, FiLoader, FiCheckCircle, FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import payHeroService, {
  usdToKes,
  formatKes,
  USD_TO_KES_RATE,
  TXN_STATUS,
} from '../services/PayHeroService';

// ─── Plan Data ────────────────────────────────────────────────────────────────
const PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    priceUsd: 0.5,
    icon: '🌱',
    tagline: 'Perfect to get started',
    features: [
      'Access to basic surveys',
      '3 tasks per day',
      'Standard support',
      'KSh 50 per survey',
    ],
    popular: false,
    color: '#0891B2',
    colorLight: 'rgba(8,145,178,0.10)',
    colorBorder: 'rgba(8,145,178,0.25)',
  },
  {
    id: 'silver',
    name: 'Silver',
    priceUsd: 10,
    icon: '⚡',
    tagline: 'More tasks, more earnings',
    features: [
      'Access to premium surveys',
      '5 tasks per day',
      'Priority support',
      'KSh 100 per survey',
      'Weekly bonus tasks',
    ],
    popular: false,
    color: '#7C3AED',
    colorLight: 'rgba(124,58,237,0.10)',
    colorBorder: 'rgba(124,58,237,0.25)',
  },
  {
    id: 'gold',
    name: 'Gold',
    priceUsd: 20,
    icon: '🏆',
    tagline: 'Maximum earning potential',
    features: [
      'Access to all surveys & AI tasks',
      '10 tasks per day',
      '24/7 priority support',
      'KSh 150 per survey',
      'Weekly bonus tasks',
      'Early access to new features',
    ],
    popular: true,
    color: '#E8541A',
    colorLight: 'rgba(232,84,26,0.10)',
    colorBorder: 'rgba(232,84,26,0.30)',
  },
];

// ─── Modal Step Enum ──────────────────────────────────────────────────────────
const STEP = {
  PHONE:      'PHONE',       // enter phone number
  WAITING:    'WAITING',     // STK push sent, waiting for payment
  CONFIRM:    'CONFIRM',     // paste M-Pesa SMS to verify
  SUCCESS:    'SUCCESS',     // payment confirmed
  FAILED:     'FAILED',      // payment failed
};

// ─── Utility ──────────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ─── Payment Modal ────────────────────────────────────────────────────────────
function PurchaseModal({ plan, user, onClose, onSuccess }) {
  const [step, setStep]               = useState(STEP.PHONE);
  const [phone, setPhone]             = useState('');
  const [phoneError, setPhoneError]   = useState('');
  const [mpesaMsg, setMpesaMsg]       = useState('');
  const [msgError, setMsgError]       = useState('');
  const [isSending, setIsSending]     = useState(false);  // STK push in progress
  const [isVerifying, setIsVerifying] = useState(false);  // SMS verify in progress
  const [reference, setReference]     = useState('');
  const [txnResult, setTxnResult]     = useState(null);
  const [amountKes, setAmountKes]     = useState(0);
  const [waitDots, setWaitDots]       = useState('');
  const dotsRef = useRef(null);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  // Animated dots for waiting state
  useEffect(() => {
    if (step === STEP.WAITING) {
      dotsRef.current = setInterval(() => {
        setWaitDots(d => d.length >= 3 ? '' : d + '.');
      }, 500);
    }
    return () => clearInterval(dotsRef.current);
  }, [step]);

  const priceKes = usdToKes(plan.priceUsd);

  // ── Step 1: Send STK push ─────────────────────────────────────────────────
  const handleSendStk = async () => {
    setPhoneError('');
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 9 || digits.length > 12) {
      setPhoneError('Please enter a valid Kenyan phone number (e.g. 0712 345 678)');
      return;
    }

    setIsSending(true);
    try {
      // Store payment index in Firebase so callback can find userId
      const db = getDatabase();
      const ref_ = `EF-${user.uid.slice(0, 8)}-${plan.id}-${Date.now()}`;
      await set(ref(db, `paymentIndex/${ref_.replace(/\//g, '_')}`), {
        userId:    user.uid,
        planId:    plan.id,
        phone:     digits,
        amountKes: priceKes,
        createdAt: Date.now(),
        status:    'PENDING',
      });

      const result = await payHeroService.sendStkPush({
        phone,
        amountUsd: plan.priceUsd,
        userId:    user.uid,
        planId:    plan.id,
        planName:  plan.name,
      });

      setReference(result.reference);
      setAmountKes(result.amountKes);
      // ⚠️ Reset isSending BEFORE changing step so the next step starts clean
      setIsSending(false);
      setStep(STEP.WAITING);

      // Poll Firebase in background — when callback arrives, move to CONFIRM
      try {
        const txn = await payHeroService.waitForPayment(result.reference);
        setTxnResult(txn);
        if (txn.status === TXN_STATUS.SUCCESS) {
          setStep(STEP.CONFIRM);
        } else {
          setStep(STEP.FAILED);
        }
      } catch {
        // Polling timed out — still show CONFIRM so user can paste SMS
        setStep(STEP.CONFIRM);
      }

    } catch (err) {
      setIsSending(false);
      toast.error(err.message || 'Failed to send payment request. Please try again.');
    }
  };

  // ── Step 2: Verify pasted SMS — only runs when user clicks the button ───────
  const handleVerify = async () => {
    setMsgError('');
    if (!mpesaMsg.trim()) {
      setMsgError('Please paste your M-Pesa confirmation message.');
      return;
    }

    setIsVerifying(true);
    try {
      const { valid, reason, transactionResult } = await payHeroService.verifyWithLiveCheck(
        mpesaMsg,
        { reference, amountKes: amountKes || priceKes }
      );

      if (!valid) {
        setMsgError(reason);
        return;
      }

      // All checks passed — activate subscription in Firebase
      const db = getDatabase();
      await update(ref(db, `users/${user.uid}`), {
        subscription: {
          plan:        plan.id,
          activatedAt: Date.now(),
          status:      'active',
          isActivated: true,
          receipt:     transactionResult?.providerReference || transactionResult?.thirdPartyReference || '',
          reference,
        },
      });

      setStep(STEP.SUCCESS);
      onSuccess(plan);

    } catch (err) {
      setMsgError(err.message || 'Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  // ── Retry ────────────────────────────────────────────────────────────────
  const handleRetry = () => {
    setStep(STEP.PHONE);
    setReference('');
    setTxnResult(null);
    setMpesaMsg('');
    setMsgError('');
  };

  return (
    <div
      onClick={e => e.target === e.currentTarget && step !== STEP.WAITING && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 22, width: '100%', maxWidth: 460,
          maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
          boxShadow: '0 40px 100px rgba(0,0,0,0.28)',
        }}
      >
        {/* ── Modal Header ── */}
        <div style={{ padding: '22px 24px 18px', borderBottom: '1px solid #f5f5f5', position: 'relative', flexShrink: 0 }}>
          {step !== STEP.WAITING && step !== STEP.SUCCESS && (
            <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', padding: 4 }}>
              <FiX size={20} />
            </button>
          )}

          {/* Plan badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: plan.colorLight, border: `1.5px solid ${plan.colorBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
              {plan.icon}
            </div>
            <div>
              <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 17, fontWeight: 800, color: '#111', margin: 0, lineHeight: 1 }}>
                Purchase {plan.name} Plan
              </h3>
              <p style={{ fontSize: 12, color: '#aaa', margin: '3px 0 0' }}>{plan.tagline}</p>
            </div>
          </div>

          {/* Exchange rate + price conversion */}
          <div style={{ background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11, color: '#bbb', fontWeight: 600, letterSpacing: '0.05em' }}>EXCHANGE RATE</span>
              <span style={{ fontSize: 12, color: '#777', fontWeight: 600 }}>$1 = KSh {USD_TO_KES_RATE.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontSize: 13, color: '#aaa', textDecoration: 'line-through' }}>${plan.priceUsd}</span>
              <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 800, color: plan.color }}>
                {formatKes(priceKes)}
              </span>
            </div>
          </div>
        </div>

        {/* ── Modal Body ── */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '20px 24px' }}>

          {/* ─ STEP: PHONE ─ */}
          {step === STEP.PHONE && (
            <div>
              <p style={{ fontSize: 14, color: '#666', marginBottom: 20, lineHeight: 1.6 }}>
                Enter your M-Pesa registered phone number. We&apos;ll send an STK push prompt directly to your phone.
              </p>

              {/* Refund notice */}
              <div style={{ background: '#fff7ed', border: '1px solid rgba(232,84,26,0.18)', borderRadius: 12, padding: '12px 14px', marginBottom: 20, display: 'flex', gap: 10 }}>
                <FiAward size={16} color="#E8541A" style={{ flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 12, color: '#92400e', margin: 0, lineHeight: 1.55 }}>
                  <strong>Refundable Activation Fee.</strong> {formatKes(priceKes)} is credited back upon your first successful withdrawal.
                </p>
              </div>

              {/* Phone input */}
              <div style={{ marginBottom: 6 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#888', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 }}>
                  M-Pesa Phone Number
                </label>
                <div style={{ display: 'flex', border: `1.5px solid ${phoneError ? '#E8541A' : '#e8e8e8'}`, borderRadius: 12, overflow: 'hidden', background: '#fafafa', transition: 'border-color 0.2s' }}>
                  <div style={{ padding: '12px 14px', background: '#f5f5f5', borderRight: '1px solid #e8e8e8', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    <span style={{ fontSize: 16 }}>🇰🇪</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#555' }}>+254</span>
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => { setPhone(e.target.value); setPhoneError(''); }}
                    placeholder="712 345 678"
                    style={{ flex: 1, padding: '12px 14px', border: 'none', background: 'transparent', fontSize: 15, color: '#111', outline: 'none', fontFamily: "'DM Sans', sans-serif", fontWeight: 600, letterSpacing: '0.05em' }}
                    onKeyDown={e => e.key === 'Enter' && handleSendStk()}
                  />
                </div>
                {phoneError && <p style={{ fontSize: 12, color: '#E8541A', marginTop: 6, fontWeight: 500 }}>{phoneError}</p>}
              </div>

              {/* What happens next */}
              <div style={{ background: 'rgba(5,150,105,0.05)', border: '1px solid rgba(5,150,105,0.18)', borderRadius: 12, padding: '12px 14px', marginTop: 18 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#059669', letterSpacing: '0.07em', textTransform: 'uppercase', margin: '0 0 8px' }}>What happens next</p>
                {[
                  `You'll receive an M-Pesa STK push for ${formatKes(priceKes)}`,
                  'Enter your M-Pesa PIN to complete payment',
                  'Paste the confirmation SMS to activate your plan',
                ].map((txt, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: i < 2 ? 6 : 0 }}>
                    <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#059669', color: '#fff', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
                    <span style={{ fontSize: 13, color: '#065f46', lineHeight: 1.4 }}>{txt}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─ STEP: WAITING ─ */}
          {step === STEP.WAITING && (
            <div style={{ textAlign: 'center', padding: '20px 0 10px' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: plan.colorLight, border: `2px solid ${plan.colorBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <div style={{ width: 36, height: 36, border: `3px solid ${plan.color}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />
              </div>
              <h4 style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 800, color: '#111', marginBottom: 8 }}>
                Check your phone{waitDots}
              </h4>
              <p style={{ fontSize: 14, color: '#777', lineHeight: 1.7, maxWidth: 320, margin: '0 auto 20px' }}>
                We&apos;ve sent an M-Pesa prompt to <strong style={{ color: '#111' }}>{phone}</strong>. Enter your PIN to pay <strong style={{ color: plan.color }}>{formatKes(priceKes)}</strong>.
              </p>
              <div style={{ background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: 12, padding: '12px 16px', textAlign: 'left' }}>
                {[
                  '📱 Open the M-Pesa STK prompt on your phone',
                  '🔐 Enter your M-Pesa PIN',
                  '✅ Come back here once you receive the confirmation SMS',
                ].map((tip, i) => (
                  <p key={i} style={{ fontSize: 13, color: '#666', margin: i < 2 ? '0 0 8px' : 0, lineHeight: 1.5 }}>{tip}</p>
                ))}
              </div>

              <button
                onClick={() => setStep(STEP.CONFIRM)}
                style={{ marginTop: 20, background: 'none', border: 'none', fontSize: 13, color: '#aaa', cursor: 'pointer', textDecoration: 'underline', fontFamily: "'DM Sans', sans-serif" }}
              >
                I&apos;ve already paid — paste my confirmation
              </button>
            </div>
          )}

          {/* ─ STEP: CONFIRM (paste SMS) ─ */}
          {step === STEP.CONFIRM && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, padding: '10px 14px', background: 'rgba(5,150,105,0.06)', border: '1px solid rgba(5,150,105,0.2)', borderRadius: 10 }}>
                <FiCheckCircle size={16} color="#059669" style={{ flexShrink: 0 }} />
                <p style={{ fontSize: 13, color: '#065f46', margin: 0, fontWeight: 600 }}>
                  Payment received! Please paste your M-Pesa SMS to confirm.
                </p>
              </div>

              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#888', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 }}>
                M-Pesa Confirmation Message
              </label>
              <textarea
                rows={4}
                value={mpesaMsg}
                onChange={e => { setMpesaMsg(e.target.value); setMsgError(''); }}
                placeholder={`Paste the SMS you received after paying ${formatKes(priceKes)}…\n\nExample: "Confirmed. You have sent KSh ${priceKes.toLocaleString()} to EarnFlex. Ref: QHX4K9L..."`}
                style={{
                  width: '100%', padding: '12px 14px',
                  border: `1.5px solid ${msgError ? '#E8541A' : '#e8e8e8'}`,
                  borderRadius: 12, fontSize: 13, color: '#111',
                  background: '#fafafa', outline: 'none', resize: 'vertical',
                  fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6,
                  boxSizing: 'border-box', transition: 'border-color 0.2s',
                }}
                onFocus={e => { if (!msgError) e.target.style.borderColor = plan.color; }}
                onBlur={e => { if (!msgError) e.target.style.borderColor = '#e8e8e8'; }}
              />
              {msgError && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginTop: 8, padding: '8px 12px', background: '#fff7ed', border: '1px solid rgba(232,84,26,0.2)', borderRadius: 8 }}>
                  <FiAlertTriangle size={14} color="#E8541A" style={{ flexShrink: 0, marginTop: 1 }} />
                  <p style={{ fontSize: 12, color: '#92400e', margin: 0, lineHeight: 1.5 }}>{msgError}</p>
                </div>
              )}

              <p style={{ fontSize: 11, color: '#bbb', marginTop: 8, lineHeight: 1.5 }}>
                We verify the transaction code, amount ({formatKes(priceKes)}), and payment time against PayHero records to confirm authenticity.
              </p>
            </div>
          )}

          {/* ─ STEP: SUCCESS ─ */}
          {step === STEP.SUCCESS && (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(5,150,105,0.1)', border: '2px solid rgba(5,150,105,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
                <FiCheckCircle size={32} color="#059669" />
              </div>
              <h4 style={{ fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 800, color: '#111', marginBottom: 8 }}>
                You&apos;re all set! 🎉
              </h4>
              <p style={{ fontSize: 14, color: '#777', lineHeight: 1.7, maxWidth: 300, margin: '0 auto' }}>
                <strong style={{ color: plan.color }}>{plan.name} Plan</strong> activated. Redirecting to your tasks…
              </p>
              <div style={{ marginTop: 16, width: 200, height: 4, background: '#f0f0f0', borderRadius: 4, margin: '16px auto 0', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '100%', background: `linear-gradient(90deg, ${plan.color}, #fb923c)`, animation: 'fillBar 2s linear forwards', borderRadius: 4 }} />
              </div>
            </div>
          )}

          {/* ─ STEP: FAILED ─ */}
          {step === STEP.FAILED && (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#fff7ed', border: '2px solid rgba(232,84,26,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
                <FiX size={30} color="#E8541A" />
              </div>
              <h4 style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 800, color: '#111', marginBottom: 8 }}>
                Payment not completed
              </h4>
              <p style={{ fontSize: 14, color: '#777', lineHeight: 1.7, maxWidth: 300, margin: '0 auto 4px' }}>
                The STK push was cancelled or timed out. No amount was deducted. Please try again.
              </p>
            </div>
          )}

        </div>

        {/* ── Modal Footer ── */}
        <div style={{ padding: '14px 24px 20px', borderTop: '1px solid #f5f5f5', flexShrink: 0 }}>

          {step === STEP.PHONE && (
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={onClose} style={{ flex: '0 0 auto', padding: '12px 20px', borderRadius: 50, border: '1.5px solid #e8e8e8', background: 'none', fontSize: 13, fontWeight: 600, color: '#777', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                Cancel
              </button>
              <button
                onClick={handleSendStk}
                disabled={isSending}
                style={{
                  flex: 1, padding: '12px', borderRadius: 50,
                  background: isSending ? '#ccc' : plan.color,
                  border: 'none', color: '#fff', fontSize: 14, fontWeight: 700,
                  cursor: isSending ? 'not-allowed' : 'pointer',
                  fontFamily: "'DM Sans', sans-serif",
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'background 0.2s',
                  boxShadow: isSending ? 'none' : `0 4px 16px ${plan.colorLight}`,
                }}
              >
                {isSending ? (
                  <><div style={{ width: 14, height: 14, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Sending…</>
                ) : (
                  <><FiPhone size={14} /> Send M-Pesa Request</>
                )}
              </button>
            </div>
          )}

          {step === STEP.WAITING && (
            <p style={{ textAlign: 'center', fontSize: 12, color: '#bbb', margin: 0 }}>
              Please complete payment on your phone to continue
            </p>
          )}

          {step === STEP.CONFIRM && (
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setStep(STEP.PHONE)}
                disabled={isVerifying}
                style={{ flex: '0 0 auto', padding: '12px 20px', borderRadius: 50, border: '1.5px solid #e8e8e8', background: 'none', fontSize: 13, fontWeight: 600, color: isVerifying ? '#ccc' : '#777', cursor: isVerifying ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans', sans-serif" }}
              >
                Back
              </button>
              <button
                onClick={handleVerify}
                disabled={isVerifying || !mpesaMsg.trim()}
                style={{
                  flex: 1, padding: '12px', borderRadius: 50,
                  // Three visual states:
                  //   1. No message pasted → grey, disabled
                  //   2. Message pasted, idle → plan color, clickable
                  //   3. Verifying in progress → grey with spinner
                  background: isVerifying
                    ? '#aaa'
                    : !mpesaMsg.trim()
                      ? '#e0e0e0'
                      : plan.color,
                  border: 'none', color: '#fff', fontSize: 14, fontWeight: 700,
                  cursor: isVerifying || !mpesaMsg.trim() ? 'not-allowed' : 'pointer',
                  fontFamily: "'DM Sans', sans-serif",
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'background 0.2s',
                  boxShadow: !isVerifying && mpesaMsg.trim() ? `0 4px 16px ${plan.colorLight}` : 'none',
                }}
              >
                {isVerifying ? (
                  <>
                    <div style={{ width: 14, height: 14, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    Verifying…
                  </>
                ) : (
                  <><FiCheck size={14} /> Confirm Payment</>
                )}
              </button>
            </div>
          )}

          {step === STEP.FAILED && (
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: 50, border: '1.5px solid #e8e8e8', background: 'none', fontSize: 13, fontWeight: 600, color: '#777', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                Close
              </button>
              <button onClick={handleRetry} style={{ flex: 1, padding: '12px', borderRadius: 50, background: '#E8541A', border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <FiRefreshCw size={13} /> Try Again
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SubscriptionPage() {
  const router = useRouter();
  const [user, setUser]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showModal, setShowModal]     = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsub = auth.onAuthStateChanged(u => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setShowModal(true);
  };

  const handleSuccess = (plan) => {
    toast.success(`🎉 ${plan.name} plan activated!`, { autoClose: 3000 });
    setTimeout(() => router.push('/tasks'), 2500);
  };

  if (loading) {
    return (
      <Layout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 16 }}>
          <div style={{ width: 44, height: 44, border: '3px solid #E8541A', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ fontSize: 14, color: '#888', fontFamily: "'DM Sans', sans-serif" }}>Loading…</p>
        </div>
      </Layout>
    );
  }

  if (!user) { router.push('/auth/login'); return null; }

  return (
    <Layout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fillBar { from { width: 0; } to { width: 100%; } }
        * { box-sizing: border-box; }
        .plan-card { transition: transform 0.22s, box-shadow 0.22s; cursor: default; }
        .plan-card:hover { transform: translateY(-5px); }
        .plan-btn { transition: background 0.18s, transform 0.15s, box-shadow 0.18s; }
        .plan-btn:hover:not(:disabled) { transform: translateY(-1px); }
        @media (max-width: 860px) { .plans-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 560px) { .plans-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#fafafa', minHeight: '100vh' }}>

        {/* ── Hero ── */}
        <div style={{
          background: 'linear-gradient(135deg, #1a0a00 0%, #2d1200 35%, #0f1a2e 70%, #0a1628 100%)',
          padding: '52px 24px 60px', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 260, height: 260, background: 'radial-gradient(circle, rgba(232,84,26,0.18) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -60, left: -60, width: 300, height: 300, background: 'radial-gradient(circle, rgba(8,145,178,0.10) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
          <div style={{ maxWidth: 620, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <p style={{ color: '#E8541A', fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 14, fontFamily: "'DM Sans', sans-serif" }}>
              Subscription Plans
            </p>
            <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 34, fontWeight: 800, color: '#fff', letterSpacing: '-1px', lineHeight: 1.15, marginBottom: 14 }}>
              Choose Your Plan
            </h1>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.7 }}>
              Activate your account to unlock tasks and start earning. All plans have a fully refundable activation fee.
            </p>
            {/* Live rate pill */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 18, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 50, padding: '6px 14px' }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Live rate:</span>
              <span style={{ fontSize: 12, color: '#fb923c', fontWeight: 800 }}>$1 = KSh {USD_TO_KES_RATE.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* ── Plans ── */}
        <div style={{ maxWidth: 940, margin: '0 auto', padding: '40px 24px 60px' }}>

          <div className="plans-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
            {PLANS.map(plan => (
              <div
                key={plan.id}
                className="plan-card"
                style={{
                  background: '#fff',
                  borderRadius: 18,
                  border: plan.popular ? `2px solid ${plan.color}` : '1.5px solid #ececec',
                  boxShadow: plan.popular
                    ? `0 8px 32px ${plan.colorLight}, 0 2px 8px rgba(0,0,0,0.06)`
                    : '0 2px 12px rgba(0,0,0,0.05)',
                  overflow: 'hidden',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {plan.popular && (
                  <div style={{ position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)', background: plan.color, color: '#fff', fontSize: 10, fontWeight: 800, padding: '4px 14px', borderRadius: '0 0 10px 10px', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                    ⭐ MOST POPULAR
                  </div>
                )}

                {/* Accent bar */}
                <div style={{ height: 4, background: plan.color }} />

                <div style={{ padding: plan.popular ? '28px 20px 20px' : '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>

                  {/* Icon + name */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: plan.colorLight, border: `1px solid ${plan.colorBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>
                      {plan.icon}
                    </div>
                    <div>
                      <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 800, color: '#111', margin: 0 }}>{plan.name}</h3>
                      <p style={{ fontSize: 11, color: '#aaa', margin: '2px 0 0', fontWeight: 500 }}>{plan.tagline}</p>
                    </div>
                  </div>

                  {/* Price — USD + KES */}
                  <div style={{ marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid #f5f5f5' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                      <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 26, fontWeight: 800, color: plan.popular ? plan.color : '#111', letterSpacing: '-0.5px', lineHeight: 1 }}>
                        KSh {usdToKes(plan.priceUsd).toLocaleString()}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                      <span style={{ fontSize: 11, color: '#bbb', textDecoration: 'line-through' }}>${plan.priceUsd} USD</span>
                      <span style={{ fontSize: 10, color: '#ccc' }}>·</span>
                      <span style={{ fontSize: 11, color: '#bbb' }}>one-time</span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 18px', display: 'flex', flexDirection: 'column', gap: 7, flex: 1 }}>
                    {plan.features.map((f, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                        <div style={{ width: 17, height: 17, borderRadius: '50%', background: plan.colorLight, border: `1px solid ${plan.colorBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                          <FiCheck size={9} color={plan.color} strokeWidth={3} />
                        </div>
                        <span style={{ fontSize: 12, color: '#555', lineHeight: 1.4 }}>{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <button
                    className="plan-btn"
                    onClick={() => handleSelectPlan(plan)}
                    style={{
                      width: '100%', padding: '11px', borderRadius: 50,
                      background: plan.popular ? plan.color : '#fff',
                      border: `1.5px solid ${plan.color}`,
                      color: plan.popular ? '#fff' : plan.color,
                      fontSize: 13, fontWeight: 700, cursor: 'pointer',
                      fontFamily: "'DM Sans', sans-serif",
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                      boxShadow: plan.popular ? `0 4px 14px ${plan.colorLight}` : 'none',
                    }}
                  >
                    Get Started <FiArrowRight size={13} />
                  </button>

                </div>
              </div>
            ))}
          </div>

          {/* Refund guarantee banner */}
          <div style={{
            background: 'linear-gradient(135deg, #fff7ed, #fce8d8 50%, #fff7ed)',
            border: '1px solid rgba(232,84,26,0.18)',
            borderRadius: 16, padding: '18px 22px',
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#E8541A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <FiAward size={20} color="#fff" />
            </div>
            <div>
              <h4 style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 800, color: '#111', margin: '0 0 3px' }}>100% Refundable Activation Fee</h4>
              <p style={{ fontSize: 13, color: '#888', margin: 0, lineHeight: 1.55 }}>
                Your plan activation fee is refunded in full on your first successful withdrawal — no questions asked.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Purchase Modal */}
      {showModal && selectedPlan && (
        <PurchaseModal
          plan={selectedPlan}
          user={user}
          onClose={() => setShowModal(false)}
          onSuccess={handleSuccess}
        />
      )}

      <ToastContainer position="top-right" autoClose={5000} newestOnTop closeOnClick pauseOnHover draggable />
    </Layout>
  );
}
