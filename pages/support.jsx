/**
 * pages/support.jsx
 *
 * EarnFlex Support Centre — FAQ, contact form, ticket submission, and resources.
 */

import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { useAuth } from '@/context/AuthContext';
import { getDatabase, ref, push, set } from 'firebase/database';
import {
  FiSearch, FiChevronDown, FiChevronUp, FiMail, FiMessageCircle,
  FiBook, FiAlertCircle, FiCheckCircle, FiClock, FiArrowRight,
  FiDollarSign, FiShield, FiSettings, FiZap, FiHelpCircle, FiSend,
} from 'react-icons/fi';

// ─── FAQ Data ─────────────────────────────────────────────────────────────────
const FAQ_CATEGORIES = [
  {
    id: 'earnings',
    label: 'Earnings & Payouts',
    icon: <FiDollarSign size={16} />,
    color: '#059669',
    colorLight: 'rgba(5,150,105,0.08)',
    questions: [
      {
        q: 'When will I receive my payout?',
        a: 'Payouts are processed automatically on the 1st and 15th of every month. No withdrawal request is needed. Just ensure your payment details are saved and your balance meets the $5.00 minimum threshold before the payout date.',
      },
      {
        q: 'What is the minimum payout amount?',
        a: 'The minimum payout threshold is $5.00 USD. If your balance is below this on a payout date, your earnings roll over to the next cycle automatically — nothing is lost.',
      },
      {
        q: 'Which payment methods are supported?',
        a: 'We support M-Pesa (Kenya), Bank Transfer (global), PayPal, Skrill, and Wise. You can set or update your preferred payout method on the Withdrawals page at any time.',
      },
      {
        q: 'Why haven\'t I received my payout?',
        a: 'Payouts are initiated at midnight EAT and may take 1–3 business days to arrive depending on your provider. Check that your payment details are correct on the Withdrawals page. If it has been more than 5 business days, please contact our support team with your account email.',
      },
      {
        q: 'Are my earnings in USD or KES?',
        a: 'All earnings are tracked and displayed in USD. When paid out to M-Pesa or a Kenyan bank account, they are converted to KES at the prevailing mid-market rate on the payout date. PayPal, Skrill, and Wise receive payouts directly in USD.',
      },
      {
        q: 'Is the activation fee refundable?',
        a: 'Yes — your plan activation fee is fully refunded on your first successful withdrawal. This credit is applied automatically and requires no action from you.',
      },
    ],
  },
  {
    id: 'tasks',
    label: 'Tasks & Surveys',
    icon: <FiZap size={16} />,
    color: '#E8541A',
    colorLight: 'rgba(232,84,26,0.08)',
    questions: [
      {
        q: 'Why can\'t I start a task?',
        a: 'Tasks require an active subscription. If you see a "Purchase a Plan" prompt when clicking a task, your plan may have expired or not yet been activated. Visit the Subscription page to purchase or renew your plan.',
      },
      {
        q: 'How often do tasks reset?',
        a: 'Each task category resets after a 5-hour cooldown. Once all tasks in a category are completed, the entire category becomes available again after the cooldown period expires.',
      },
      {
        q: 'Why do I need to wait before proceeding to the next question?',
        a: 'We apply a minimum time per question to ensure quality responses. This helps our clients trust the data and allows us to continue offering competitive reward rates. The timer is typically 15–20 seconds per question.',
      },
      {
        q: 'Can I go back and change my answers?',
        a: 'You can navigate backwards through survey questions before final submission. However, once a task is submitted you cannot edit your responses.',
      },
      {
        q: 'Why was my task earnings not credited?',
        a: 'Earnings are credited instantly upon successful task submission. If you completed a task but don\'t see the credit, check the Recent Activity section on your Dashboard. If it\'s missing, contact support with the task name and approximate completion time.',
      },
    ],
  },
  {
    id: 'account',
    label: 'Account & Subscription',
    icon: <FiSettings size={16} />,
    color: '#7C3AED',
    colorLight: 'rgba(124,58,237,0.08)',
    questions: [
      {
        q: 'How do I activate my account?',
        a: 'Visit the Subscription page and choose a plan. After selecting a plan, you\'ll be prompted to pay via M-Pesa STK push. Once payment is confirmed, your account is activated instantly and you can start earning.',
      },
      {
        q: 'Can I upgrade or downgrade my plan?',
        a: 'Yes. Visit the Subscription page to purchase a new plan at any time. Your new plan takes effect immediately. If you had an existing active plan, the new plan replaces it.',
      },
      {
        q: 'How do I change my payment details?',
        a: 'Go to the Withdrawals page and click "Edit Details". You can update your M-Pesa number, bank account, PayPal, Skrill, or Wise information at any time. Changes take effect on the next payout cycle.',
      },
      {
        q: 'I forgot my password. How do I reset it?',
        a: 'On the login page, click "Forgot Password" and enter your registered email address. You\'ll receive a password reset link within a few minutes. Check your spam folder if you don\'t see it.',
      },
      {
        q: 'Can I have multiple accounts?',
        a: 'No. Each user is permitted one account only. Multiple accounts per user are a violation of our Terms of Service and may result in permanent account suspension and forfeiture of any pending earnings.',
      },
    ],
  },
  {
    id: 'security',
    label: 'Security & Privacy',
    icon: <FiShield size={16} />,
    color: '#0891B2',
    colorLight: 'rgba(8,145,178,0.08)',
    questions: [
      {
        q: 'How is my personal data used?',
        a: 'Your personal data is used solely to operate your EarnFlex account and process payouts. We do not sell your data to third parties. Survey responses are anonymised before being shared with our clients. Please review our Privacy Policy for full details.',
      },
      {
        q: 'Is my payment information secure?',
        a: 'Yes. Payment details are encrypted and stored securely in our database. We never store full bank account credentials or M-Pesa PINs. All transactions are processed through verified payment gateways.',
      },
      {
        q: 'I received a suspicious email claiming to be from EarnFlex. What should I do?',
        a: 'EarnFlex will only communicate with you from official @earnflex.com email addresses. If you receive a suspicious message asking for your password, PIN, or payment details, do not respond. Report it to support@earnflex.com immediately.',
      },
    ],
  },
];

// ─── Ticket Categories ─────────────────────────────────────────────────────────
const TICKET_CATEGORIES = [
  'Missing payout',
  'Task earnings not credited',
  'Account activation issue',
  'Payment details problem',
  'Technical bug or error',
  'Subscription / billing',
  'Account suspension or ban',
  'Other',
];

// ─── FAQ Item ─────────────────────────────────────────────────────────────────
function FAQItem({ q, a, accent }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      onClick={() => setOpen(o => !o)}
      style={{
        borderBottom: '1px solid #f5f5f5', cursor: 'pointer',
        padding: '16px 0', transition: 'background 0.15s',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: open ? accent : '#111', margin: 0, lineHeight: 1.5, flex: 1, transition: 'color 0.15s' }}>{q}</p>
        <div style={{ flexShrink: 0, color: open ? accent : '#ccc', marginTop: 2, transition: 'color 0.15s' }}>
          {open ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
        </div>
      </div>
      {open && (
        <p style={{ fontSize: 13, color: '#666', lineHeight: 1.75, margin: '10px 0 0', paddingLeft: 0 }}>
          {a}
        </p>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SupportPage() {
  const router = useRouter();
  const { currentUser } = useAuth();

  const [searchQuery,    setSearchQuery]    = useState('');
  const [activeCategory, setActiveCategory] = useState('earnings');
  const [ticketName,     setTicketName]     = useState('');
  const [ticketEmail,    setTicketEmail]    = useState(currentUser?.email || '');
  const [ticketCategory, setTicketCategory] = useState('');
  const [ticketMessage,  setTicketMessage]  = useState('');
  const [ticketSending,  setTicketSending]  = useState(false);
  const [ticketSent,     setTicketSent]     = useState(false);
  const [ticketError,    setTicketError]    = useState('');

  // Search filtering
  const allQuestions = FAQ_CATEGORIES.flatMap(cat =>
    cat.questions.map(q => ({ ...q, catId: cat.id, catLabel: cat.label, accent: cat.color }))
  );
  const searchResults = searchQuery.trim().length > 1
    ? allQuestions.filter(q =>
        q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.a.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : null;

  const currentCat = FAQ_CATEGORIES.find(c => c.id === activeCategory);

  const handleTicketSubmit = async () => {
    setTicketError('');
    if (!ticketName.trim())    { setTicketError('Please enter your name'); return; }
    if (!ticketEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ticketEmail)) {
      setTicketError('Please enter a valid email address'); return;
    }
    if (!ticketCategory)       { setTicketError('Please select a category'); return; }
    if (ticketMessage.trim().length < 20) {
      setTicketError('Please describe your issue in at least 20 characters'); return;
    }

    setTicketSending(true);
    try {
      const db = getDatabase();
      await set(push(ref(db, 'supportTickets')), {
        name:      ticketName.trim(),
        email:     ticketEmail.trim(),
        category:  ticketCategory,
        message:   ticketMessage.trim(),
        userId:    currentUser?.uid || null,
        status:    'open',
        createdAt: new Date().toISOString(),
      });
      setTicketSent(true);
      setTicketName('');
      setTicketCategory('');
      setTicketMessage('');
    } catch (err) {
      console.error('Ticket submission error:', err);
      setTicketError('Failed to submit ticket. Please try again.');
    } finally {
      setTicketSending(false);
    }
  };

  return (
    <Layout title="Support Centre">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .sp-card { background:#fff; border:1px solid #f0f0f0; border-radius:16px; box-shadow:0 2px 12px rgba(0,0,0,0.05); }
        .cat-pill { cursor:pointer; padding:8px 16px; border-radius:50px; font-size:12px; font-weight:600; border:1.5px solid transparent; transition:all 0.18s; font-family:'DM Sans',sans-serif; white-space:nowrap; display:flex; align-items:center; gap:6px; }
        .cat-pill.active { background:#E8541A; color:#fff; border-color:#E8541A; }
        .cat-pill.inactive { background:#fff; color:#555; border-color:#e8e8e8; }
        .cat-pill.inactive:hover { border-color:#E8541A; color:#E8541A; }
        textarea:focus, input:focus, select:focus { outline:none; border-color:#E8541A !important; }
        @media(max-width:768px){ .sp-main-grid{ grid-template-columns:1fr !important; } .sp-contact-grid{ grid-template-columns:1fr !important; } }
      `}</style>

      <div style={{ fontFamily: "'DM Sans', sans-serif" }}>

        {/* ── Hero ── */}
        <div style={{ background: 'linear-gradient(135deg, #1a0a00 0%, #2d1200 40%, #0f1a2e 100%)', padding: '52px 24px 56px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 260, height: 260, background: 'radial-gradient(circle, rgba(232,84,26,0.18) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -60, left: -60, width: 300, height: 300, background: 'radial-gradient(circle, rgba(8,145,178,0.10) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

          <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#E8541A', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 12px' }}>Help & Support</p>
            <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 34, fontWeight: 800, color: '#fff', margin: '0 0 12px', letterSpacing: '-1px', lineHeight: 1.15 }}>
              How can we help you?
            </h1>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', margin: '0 0 28px', lineHeight: 1.65 }}>
              Search our knowledge base or browse common questions below.
            </p>

            {/* Search bar */}
            <div style={{ position: 'relative', maxWidth: 520, margin: '0 auto' }}>
              <FiSearch size={16} color="#aaa" style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search questions… e.g. 'payout', 'task reset', 'M-Pesa'"
                style={{ width: '100%', padding: '15px 18px 15px 46px', borderRadius: 50, border: '2px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: 14, fontFamily: "'DM Sans', sans-serif", backdropFilter: 'blur(8px)', transition: 'border-color 0.2s' }}
                onFocus={e => e.target.style.borderColor = '#E8541A'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            {/* Quick stats */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 28, marginTop: 28, flexWrap: 'wrap' }}>
              {[
                { icon: '⚡', label: 'Avg. response time', value: '< 2 hours' },
                { icon: '📋', label: 'FAQ articles', value: `${allQuestions.length} answers` },
                { icon: '🌍', label: 'Support coverage', value: '24 / 7' },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 18, margin: '0 0 2px' }}>{s.icon}</p>
                  <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 800, color: '#fff', margin: '0 0 2px' }}>{s.value}</p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: 0 }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 20px 60px' }}>

          {/* ── Search Results ── */}
          {searchResults && (
            <div className="sp-card" style={{ padding: '20px 24px', marginBottom: 24, animation: 'fadeIn 0.25s ease' }}>
              <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 800, color: '#111', margin: '0 0 16px' }}>
                {searchResults.length > 0 ? `${searchResults.length} result${searchResults.length !== 1 ? 's' : ''} for "${searchQuery}"` : `No results for "${searchQuery}"`}
              </p>
              {searchResults.length > 0 ? searchResults.map((item, i) => (
                <FAQItem key={i} q={item.q} a={item.a} accent={item.accent} />
              )) : (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <p style={{ fontSize: 32, marginBottom: 8 }}>🔍</p>
                  <p style={{ fontSize: 14, color: '#888', marginBottom: 16 }}>No articles found. Try different keywords or submit a support ticket below.</p>
                </div>
              )}
            </div>
          )}

          {/* ── Main grid: FAQ + Contact ── */}
          {!searchResults && (
            <div className="sp-main-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>

              {/* ── FAQ ── */}
              <div>
                {/* Category pills */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                  {FAQ_CATEGORIES.map(cat => (
                    <button key={cat.id} className={`cat-pill ${activeCategory === cat.id ? 'active' : 'inactive'}`} onClick={() => setActiveCategory(cat.id)}>
                      {cat.icon} {cat.label}
                    </button>
                  ))}
                </div>

                {/* FAQ list */}
                <div className="sp-card" style={{ padding: '8px 24px 4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 0 14px', borderBottom: '1px solid #f5f5f5' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 9, background: currentCat?.colorLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: currentCat?.color }}>
                      {currentCat?.icon}
                    </div>
                    <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 800, color: '#111', margin: 0 }}>
                      {currentCat?.label}
                    </h2>
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#bbb', background: '#f5f5f5', padding: '2px 9px', borderRadius: 20, marginLeft: 'auto' }}>
                      {currentCat?.questions.length} articles
                    </span>
                  </div>
                  {currentCat?.questions.map((item, i) => (
                    <FAQItem key={i} q={item.q} a={item.a} accent={currentCat.color} />
                  ))}
                </div>
              </div>

              {/* ── Sidebar ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Contact options */}
                <div className="sp-card" style={{ padding: '20px' }}>
                  <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 800, color: '#111', margin: '0 0 16px' }}>
                    Still need help?
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                      {
                        icon: <FiMail size={16} color="#E8541A" />,
                        title: 'Email Support',
                        desc: 'support@earnflex.com',
                        sub: 'Response within 2 hours',
                        bg: '#fff7ed',
                        action: () => window.location.href = 'mailto:support@earnflex.com',
                      },
                      {
                        icon: <FiMessageCircle size={16} color="#7C3AED" />,
                        title: 'Live Chat',
                        desc: 'Chat with our team',
                        sub: 'Available 24/7',
                        bg: '#f5f3ff',
                        action: () => {},
                      },
                    ].map((item, i) => (
                      <button key={i} onClick={item.action} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: item.bg, border: '1px solid #f0f0f0', borderRadius: 12, cursor: 'pointer', textAlign: 'left', width: '100%', fontFamily: "'DM Sans', sans-serif", transition: 'transform 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                      >
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                          {item.icon}
                        </div>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 700, color: '#111', margin: 0 }}>{item.title}</p>
                          <p style={{ fontSize: 12, color: '#555', margin: '1px 0 0' }}>{item.desc}</p>
                          <p style={{ fontSize: 10, color: '#aaa', margin: '1px 0 0' }}>{item.sub}</p>
                        </div>
                        <FiArrowRight size={13} color="#ccc" style={{ marginLeft: 'auto', flexShrink: 0 }} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Response time notice */}
                <div style={{ padding: '14px 16px', background: 'rgba(5,150,105,0.06)', border: '1px solid rgba(5,150,105,0.15)', borderRadius: 14, display: 'flex', gap: 10 }}>
                  <FiClock size={14} color="#059669" style={{ flexShrink: 0, marginTop: 1 }} />
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#059669', margin: '0 0 2px' }}>Fast Response Times</p>
                    <p style={{ fontSize: 11, color: '#065f46', margin: 0, lineHeight: 1.5 }}>Payout and account issues are prioritised and typically resolved within 2 business hours.</p>
                  </div>
                </div>

                {/* Quick links */}
                <div className="sp-card" style={{ padding: '16px 18px' }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 12px' }}>Quick Links</p>
                  {[
                    { label: 'View your earnings',     path: '/dashboard' },
                    { label: 'Update payment details', path: '/withdraw' },
                    { label: 'Browse tasks',           path: '/tasks' },
                    { label: 'Manage subscription',    path: '/subscription' },
                    { label: 'Account settings',       path: '/profile' },
                  ].map(({ label, path }) => (
                    <button key={path} onClick={() => router.push(path)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '9px 0', background: 'none', border: 'none', borderBottom: '1px solid #f8f8f8', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif', fontSize: 13, fontWeight: 600, color: '#444'" }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#444' }}>{label}</span>
                      <FiArrowRight size={12} color="#ccc" />
                    </button>
                  ))}
                </div>

              </div>
            </div>
          )}

          {/* ── Submit a Ticket ── */}
          <div className="sp-card" style={{ padding: '28px 28px', marginTop: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiSend size={18} color="#E8541A" />
              </div>
              <div>
                <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 17, fontWeight: 800, color: '#111', margin: 0 }}>Submit a Support Ticket</h2>
                <p style={{ fontSize: 12, color: '#aaa', margin: 0 }}>Can't find an answer? Our team will get back to you within 2 hours.</p>
              </div>
            </div>

            {ticketSent ? (
              <div style={{ marginTop: 20, padding: '24px', background: 'rgba(5,150,105,0.06)', border: '1px solid rgba(5,150,105,0.2)', borderRadius: 16, textAlign: 'center', animation: 'fadeIn 0.3s ease' }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(5,150,105,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                  <FiCheckCircle size={24} color="#059669" />
                </div>
                <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 17, fontWeight: 800, color: '#111', margin: '0 0 8px' }}>Ticket Submitted!</h3>
                <p style={{ fontSize: 13, color: '#666', margin: '0 0 16px', lineHeight: 1.6 }}>
                  We've received your request and will respond to <strong>{ticketEmail}</strong> within 2 hours. Please check your inbox.
                </p>
                <button onClick={() => setTicketSent(false)} style={{ padding: '10px 24px', background: '#E8541A', color: '#fff', border: 'none', borderRadius: 50, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                  Submit Another Ticket
                </button>
              </div>
            ) : (
              <div style={{ marginTop: 20 }}>
                <div className="sp-contact-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  {/* Name */}
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#888', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 }}>Full Name</label>
                    <input type="text" value={ticketName} onChange={e => { setTicketName(e.target.value); setTicketError(''); }} placeholder="Your full name"
                      style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e8e8e8', borderRadius: 12, fontSize: 14, color: '#111', background: '#fafafa', fontFamily: "'DM Sans', sans-serif" }} />
                  </div>
                  {/* Email */}
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#888', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 }}>Email Address</label>
                    <input type="email" value={ticketEmail} onChange={e => { setTicketEmail(e.target.value); setTicketError(''); }} placeholder="your@email.com"
                      style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e8e8e8', borderRadius: 12, fontSize: 14, color: '#111', background: '#fafafa', fontFamily: "'DM Sans', sans-serif" }} />
                  </div>
                </div>

                {/* Category */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#888', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 }}>Issue Category</label>
                  <select value={ticketCategory} onChange={e => { setTicketCategory(e.target.value); setTicketError(''); }}
                    style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e8e8e8', borderRadius: 12, fontSize: 14, color: ticketCategory ? '#111' : '#aaa', background: '#fafafa', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer' }}>
                    <option value="" disabled>Select the category that best describes your issue…</option>
                    {TICKET_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Message */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#888', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 }}>Describe Your Issue</label>
                  <textarea rows={5} value={ticketMessage} onChange={e => { setTicketMessage(e.target.value); setTicketError(''); }}
                    placeholder="Please provide as much detail as possible — include task names, dates, amounts, and any error messages you've seen. The more detail you provide, the faster we can resolve your issue."
                    style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e8e8e8', borderRadius: 12, fontSize: 14, color: '#111', background: '#fafafa', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.65, resize: 'vertical' }} />
                  <p style={{ fontSize: 11, color: '#bbb', margin: '5px 0 0', textAlign: 'right' }}>{ticketMessage.length} characters</p>
                </div>

                {/* Error */}
                {ticketError && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#fff7ed', border: '1px solid rgba(232,84,26,0.2)', borderRadius: 10, marginBottom: 16 }}>
                    <FiAlertCircle size={14} color="#E8541A" />
                    <span style={{ fontSize: 12, color: '#92400e', fontWeight: 500 }}>{ticketError}</span>
                  </div>
                )}

                {/* Submit */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <p style={{ fontSize: 11, color: '#bbb', margin: 0, maxWidth: 360, lineHeight: 1.5 }}>
                    By submitting this form you agree to our Privacy Policy. Your ticket details are handled confidentially.
                  </p>
                  <button
                    onClick={handleTicketSubmit}
                    disabled={ticketSending}
                    style={{ padding: '12px 28px', background: ticketSending ? '#ccc' : '#E8541A', border: 'none', color: '#fff', fontSize: 14, fontWeight: 700, borderRadius: 50, cursor: ticketSending ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', gap: 8, boxShadow: ticketSending ? 'none' : '0 4px 14px rgba(232,84,26,0.25)', transition: 'background 0.2s', whiteSpace: 'nowrap' }}
                  >
                    {ticketSending
                      ? <><div style={{ width: 14, height: 14, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Submitting…</>
                      : <><FiSend size={14} /> Submit Ticket</>
                    }
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Bottom policy strip ── */}
          <div style={{ marginTop: 28, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
            {[
              { icon: '🔒', title: 'Secure & Confidential', desc: 'All support conversations are encrypted and handled by our dedicated team only.' },
              { icon: '⚡', title: 'Priority Resolution',   desc: 'Payout and account issues are flagged as high priority and resolved within 2 hours.' },
              { icon: '🌍', title: 'Global Support',        desc: 'Our support team covers all time zones. We never close.' },
              { icon: '📋', title: 'Ticket Tracking',       desc: 'Every ticket gets a reference number. We follow up until your issue is resolved.' },
            ].map((item, i) => (
              <div key={i} style={{ padding: '16px 18px', background: '#fff', border: '1px solid #f0f0f0', borderRadius: 14, boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
                <span style={{ fontSize: 22 }}>{item.icon}</span>
                <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 13, fontWeight: 800, color: '#111', margin: '8px 0 4px' }}>{item.title}</p>
                <p style={{ fontSize: 12, color: '#888', margin: 0, lineHeight: 1.55 }}>{item.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </Layout>
  );
}
