import Layout from '../components/Layout'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/router'
import ProtectedRoute from '../components/ProtectedRoute';
import { auth } from '@/lib/firebase';
import { getUserProfile } from '@/lib/userService';
import { getEarningsSummary, getRecentActivity, getWeeklyEarnings } from '@/lib/earningsService';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => `$${Number(n || 0).toFixed(2)}`;

const TASK_TYPE_ICONS = {
  survey:   '📋',
  'ai-task':'🤖',
  video:    '🎬',
  micro:    '⚡',
  testing:  '🧪',
  task:     '✅',
};

function Dashboard() {
  const { currentUser, userData, logout } = useAuth();
  const router = useRouter();

  const [summary,    setSummary]    = useState(null);
  const [activity,   setActivity]   = useState([]);
  const [weekly,     setWeekly]     = useState([0,0,0,0,0,0,0]);
  const [userData2,  setUserData2]  = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // ── Load all data from unified earningsService ─────────────────────────────
  useEffect(() => {
    if (!currentUser?.uid) { setLoading(false); return; }

    const load = async () => {
      setLoading(true);
      try {
        const [s, a, w, profile] = await Promise.all([
          getEarningsSummary(currentUser.uid),
          getRecentActivity(currentUser.uid, 8),
          getWeeklyEarnings(currentUser.uid),
          getUserProfile(currentUser.uid).catch(() => null),
        ]);
        setSummary(s);
        setActivity(a);
        setWeekly(w);
        setUserData2(profile);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [currentUser]);

  const handleSignOut = async () => {
    try { await logout(); router.push('/auth/login'); }
    catch (err) { console.error(err); }
  };

  const displayName =
    userData?.username   ||
    userData2?.username  ||
    auth.currentUser?.displayName ||
    auth.currentUser?.email?.split('@')[0] ||
    'User';

  const membership  = userData?.membership || 'Basic';
  const nextLevel   = membership === 'Basic' ? 'Silver' : membership === 'Silver' ? 'Gold' : null;
  const completionRate = summary?.completed > 0 ? Math.min(99, Math.floor((summary.completed / (summary.completed + Math.ceil(summary.completed * 0.1))) * 100)) : 0;

  const membershipTiers = [
    { name: 'Basic',    price: 'Free',          features: ['Basic tasks', 'Limited earnings', 'Standard support'], recommended: false },
    { name: 'Silver',   price: '$9.99/month',   features: ['Higher paying tasks', 'Priority support', 'Daily bonuses'], recommended: false },
    { name: 'Gold',     price: '$19.99/month',  features: ['Premium tasks', '24/7 support', 'Weekly bonuses', 'Early access'], recommended: true },
    { name: 'Platinum', price: '$29.99/month',  features: ['All tasks', 'VIP support', 'Daily bonuses', 'Exclusive offers', 'Priority task access'], recommended: false },
  ];

  if (loading) {
    return (
      <Layout title="My Dashboard">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16, fontFamily: "'DM Sans', sans-serif" }}>
          <div style={{ width: 44, height: 44, border: '3px solid #E8541A', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <span style={{ fontSize: 14, color: '#888', fontWeight: 500 }}>Loading your dashboard…</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="My Dashboard">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        .dash-card { background: #fff; border: 1px solid #f0f0f0; border-radius: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.05); }
        .dash-btn { transition: background 0.18s, transform 0.15s; }
        .dash-btn:hover { transform: translateY(-1px); }
        .activity-row:hover { background: #fafafa; }
        @media(max-width:768px){ .stats-grid{grid-template-columns:1fr 1fr!important} .dash-grid{grid-template-columns:1fr!important} }
      `}</style>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 20px 60px', fontFamily: "'DM Sans', sans-serif" }}>

        {/* ── Page Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#E8541A', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 6px' }}>Dashboard</p>
            <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 28, fontWeight: 800, color: '#111', margin: '0 0 4px', letterSpacing: '-0.5px' }}>
              Welcome back, {displayName} 👋
            </h1>
            <p style={{ fontSize: 13, color: '#aaa', margin: 0 }}>{currentUser?.email}</p>
            <button onClick={handleSignOut} style={{ marginTop: 10, background: 'none', border: 'none', color: '#E8541A', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, padding: 0, fontFamily: "'DM Sans', sans-serif" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
              Sign Out
            </button>
          </div>

          {/* Membership badge */}
          <div className="dash-card" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#fff7ed', border: '2px solid rgba(232,84,26,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 800, color: '#E8541A' }}>
              {membership[0]}
            </div>
            <div>
              <p style={{ fontSize: 11, color: '#aaa', margin: '0 0 2px' }}>Membership</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 15, fontWeight: 800, color: '#111', fontFamily: "'Sora', sans-serif" }}>{membership}</span>
                {nextLevel && (
                  <button onClick={() => setShowUpgradeModal(true)} style={{ fontSize: 11, fontWeight: 700, background: '#E8541A', color: '#fff', border: 'none', borderRadius: 50, padding: '3px 10px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                    → {nextLevel}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats Grid ── */}
        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>

          {/* Balance */}
          <div className="dash-card" style={{ padding: '22px 20px', borderTop: '3px solid #059669' }}>
            <p style={{ fontSize: 12, color: '#aaa', fontWeight: 600, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Balance</p>
            <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 28, fontWeight: 800, color: '#059669', margin: '0 0 4px', letterSpacing: '-0.5px' }}>
              {fmt(summary?.balance)}
            </p>
            <p style={{ fontSize: 12, color: '#aaa', margin: '0 0 14px' }}>
              +{fmt(summary?.todayEarnings)} today
            </p>
            <button onClick={() => router.push('/withdraw')} className="dash-btn" style={{ fontSize: 12, fontWeight: 700, color: '#E8541A', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: "'DM Sans', sans-serif" }}>
              Withdraw →
            </button>
          </div>

          {/* Total Earned */}
          <div className="dash-card" style={{ padding: '22px 20px', borderTop: '3px solid #E8541A' }}>
            <p style={{ fontSize: 12, color: '#aaa', fontWeight: 600, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Earned</p>
            <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 28, fontWeight: 800, color: '#E8541A', margin: '0 0 4px', letterSpacing: '-0.5px' }}>
              {fmt(summary?.totalEarningsUsd)}
            </p>
            <p style={{ fontSize: 12, color: '#aaa', margin: '0 0 14px' }}>lifetime earnings</p>
            <button onClick={() => router.push('/tasks')} className="dash-btn" style={{ fontSize: 12, fontWeight: 700, color: '#E8541A', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: "'DM Sans', sans-serif" }}>
              Earn more →
            </button>
          </div>

          {/* Tasks Completed */}
          <div className="dash-card" style={{ padding: '22px 20px', borderTop: '3px solid #7C3AED' }}>
            <p style={{ fontSize: 12, color: '#aaa', fontWeight: 600, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Tasks Done</p>
            <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 28, fontWeight: 800, color: '#7C3AED', margin: '0 0 4px', letterSpacing: '-0.5px' }}>
              {summary?.completed || 0}
            </p>
            <p style={{ fontSize: 12, color: '#aaa', margin: '0 0 14px' }}>total completed</p>
            <button onClick={() => router.push('/tasks')} className="dash-btn" style={{ fontSize: 12, fontWeight: 700, color: '#E8541A', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: "'DM Sans', sans-serif" }}>
              View tasks →
            </button>
          </div>

          {/* Completion Rate */}
          <div className="dash-card" style={{ padding: '22px 20px', borderTop: '3px solid #0891B2' }}>
            <p style={{ fontSize: 12, color: '#aaa', fontWeight: 600, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Completion Rate</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              {/* Donut chart */}
              <svg width="52" height="52" viewBox="0 0 36 36" style={{ flexShrink: 0 }}>
                <path d="M18 2.0845 a15.9155 15.9155 0 0 1 0 31.831 a15.9155 15.9155 0 0 1 0-31.831" fill="none" stroke="#f0f0f0" strokeWidth="3.5"/>
                <path d="M18 2.0845 a15.9155 15.9155 0 0 1 0 31.831 a15.9155 15.9155 0 0 1 0-31.831" fill="none" stroke="#0891B2" strokeWidth="3.5" strokeDasharray={`${completionRate}, 100`} strokeLinecap="round"/>
                <text x="18" y="20.5" textAnchor="middle" style={{ fontSize: '7px', fontWeight: 800, fill: '#111', fontFamily: 'Sora, sans-serif' }}>{completionRate}%</text>
              </svg>
              <div>
                <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 800, color: '#111', margin: '0 0 2px' }}>
                  {completionRate >= 90 ? 'Excellent' : completionRate >= 75 ? 'Good' : completionRate > 0 ? 'Building' : 'New'}
                </p>
                <p style={{ fontSize: 11, color: '#aaa', margin: 0 }}>{summary?.completed || 0} total</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Grid: Activity + Chart ── */}
        <div className="dash-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

          {/* Recent Activity */}
          <div className="dash-card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid #f5f5f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 16, fontWeight: 800, color: '#111', margin: 0 }}>Recent Activity</h2>
              <button onClick={() => router.push('/tasks')} style={{ fontSize: 12, fontWeight: 600, color: '#E8541A', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                All Tasks →
              </button>
            </div>

            {activity.length > 0 ? activity.map(item => (
              <div key={item.id} className="activity-row" style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #fafafa', transition: 'background 0.15s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fff7ed', border: '1px solid rgba(232,84,26,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                    {TASK_TYPE_ICONS[item.type] || '✅'}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#111', margin: 0, lineHeight: 1.3 }}>{item.task}</p>
                    <p style={{ fontSize: 11, color: '#bbb', margin: '2px 0 0' }}>{item.date}</p>
                  </div>
                </div>
                <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 800, color: '#059669' }}>
                  +{fmt(item.amount)}
                </span>
              </div>
            )) : (
              <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <p style={{ fontSize: 32, marginBottom: 10 }}>📋</p>
                <p style={{ fontSize: 14, color: '#aaa', marginBottom: 14 }}>No activity yet</p>
                <button onClick={() => router.push('/tasks')} style={{ padding: '9px 22px', background: '#E8541A', color: '#fff', border: 'none', borderRadius: 50, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                  Start your first task
                </button>
              </div>
            )}
          </div>

          {/* Weekly Earnings Chart */}
          <div className="dash-card" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 16, fontWeight: 800, color: '#111', margin: 0 }}>Weekly Earnings</h2>
              <span style={{ fontSize: 11, color: '#bbb', fontWeight: 600 }}>Last 7 days</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8, height: 160 }}>
              {weekly.map((amount, i) => {
                const max = Math.max(...weekly, 0.01);
                const pct = (amount / max) * 100;
                const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
                const dayIdx = (new Date().getDay() - 6 + i + 7) % 7;
                const isToday = i === 6;
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    {amount > 0 && (
                      <span style={{ fontSize: 10, color: '#888', fontWeight: 600 }}>{fmt(amount)}</span>
                    )}
                    <div style={{ width: '100%', position: 'relative' }}>
                      <div style={{ height: `${Math.max(pct * 1.2, amount > 0 ? 6 : 2)}px`, background: isToday ? '#E8541A' : amount > 0 ? '#fb923c' : '#f0f0f0', borderRadius: '4px 4px 0 0', transition: 'height 0.4s ease', minHeight: 2, maxHeight: 120 }} />
                    </div>
                    <span style={{ fontSize: 10, color: isToday ? '#E8541A' : '#bbb', fontWeight: isToday ? 700 : 500 }}>{days[dayIdx]}</span>
                  </div>
                );
              })}
            </div>

            {/* Total for week */}
            <div style={{ marginTop: 20, padding: '12px 16px', background: '#fafafa', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#888', fontWeight: 600 }}>This week total</span>
              <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 800, color: '#E8541A' }}>
                {fmt(weekly.reduce((a, b) => a + b, 0))}
              </span>
            </div>
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <div className="dash-card" style={{ padding: '20px' }}>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 16, fontWeight: 800, color: '#111', margin: '0 0 16px' }}>Quick Actions</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {[
              { label: 'Take Tasks',  icon: '📋', path: '/tasks',    color: '#E8541A' },
              { label: 'Withdraw',    icon: '💸', path: '/withdraw', color: '#059669' },
              { label: 'Profile',     icon: '👤', path: '/profile',  color: '#7C3AED' },
              { label: 'Support',     icon: '💬', path: '/support',  color: '#0891B2' },
            ].map(({ label, icon, path, color }) => (
              <button key={label} onClick={() => router.push(path)} className="dash-btn" style={{ padding: '16px 12px', border: '1.5px solid #f0f0f0', borderRadius: 14, background: '#fff', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 24 }}>{icon}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#333' }}>{label}</span>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* ── Upgrade Modal ── */}
      {showUpgradeModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 20, maxWidth: 640, width: '100%', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 32px 80px rgba(0,0,0,0.2)' }}>
            <div style={{ background: 'linear-gradient(135deg, #1a0a00, #2d1200)', padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>Upgrade Membership</h2>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: 0 }}>Unlock higher-paying tasks and bonuses</p>
              </div>
              <button onClick={() => setShowUpgradeModal(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 34, height: 34, cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>×</button>
            </div>
            <div style={{ overflowY: 'auto', padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {membershipTiers.map(tier => {
                const isCurrent = membership === tier.name;
                return (
                  <div key={tier.name} style={{ border: `2px solid ${tier.recommended ? '#E8541A' : isCurrent ? '#059669' : '#f0f0f0'}`, borderRadius: 16, padding: '18px 16px', background: isCurrent ? '#f5fdf9' : '#fff', position: 'relative' }}>
                    {tier.recommended && <span style={{ position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)', background: '#E8541A', color: '#fff', fontSize: 10, fontWeight: 800, padding: '3px 12px', borderRadius: '0 0 8px 8px', whiteSpace: 'nowrap' }}>⭐ POPULAR</span>}
                    {isCurrent && <span style={{ position: 'absolute', top: 10, right: 10, background: '#059669', color: '#fff', fontSize: 9, fontWeight: 800, padding: '2px 8px', borderRadius: 20 }}>CURRENT</span>}
                    <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 16, fontWeight: 800, color: '#111', margin: tier.recommended ? '12px 0 4px' : '0 0 4px' }}>{tier.name}</h3>
                    <p style={{ fontSize: 18, fontWeight: 800, color: '#E8541A', fontFamily: "'Sora', sans-serif", margin: '0 0 12px' }}>{tier.price}</p>
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {tier.features.map((f, i) => (
                        <li key={i} style={{ display: 'flex', gap: 7, fontSize: 12, color: '#555' }}>
                          <span style={{ color: '#059669', fontWeight: 800, flexShrink: 0 }}>✓</span> {f}
                        </li>
                      ))}
                    </ul>
                    <button disabled={isCurrent} style={{ width: '100%', padding: '9px', borderRadius: 50, background: isCurrent ? '#f0f0f0' : tier.recommended ? '#E8541A' : '#fff', border: `1.5px solid ${isCurrent ? '#f0f0f0' : '#E8541A'}`, color: isCurrent ? '#aaa' : tier.recommended ? '#fff' : '#E8541A', fontSize: 12, fontWeight: 700, cursor: isCurrent ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                      {isCurrent ? 'Current Plan' : 'Upgrade'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default function ProtectedDashboard() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}
