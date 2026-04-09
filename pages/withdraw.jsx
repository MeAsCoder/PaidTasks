/**
 * pages/withdraw.jsx
 *
 * Withdrawal page — automatic payouts on 1st & 15th of every month.
 * No manual withdrawal needed. Users only need to set payment details.
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { useAuth } from '@/context/AuthContext';
import { getDatabase, ref, get, update } from 'firebase/database';
import { getEarningsSummary } from '@/lib/earningsService';
import {
  FiCheck, FiClock, FiDollarSign, FiPhone, FiAlertCircle,
  FiCheckCircle, FiInfo, FiEdit2, FiShield, FiCalendar,
  FiArrowRight, FiRefreshCw, FiX,
} from 'react-icons/fi';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => `$${Number(n || 0).toFixed(2)}`;

const getNextPayoutDates = () => {
  const now   = new Date();
  const year  = now.getFullYear();
  const month = now.getMonth();
  const day   = now.getDate();

  let next1st, next15th;

  // Next 1st
  if (day < 1) {
    next1st = new Date(year, month, 1);
  } else {
    next1st = new Date(year, month + 1, 1);
  }

  // Next 15th
  if (day < 15) {
    next15th = new Date(year, month, 15);
  } else {
    next15th = new Date(year, month + 1, 15);
  }

  // The next upcoming payout is whichever is sooner
  const nextPayout = next15th < next1st ? next15th : next1st;

  const daysUntil = Math.ceil((nextPayout - now) / (1000 * 60 * 60 * 24));

  const formatDate = (d) => d.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });

  return {
    next1st:    formatDate(next1st),
    next15th:   formatDate(next15th),
    nextPayout: formatDate(nextPayout),
    daysUntil,
  };
};

const MINIMUM_PAYOUT_USD = 5.00;

// ─── Terms Modal ──────────────────────────────────────────────────────────────
function TermsModal({ onAccept, onClose }) {
  const [scrolled, setScrolled] = useState(false);

  const handleScroll = (e) => {
    const el = e.target;
    if (el.scrollHeight - el.scrollTop <= el.clientHeight + 40) {
      setScrolled(true);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16, fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ background: '#fff', borderRadius: 20, maxWidth: 540, width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 32px 80px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '22px 24px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiShield size={18} color="#E8541A" />
            </div>
            <div>
              <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 16, fontWeight: 800, color: '#111', margin: 0 }}>Payout Terms & Policy</h3>
              <p style={{ fontSize: 11, color: '#aaa', margin: 0 }}>Please read before saving payment details</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', padding: 4 }}><FiX size={18} /></button>
        </div>

        {/* Scrollable body */}
        <div onScroll={handleScroll} style={{ overflowY: 'auto', flex: 1, padding: '20px 24px' }}>
          {[
            {
              title: '1. Automatic Payout Schedule',
              body: 'HandShake AI processes all earnings automatically on the 1st and 15th of every calendar month. No withdrawal request is required. Payouts are initiated at 00:00 EAT and may take 1–3 business days to reflect in your M-Pesa or bank account depending on your provider.',
            },
            {
              title: '2. Minimum Payout Threshold',
              body: `Your account balance must be at least ${fmt(MINIMUM_PAYOUT_USD)} USD (approximately KSh ${(MINIMUM_PAYOUT_USD * 128.85).toFixed(0)}) on the payout date to qualify for that cycle. Balances below this threshold carry forward to the next payout date automatically.`,
            },
            {
              title: '3. Payment Details Accuracy',
              body: 'You are solely responsible for ensuring your M-Pesa number or bank account details are accurate and up to date before the payout date. HandShake AI will not be held liable for funds sent to an incorrect number or account provided by the user. Once a payout is initiated, it cannot be reversed.',
            },
            {
              title: '4. Supported Payment Methods',
              body: 'HandShake AI currently supports M-Pesa (Safaricom Kenya), international bank transfers, PayPal, Skrill, and Wise as payout methods. For PayPal, Skrill, and Wise, payouts are sent in USD. For M-Pesa and bank transfers, amounts are converted to the local currency at the prevailing exchange rate. Additional payment methods are under development.',
            },
            {
              title: '5. Currency & Exchange Rates',
              body: 'All earnings are tracked and displayed in USD. Payouts to M-Pesa are converted to KES at the prevailing mid-market rate at the time of processing. HandShake AI applies a small conversion fee of up to 1.5% on all USD-to-KES conversions.',
            },
            {
              title: '6. Account Verification',
              body: 'HandShake AI reserves the right to request identity verification before processing any payout. Users suspected of fraudulent activity, multiple account usage, or task manipulation will have their payouts suspended pending investigation. Accounts found in violation of our Terms of Service will be permanently disqualified from payouts.',
            },
            {
              title: '7. Tax Obligations',
              body: 'You are responsible for declaring and paying any applicable taxes on your HandShake AI earnings in your jurisdiction. HandShake AI does not withhold taxes on behalf of users. We recommend consulting a local tax professional if you are uncertain of your obligations.',
            },
            {
              title: '8. Changes to This Policy',
              body: 'HandShake AI reserves the right to update the payout schedule, minimum thresholds, or supported payment methods with 14 days\' notice communicated via email or in-app notification. Continued use of the platform after the notice period constitutes acceptance of the updated terms.',
            },
          ].map((section, i) => (
            <div key={i} style={{ marginBottom: 20 }}>
              <h4 style={{ fontFamily: "'Sora', sans-serif", fontSize: 13, fontWeight: 800, color: '#111', margin: '0 0 6px' }}>{section.title}</h4>
              <p style={{ fontSize: 13, color: '#666', lineHeight: 1.7, margin: 0 }}>{section.body}</p>
            </div>
          ))}
          <p style={{ fontSize: 11, color: '#bbb', marginTop: 8 }}>Last updated: March 2026</p>
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 24px 20px', borderTop: '1px solid #f0f0f0', flexShrink: 0 }}>
          {!scrolled && (
            <p style={{ textAlign: 'center', fontSize: 11, color: '#bbb', margin: '0 0 10px' }}>Scroll to the bottom to accept</p>
          )}
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onClose} style={{ flex: '0 0 auto', padding: '11px 18px', borderRadius: 50, border: '1.5px solid #e8e8e8', background: 'none', fontSize: 13, fontWeight: 600, color: '#888', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
              Cancel
            </button>
            <button
              onClick={onAccept}
              disabled={!scrolled}
              style={{ flex: 1, padding: '12px', borderRadius: 50, background: scrolled ? '#E8541A' : '#e0e0e0', border: 'none', color: scrolled ? '#fff' : '#aaa', fontSize: 13, fontWeight: 700, cursor: scrolled ? 'pointer' : 'not-allowed', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, boxShadow: scrolled ? '0 4px 14px rgba(232,84,26,0.25)' : 'none', transition: 'all 0.2s' }}
            >
              <FiCheck size={14} /> I Agree & Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function WithdrawPage() {
  const router = useRouter();
  const { currentUser } = useAuth();

  const [summary,        setSummary]        = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [saving,         setSaving]         = useState(false);
  const [saveSuccess,    setSaveSuccess]    = useState(false);
  const [showTerms,      setShowTerms]      = useState(false);
  const [termsAccepted,  setTermsAccepted]  = useState(false);
  const [isEditing,      setIsEditing]      = useState(false);

  // Form state
  const [method,      setMethod]      = useState('mpesa');
  const [phone,       setPhone]       = useState('');
  const [bankName,    setBankName]    = useState('');
  const [accountNo,   setAccountNo]   = useState('');
  const [accountName, setAccountName] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');
  const [skrillEmail, setSkrillEmail] = useState('');
  const [wiseEmail,   setWiseEmail]   = useState('');
  const [wiseCurrency,setWiseCurrency]= useState('USD');
  const [formError,   setFormError]   = useState('');

  const payout = getNextPayoutDates();

  useEffect(() => {
    if (!currentUser?.uid) { setLoading(false); return; }
    const load = async () => {
      try {
        const [s, snap] = await Promise.all([
          getEarningsSummary(currentUser.uid),
          get(ref(getDatabase(), `usersweb/${currentUser.uid}/paymentDetails`)),
        ]);
        setSummary(s);
        if (snap.exists()) {
          const d = snap.val();
          setPaymentDetails(d);
          setMethod(d.method || 'mpesa');
          setPhone(d.phone || '');
          setBankName(d.bankName || '');
          setAccountNo(d.accountNo || '');
          setAccountName(d.accountName || '');
          setPaypalEmail(d.paypalEmail || '');
          setSkrillEmail(d.skrillEmail || '');
          setWiseEmail(d.wiseEmail || '');
          setWiseCurrency(d.wiseCurrency || 'USD');
          setTermsAccepted(d.termsAccepted || false);
        } else {
          setIsEditing(true); // No details yet — start in edit mode
        }
      } catch (err) {
        console.error('Withdraw page load error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentUser]);

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (method === 'mpesa') {
      const digits = phone.replace(/\D/g, '');
      if (digits.length < 9 || digits.length > 12) {
        setFormError('Please enter a valid Kenyan phone number (e.g. 0712 345 678)');
        return false;
      }
    } else if (method === 'bank') {
      if (!bankName.trim())    { setFormError('Please enter your bank name'); return false; }
      if (!accountNo.trim())   { setFormError('Please enter your account number'); return false; }
      if (!accountName.trim()) { setFormError('Please enter the account holder name'); return false; }
    } else if (method === 'paypal') {
      if (!paypalEmail.trim() || !emailRegex.test(paypalEmail)) {
        setFormError('Please enter a valid PayPal email address'); return false;
      }
    } else if (method === 'skrill') {
      if (!skrillEmail.trim() || !emailRegex.test(skrillEmail)) {
        setFormError('Please enter a valid Skrill email address'); return false;
      }
    } else if (method === 'wise') {
      if (!wiseEmail.trim() || !emailRegex.test(wiseEmail)) {
        setFormError('Please enter a valid Wise email address'); return false;
      }
    }
    return true;
  };

  const handleSave = async () => {
    setFormError('');
    if (!validateForm()) return;
    if (!termsAccepted) { setShowTerms(true); return; }
    await savePaymentDetails();
  };

  const savePaymentDetails = async () => {
    if (!currentUser?.uid) return;
    setSaving(true);
    try {
      const base = { method, termsAccepted: true, updatedAt: new Date().toISOString() };
      const methodData =
        method === 'mpesa'   ? { phone: phone.replace(/\D/g, '') } :
        method === 'bank'    ? { bankName, accountNo, accountName } :
        method === 'paypal'  ? { paypalEmail } :
        method === 'skrill'  ? { skrillEmail } :
        method === 'wise'    ? { wiseEmail, wiseCurrency } : {};

      const details = { ...base, ...methodData };
      await update(ref(getDatabase(), `usersweb/${currentUser.uid}`), { paymentDetails: details });
      setPaymentDetails(details);
      setTermsAccepted(true);
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error('Save payment details error:', err);
      setFormError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleTermsAccept = () => {
    setShowTerms(false);
    setTermsAccepted(true);
    savePaymentDetails();
  };

  const qualifiesForPayout = (summary?.balance || 0) >= MINIMUM_PAYOUT_USD;

  if (!currentUser) {
    router.push('/auth/login');
    return null;
  }

  if (loading) {
    return (
      <Layout title="Withdrawals">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 14, fontFamily: "'DM Sans', sans-serif" }}>
          <div style={{ width: 40, height: 40, border: '3px solid #E8541A', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <span style={{ fontSize: 14, color: '#888', fontWeight: 500 }}>Loading your payout info…</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Withdrawals">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .wd-card { background: #fff; border: 1px solid #f0f0f0; border-radius: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.05); }
        .method-tab { cursor: pointer; padding: 10px 20px; border-radius: 50px; font-size: 13px; font-weight: 600; border: 1.5px solid transparent; transition: all 0.18s; font-family: 'DM Sans', sans-serif; }
        .method-tab.active { background: #E8541A; color: #fff; border-color: #E8541A; box-shadow: 0 3px 12px rgba(232,84,26,0.25); }
        .method-tab.inactive { background: #fff; color: #666; border-color: #e8e8e8; }
        .method-tab.inactive:hover { border-color: #E8541A; color: #E8541A; }
        input, select { transition: border-color 0.2s; }
        input:focus, select:focus { outline: none; border-color: #E8541A !important; }
        @media(max-width:640px){ .wd-grid{ grid-template-columns: 1fr !important; } }
      `}</style>

      {showTerms && <TermsModal onAccept={handleTermsAccept} onClose={() => setShowTerms(false)} />}

      <div style={{ maxWidth: 780, margin: '0 auto', padding: '32px 20px 60px', fontFamily: "'DM Sans', sans-serif" }}>

        {/* ── Page Header ── */}
        <div style={{ background: 'linear-gradient(135deg, #1a0a00 0%, #2d1200 40%, #0f1a2e 100%)', borderRadius: 20, padding: '28px 28px 24px', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, background: 'radial-gradient(circle, rgba(232,84,26,0.2) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#E8541A', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 6px' }}>Payouts</p>
            <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 26, fontWeight: 800, color: '#fff', margin: '0 0 8px', letterSpacing: '-0.5px' }}>
              Earnings & Withdrawals
            </h1>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.6, maxWidth: 480 }}>
              Your earnings are paid out automatically — no action needed. Just keep your payment details up to date.
            </p>
          </div>
        </div>

        {/* ── Balance + Next Payout ── */}
        <div className="wd-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>

          {/* Balance card */}
          <div className="wd-card" style={{ padding: '22px 22px', borderTop: '3px solid #059669' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <FiDollarSign size={14} color="#059669" />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Available Balance</span>
            </div>
            <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 34, fontWeight: 800, color: '#059669', margin: '0 0 6px', letterSpacing: '-1px', lineHeight: 1 }}>
              {fmt(summary?.balance)}
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8, padding: '5px 12px', borderRadius: 50, background: qualifiesForPayout ? 'rgba(5,150,105,0.08)' : '#fff7ed', border: `1px solid ${qualifiesForPayout ? 'rgba(5,150,105,0.2)' : 'rgba(232,84,26,0.2)'}` }}>
              {qualifiesForPayout
                ? <><FiCheckCircle size={12} color="#059669" /><span style={{ fontSize: 11, fontWeight: 700, color: '#059669' }}>Eligible for next payout</span></>
                : <><FiInfo size={12} color="#E8541A" /><span style={{ fontSize: 11, fontWeight: 700, color: '#E8541A' }}>Min. {fmt(MINIMUM_PAYOUT_USD)} required</span></>
              }
            </div>
          </div>

          {/* Next payout card */}
          <div className="wd-card" style={{ padding: '22px 22px', borderTop: '3px solid #E8541A' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <FiCalendar size={14} color="#E8541A" />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Next Payout</span>
            </div>
            <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 800, color: '#111', margin: '0 0 4px', lineHeight: 1.2 }}>
              {payout.nextPayout}
            </p>
            <p style={{ fontSize: 12, color: '#aaa', margin: '0 0 10px' }}>
              {payout.daysUntil === 0 ? 'Processing today' : `In ${payout.daysUntil} day${payout.daysUntil !== 1 ? 's' : ''}`}
            </p>
            <div style={{ fontSize: 11, color: '#bbb', display: 'flex', flexDirection: 'column', gap: 3 }}>
              <span>📅 Also: {payout.next1st}</span>
              <span>📅 Also: {payout.next15th}</span>
            </div>
          </div>
        </div>

        {/* ── How Auto-Payouts Work ── */}
        <div className="wd-card" style={{ padding: '22px 24px', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiRefreshCw size={16} color="#E8541A" />
            </div>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 800, color: '#111', margin: 0 }}>How Automatic Payouts Work</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
            {[
              { step: '01', icon: '📋', title: 'Complete Tasks', desc: 'Earn USD by completing surveys, videos, and AI training tasks.' },
              { step: '02', icon: '💰', title: 'Balance Accumulates', desc: `Once your balance reaches ${fmt(MINIMUM_PAYOUT_USD)}, you qualify for the next payout cycle.` },
              { step: '03', icon: '📅', title: 'Auto Paid Out', desc: 'On the 1st and 15th of every month, we automatically send your earnings — no action needed.' },
              { step: '04', icon: '📱', title: 'Received in M-Pesa', desc: 'Funds arrive in your registered M-Pesa or bank account within 1–3 business days.' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(232,84,26,0.08)', border: '1px solid rgba(232,84,26,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 15 }}>
                  {item.icon}
                </div>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 800, color: '#111', margin: '0 0 3px', fontFamily: "'Sora', sans-serif" }}>{item.title}</p>
                  <p style={{ fontSize: 11, color: '#999', margin: 0, lineHeight: 1.5 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Policy note */}
          <div style={{ marginTop: 18, padding: '12px 16px', background: 'rgba(5,150,105,0.05)', border: '1px solid rgba(5,150,105,0.15)', borderRadius: 12, display: 'flex', gap: 10 }}>
            <FiInfo size={14} color="#059669" style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 12, color: '#065f46', margin: 0, lineHeight: 1.6 }}>
              <strong>No action required.</strong> Payouts are processed automatically every 1st and 15th of the month. You only need to ensure your payment details below are accurate and up to date.
            </p>
          </div>
        </div>

        {/* ── Payment Details ── */}
        <div className="wd-card" style={{ padding: '22px 24px', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiPhone size={16} color="#E8541A" />
              </div>
              <div>
                <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 800, color: '#111', margin: 0 }}>Payment Details</h2>
                <p style={{ fontSize: 11, color: '#aaa', margin: 0 }}>Where your earnings will be sent</p>
              </div>
            </div>
            {paymentDetails && !isEditing && (
              <button onClick={() => setIsEditing(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 50, border: '1.5px solid #e8e8e8', background: 'none', fontSize: 12, fontWeight: 600, color: '#555', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                <FiEdit2 size={12} /> Edit Details
              </button>
            )}
          </div>

          {/* Saved details view */}
          {paymentDetails && !isEditing && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <div style={{ background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: 14, padding: '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(5,150,105,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FiCheckCircle size={14} color="#059669" />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#059669' }}>Payment details saved</span>
                </div>

                {paymentDetails.method === 'mpesa' ? (
                  <div style={{ display: 'flex', flex: 1, gap: 16, flexWrap: 'wrap' }}>
                    <div>
                      <p style={{ fontSize: 11, color: '#aaa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>Method</p>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#111', margin: 0 }}>📱 M-Pesa</p>
                    </div>
                    <div>
                      <p style={{ fontSize: 11, color: '#aaa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>Phone Number</p>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#111', margin: 0 }}>🇰🇪 +254 {paymentDetails.phone?.replace(/^254/, '')}</p>
                    </div>
                  </div>
                ) : paymentDetails.method === 'bank' ? (
                  <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                    <div>
                      <p style={{ fontSize: 11, color: '#aaa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>Method</p>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#111', margin: 0 }}>🏦 Bank Transfer</p>
                    </div>
                    <div>
                      <p style={{ fontSize: 11, color: '#aaa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>Bank</p>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#111', margin: 0 }}>{paymentDetails.bankName}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: 11, color: '#aaa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>Account</p>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#111', margin: 0 }}>****{paymentDetails.accountNo?.slice(-4)}</p>
                    </div>
                  </div>
                ) : paymentDetails.method === 'paypal' ? (
                  <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                    <div>
                      <p style={{ fontSize: 11, color: '#aaa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>Method</p>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#111', margin: 0 }}>🅿️ PayPal</p>
                    </div>
                    <div>
                      <p style={{ fontSize: 11, color: '#aaa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>PayPal Email</p>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#111', margin: 0 }}>{paymentDetails.paypalEmail}</p>
                    </div>
                  </div>
                ) : paymentDetails.method === 'skrill' ? (
                  <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                    <div>
                      <p style={{ fontSize: 11, color: '#aaa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>Method</p>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#111', margin: 0 }}>💜 Skrill</p>
                    </div>
                    <div>
                      <p style={{ fontSize: 11, color: '#aaa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>Skrill Email</p>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#111', margin: 0 }}>{paymentDetails.skrillEmail}</p>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                    <div>
                      <p style={{ fontSize: 11, color: '#aaa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>Method</p>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#111', margin: 0 }}>💚 Wise</p>
                    </div>
                    <div>
                      <p style={{ fontSize: 11, color: '#aaa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>Wise Email</p>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#111', margin: 0 }}>{paymentDetails.wiseEmail}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: 11, color: '#aaa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>Currency</p>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#111', margin: 0 }}>{paymentDetails.wiseCurrency}</p>
                    </div>
                  </div>
                )}
                <p style={{ fontSize: 11, color: '#bbb', margin: '14px 0 0' }}>
                  Last updated: {new Date(paymentDetails.updatedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
          )}

          {/* Edit / new form */}
          {isEditing && (
            <div style={{ animation: 'fadeIn 0.25s ease' }}>

              {/* Method selector — card grid */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#888', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 12 }}>
                  Payout Method
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 }}>
                  {[
                    { id: 'mpesa',  label: 'M-Pesa',        icon: '📱', tag: 'Kenya',    color: '#059669' },
                    { id: 'bank',   label: 'Bank Transfer',  icon: '🏦', tag: 'Global',   color: '#0891B2' },
                    { id: 'paypal', label: 'PayPal',         icon: '🅿️', tag: 'Global',   color: '#003087' },
                    { id: 'skrill', label: 'Skrill',         icon: '💜', tag: 'Global',   color: '#862165' },
                    { id: 'wise',   label: 'Wise',           icon: '💚', tag: 'Global',   color: '#9FE870' },
                  ].map(m => {
                    const active = method === m.id;
                    return (
                      <button
                        key={m.id}
                        onClick={() => { setMethod(m.id); setFormError(''); }}
                        style={{
                          padding: '12px 10px', borderRadius: 14, cursor: 'pointer',
                          border: `2px solid ${active ? '#E8541A' : '#ececec'}`,
                          background: active ? '#fff7ed' : '#fafafa',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                          transition: 'all 0.18s', fontFamily: "'DM Sans', sans-serif",
                          boxShadow: active ? '0 2px 10px rgba(232,84,26,0.15)' : 'none',
                        }}
                      >
                        <span style={{ fontSize: 22 }}>{m.icon}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: active ? '#E8541A' : '#333' }}>{m.label}</span>
                        <span style={{ fontSize: 10, fontWeight: 600, color: active ? '#E8541A' : '#bbb', background: active ? 'rgba(232,84,26,0.1)' : '#f0f0f0', padding: '1px 7px', borderRadius: 20 }}>{m.tag}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── M-Pesa ── */}
              {method === 'mpesa' && (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#888', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 }}>M-Pesa Phone Number</label>
                  <div style={{ display: 'flex', border: '1.5px solid #e8e8e8', borderRadius: 12, overflow: 'hidden', background: '#fafafa' }}>
                    <div style={{ padding: '12px 14px', background: '#f5f5f5', borderRight: '1px solid #e8e8e8', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      <span style={{ fontSize: 16 }}>🇰🇪</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#555' }}>+254</span>
                    </div>
                    <input type="tel" value={phone} onChange={e => { setPhone(e.target.value); setFormError(''); }} placeholder="712 345 678"
                      style={{ flex: 1, padding: '12px 14px', border: 'none', background: 'transparent', fontSize: 15, color: '#111', fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }} />
                  </div>
                  <p style={{ fontSize: 11, color: '#bbb', margin: '6px 0 0' }}>Safaricom M-Pesa number registered to receive payments (Kenya only)</p>
                </div>
              )}

              {/* ── Bank Transfer ── */}
              {method === 'bank' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 16 }}>
                  {[
                    { label: 'Bank Name',             value: bankName,    set: setBankName,    placeholder: 'e.g. Equity Bank, KCB, Barclays, Chase' },
                    { label: 'Account Number / IBAN', value: accountNo,   set: setAccountNo,   placeholder: 'Your account number or IBAN' },
                    { label: 'Account Holder Name',   value: accountName, set: setAccountName, placeholder: 'Full name as it appears on the account' },
                  ].map(({ label, value, set: setter, placeholder }) => (
                    <div key={label}>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#888', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 }}>{label}</label>
                      <input type="text" value={value} onChange={e => { setter(e.target.value); setFormError(''); }} placeholder={placeholder}
                        style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e8e8e8', borderRadius: 12, fontSize: 14, color: '#111', background: '#fafafa', fontFamily: "'DM Sans', sans-serif" }} />
                    </div>
                  ))}
                  <p style={{ fontSize: 11, color: '#bbb', margin: 0 }}>International bank transfers supported. Processing may take 3–5 business days.</p>
                </div>
              )}

              {/* ── PayPal ── */}
              {method === 'paypal' && (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#888', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 }}>PayPal Email Address</label>
                  <input type="email" value={paypalEmail} onChange={e => { setPaypalEmail(e.target.value); setFormError(''); }} placeholder="your@paypal.com"
                    style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e8e8e8', borderRadius: 12, fontSize: 14, color: '#111', background: '#fafafa', fontFamily: "'DM Sans', sans-serif" }} />
                  <p style={{ fontSize: 11, color: '#bbb', margin: '6px 0 0' }}>Enter the email address linked to your PayPal account. Payments sent in USD.</p>
                </div>
              )}

              {/* ── Skrill ── */}
              {method === 'skrill' && (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#888', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 }}>Skrill Email Address</label>
                  <input type="email" value={skrillEmail} onChange={e => { setSkrillEmail(e.target.value); setFormError(''); }} placeholder="your@skrill.com"
                    style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e8e8e8', borderRadius: 12, fontSize: 14, color: '#111', background: '#fafafa', fontFamily: "'DM Sans', sans-serif" }} />
                  <p style={{ fontSize: 11, color: '#bbb', margin: '6px 0 0' }}>Enter the email address linked to your Skrill (Moneybookers) account.</p>
                </div>
              )}

              {/* ── Wise ── */}
              {method === 'wise' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#888', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 }}>Wise Email Address</label>
                    <input type="email" value={wiseEmail} onChange={e => { setWiseEmail(e.target.value); setFormError(''); }} placeholder="your@wise.com"
                      style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e8e8e8', borderRadius: 12, fontSize: 14, color: '#111', background: '#fafafa', fontFamily: "'DM Sans', sans-serif" }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#888', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 }}>Preferred Currency</label>
                    <select value={wiseCurrency} onChange={e => setWiseCurrency(e.target.value)}
                      style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e8e8e8', borderRadius: 12, fontSize: 14, color: '#111', background: '#fafafa', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer' }}>
                      {['USD','EUR','GBP','KES','AUD','CAD','INR','NGN','GHS','ZAR','TZS','UGX'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <p style={{ fontSize: 11, color: '#bbb', margin: 0 }}>Wise supports 50+ currencies with low conversion fees. Ideal for international users.</p>
                </div>
              )}

              {/* Error */}
              {formError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#fff7ed', border: '1px solid rgba(232,84,26,0.2)', borderRadius: 10, marginBottom: 14 }}>
                  <FiAlertCircle size={14} color="#E8541A" />
                  <span style={{ fontSize: 12, color: '#92400e', fontWeight: 500 }}>{formError}</span>
                </div>
              )}

              {/* Terms notice */}
              <div style={{ padding: '12px 14px', background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: 12, marginBottom: 16, display: 'flex', gap: 10 }}>
                <FiShield size={14} color="#E8541A" style={{ flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 12, color: '#666', margin: 0, lineHeight: 1.6 }}>
                  By saving your payment details you agree to our{' '}
                  <button onClick={() => setShowTerms(true)} style={{ background: 'none', border: 'none', color: '#E8541A', fontWeight: 700, cursor: 'pointer', fontSize: 12, padding: 0, fontFamily: "'DM Sans', sans-serif" }}>
                    Payout Terms & Policy
                  </button>.
                  {termsAccepted && <span style={{ color: '#059669', fontWeight: 700 }}> ✓ Already accepted</span>}
                </p>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: 10 }}>
                {paymentDetails && (
                  <button onClick={() => { setIsEditing(false); setFormError(''); }} style={{ flex: '0 0 auto', padding: '11px 18px', borderRadius: 50, border: '1.5px solid #e8e8e8', background: 'none', fontSize: 13, fontWeight: 600, color: '#888', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                    Cancel
                  </button>
                )}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{ flex: 1, padding: '12px', borderRadius: 50, background: saving ? '#ccc' : '#E8541A', border: 'none', color: '#fff', fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: saving ? 'none' : '0 4px 14px rgba(232,84,26,0.25)', transition: 'background 0.2s' }}
                >
                  {saving
                    ? <><div style={{ width: 14, height: 14, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Saving…</>
                    : <><FiCheck size={14} /> Save Payment Details</>
                  }
                </button>
              </div>
            </div>
          )}

          {/* Save success toast */}
          {saveSuccess && (
            <div style={{ marginTop: 14, padding: '12px 16px', background: 'rgba(5,150,105,0.08)', border: '1px solid rgba(5,150,105,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8, animation: 'fadeIn 0.3s ease' }}>
              <FiCheckCircle size={16} color="#059669" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#059669' }}>Payment details saved successfully!</span>
            </div>
          )}
        </div>

        {/* ── Payout Policy Summary ── */}
        <div className="wd-card" style={{ padding: '22px 24px', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiShield size={16} color="#E8541A" />
            </div>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 800, color: '#111', margin: 0 }}>Payout Policy</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { icon: '📅', title: 'Payout Schedule', desc: 'Automatic on the 1st and 15th of every month. No request needed.' },
              { icon: '💵', title: `Minimum Balance`, desc: `${fmt(MINIMUM_PAYOUT_USD)} minimum to qualify. Balances below carry forward automatically.` },
              { icon: '⏱️', title: 'Processing Time', desc: 'Payouts are initiated at midnight EAT and arrive within 1–3 business days.' },
              { icon: '💱', title: 'Currency', desc: 'Earnings in USD, converted to KES at the prevailing rate on payout day (±1.5% fee).' },
              { icon: '💳', title: 'Supported Methods', desc: 'M-Pesa, Bank Transfer, PayPal, Skrill, and Wise. More methods coming soon.' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 14px', background: '#fafafa', borderRadius: 12, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#111', margin: '0 0 2px', fontFamily: "'Sora', sans-serif" }}>{item.title}</p>
                  <p style={{ fontSize: 12, color: '#888', margin: 0, lineHeight: 1.5 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <button onClick={() => setShowTerms(true)} style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#E8541A', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", padding: 0 }}>
            Read full Payout Terms & Policy <FiArrowRight size={12} />
          </button>
        </div>

        {/* ── Quick actions ── */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button onClick={() => router.push('/tasks')} style={{ flex: 1, minWidth: 140, padding: '13px', borderRadius: 50, background: '#E8541A', border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, boxShadow: '0 4px 14px rgba(232,84,26,0.25)' }}>
            Start Earning <FiArrowRight size={13} />
          </button>
          <button onClick={() => router.push('/dashboard')} style={{ flex: 1, minWidth: 140, padding: '13px', borderRadius: 50, border: '1.5px solid #e8e8e8', background: '#fff', color: '#555', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
            View Dashboard <FiArrowRight size={13} />
          </button>
        </div>

      </div>
    </Layout>
  );
}
