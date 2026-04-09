import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { updatePayment, updateUser } from '@/lib/userService';
import { auth, database } from '../lib/firebase';
import { ref, onValue } from 'firebase/database';
import LoanAdModal from '../components/LoanAdModal'

// ─── Inline SVG icons ─────────────────────────────────────────────────────────
const Icon = ({ d, size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const ICONS = {
  email:    "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  user:     "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z",
  phone:    "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.81 19.79 19.79 0 01.14 2.18 2 2 0 012.11 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.09a16 16 0 006 6l.56-.56a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z",
  location: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0zM12 10a1 1 0 100-2 1 1 0 000 2z",
  camera:   "M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2zM12 17a4 4 0 100-8 4 4 0 000 8z",
  edit:     "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
  check:    "M20 6L9 17l-5-5",
  x:        "M18 6L6 18M6 6l12 12",
  star:     "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  zap:      "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  calendar: "M3 9h18M3 15h18M8 3v6M16 3v6M3 6a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2z",
  lock:     "M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zM7 11V7a5 5 0 0110 0v4",
};

// ─── Reusable field styles ────────────────────────────────────────────────────
const inputStyle = {
  width: '100%', padding: '10px 14px',
  border: '1.5px solid #e8e8e8', borderRadius: 10,
  fontSize: 14, color: '#111', background: '#fafafa',
  outline: 'none', fontFamily: "'DM Sans', sans-serif",
  transition: 'border-color 0.2s',
};

const labelStyle = {
  display: 'block', fontSize: 12, fontWeight: 700,
  color: '#888', letterSpacing: '0.06em',
  textTransform: 'uppercase', marginBottom: 6,
  fontFamily: "'DM Sans', sans-serif",
};

const cardStyle = {
  background: '#fff',
  border: '1px solid #f0f0f0',
  borderRadius: 18,
  overflow: 'hidden',
  boxShadow: '0 2px 16px rgba(0,0,0,0.05)',
};

const sectionHeaderStyle = {
  padding: '18px 24px',
  borderBottom: '1px solid #f5f5f5',
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
};

// ─── Button components ────────────────────────────────────────────────────────
function OrangeBtn({ onClick, disabled, children }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: '8px 20px', borderRadius: 50, background: '#E8541A', color: '#fff',
      border: 'none', fontSize: 13, fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.6 : 1, fontFamily: "'DM Sans', sans-serif",
      display: 'inline-flex', alignItems: 'center', gap: 6,
      transition: 'background 0.18s',
    }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = '#c94412'; }}
      onMouseLeave={e => { if (!disabled) e.currentTarget.style.background = '#E8541A'; }}
    >
      {children}
    </button>
  );
}

function GhostBtn({ onClick, children }) {
  return (
    <button onClick={onClick} style={{
      padding: '8px 18px', borderRadius: 50, background: 'none',
      border: '1.5px solid #e0e0e0', color: '#555', fontSize: 13, fontWeight: 600,
      cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
      transition: 'border-color 0.18s, color 0.18s',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#E8541A'; e.currentTarget.style.color = '#E8541A'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#e0e0e0'; e.currentTarget.style.color = '#555'; }}
    >
      {children}
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { currentUser, userData } = useAuth();
  const router = useRouter();
  const [editMode, setEditMode] = useState(false);
  const [paymentEditMode, setPaymentEditMode] = useState(false);
  const [formData, setFormData] = useState({
    username: '', bio: '', phone: '', location: '',
    balance: 0, photoURL: '', mpesa: '', paypal: '',
  });
  const [paymentData, setPaymentData] = useState({ mpesaNumber: '', paypalEmail: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    const userRef = ref(database, `usersweb/${user.uid}`);
    const unsubscribe = onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setFormData({
          username: data.username || 'User',
          bio: data.bio || '',
          phone: data.phone || '',
          location: data.location || '',
          balance: data.balance || 0,
          photoURL: data.photoURL || '',
          mpesa: data.paymentMethods?.mpesa || '',
          paypal: data.paymentMethods?.paypal || '',
        });
      }
    });
    return () => unsubscribe();
  }, []);

  if (!currentUser) { router.push('/auth/login'); return null; }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentChange = (e) => {
    setPaymentData({ ...paymentData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await updateUser(formData);
      setSuccess('Profile updated successfully!');
      setEditMode(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update profile.');
      setTimeout(() => setError(''), 3000);
    } finally { setIsLoading(false); }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await updatePayment(paymentData);
      setSuccess('Payment details updated!');
      setPaymentEditMode(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update payment details.');
      setTimeout(() => setError(''), 3000);
    } finally { setIsLoading(false); }
  };

  const stats = [
    { label: 'Tasks Done',    value: userData?.tasksCompleted || 0,                      icon: ICONS.check,    color: '#E8541A' },
    { label: 'Balance',       value: `$${(formData?.balance || 0).toFixed(2)}`,           icon: ICONS.zap,      color: '#059669' },
    { label: 'Rating',        value: userData?.rating ? `${userData.rating}/5` : '—',    icon: ICONS.star,     color: '#f59e0b' },
    { label: 'Member Since',  value: userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : '—', icon: ICONS.calendar, color: '#7C3AED' },
  ];

  return (
    <Layout>
      <LoanAdModal /> 
      <Head>
        <title>{formData?.username || 'User'} | HandShake AI</title>
        <meta name="description" content="Your HandShake AI profile" />
      </Head>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        .profile-input:focus { border-color: #E8541A !important; background: #fff !important; }
        .profile-textarea:focus { border-color: #E8541A !important; background: #fff !important; }
        .link-orange { color: #E8541A; text-decoration: none; font-weight: 600; font-size: 13px; }
        .link-orange:hover { text-decoration: underline; }
        @media (max-width: 1024px) { .profile-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 640px) { .stats-grid { grid-template-columns: 1fr 1fr !important; } }
      `}</style>

      <div style={{ background: '#fafafa', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" }}>

        {/* ── Hero banner ── */}
        <div style={{
          background: 'linear-gradient(135deg, #1a0a00 0%, #2d1200 35%, #0f1a2e 70%, #0a1628 100%)',
          padding: '48px 24px 80px',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 260, height: 260, background: 'radial-gradient(circle, rgba(232,84,26,0.18) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
          <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <p style={{ color: '#E8541A', fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8, fontFamily: "'DM Sans', sans-serif" }}>My Account</p>
            <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 32, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', margin: 0 }}>
              {formData.username || 'Your'}&apos;s Profile
            </h1>
          </div>
        </div>

        {/* ── Content ── */}
        <div style={{ maxWidth: 1100, margin: '-48px auto 0', padding: '0 24px 60px', position: 'relative', zIndex: 2 }}>

          {/* Alerts */}
          {success && (
            <div style={{ marginBottom: 16, padding: '12px 18px', background: '#ecfdf5', border: '1px solid #bbf7d0', borderRadius: 12, color: '#065f46', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon d={ICONS.check} size={16} color="#059669" /> {success}
            </div>
          )}
          {error && (
            <div style={{ marginBottom: 16, padding: '12px 18px', background: '#fff7ed', border: '1px solid rgba(232,84,26,0.3)', borderRadius: 12, color: '#92400e', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon d={ICONS.x} size={16} color="#E8541A" /> {error}
            </div>
          )}

          <div className="profile-grid" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 24 }}>

            {/* ── Left Column ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Profile card */}
              <div style={cardStyle}>
                {/* Gradient header strip */}
                <div style={{ height: 80, background: 'linear-gradient(135deg, #fef3ee 0%, #fce8d8 40%, #dbeeff 100%)' }} />

                <div style={{ padding: '0 24px 24px', marginTop: -48 }}>
                  {/* Avatar */}
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                    <div style={{ position: 'relative' }}>
                      <img
                        src={formData?.photoURL || '/default-avatar.png'}
                        alt="Profile"
                        style={{ width: 88, height: 88, borderRadius: '50%', border: '4px solid #fff', objectFit: 'cover', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}
                      />
                      {editMode && (
                        <button style={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: '50%', background: '#E8541A', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                          <Icon d={ICONS.camera} size={13} color="#fff" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Name */}
                  <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    {editMode ? (
                      <input
                        type="text" name="username"
                        value={formData.username} onChange={handleChange}
                        className="profile-input"
                        style={{ ...inputStyle, textAlign: 'center', fontWeight: 700, fontSize: 16 }}
                      />
                    ) : (
                      <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 800, color: '#111', margin: '0 0 4px' }}>
                        {formData?.username || 'Your Name'}
                      </h2>
                    )}
                    <span style={{ fontSize: 12, fontWeight: 700, background: '#fff7ed', color: '#E8541A', border: '1px solid rgba(232,84,26,0.25)', padding: '3px 10px', borderRadius: 20 }}>
                      {userData?.membership || 'Basic'} Member
                    </span>
                  </div>

                  {/* Account info */}
                  <div style={{ borderTop: '1px solid #f5f5f5', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: '#bbb', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 4px' }}>Account Info</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Icon d={ICONS.email} size={15} color="#E8541A" />
                      <span style={{ fontSize: 13, color: '#555' }}>{currentUser.email}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Icon d={ICONS.calendar} size={15} color="#E8541A" />
                      <span style={{ fontSize: 13, color: '#555' }}>
                        Joined {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : '—'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats card */}
              <div style={cardStyle}>
                <div style={{ padding: '18px 24px 6px' }}>
                  <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 800, color: '#111', margin: '0 0 16px' }}>Your Stats</h3>
                </div>
                <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: '#f5f5f5' }}>
                  {stats.map((stat, i) => (
                    <div key={i} style={{ background: '#fff', padding: '16px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                        <Icon d={stat.icon} size={13} color={stat.color} />
                        <span style={{ fontSize: 11, fontWeight: 600, color: '#bbb', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{stat.label}</span>
                      </div>
                      <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 800, color: '#111', margin: 0 }}>{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* ── Right Column ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Profile Information */}
              <div style={cardStyle}>
                <div style={sectionHeaderStyle}>
                  <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 16, fontWeight: 800, color: '#111', margin: 0 }}>Profile Information</h2>
                  {editMode ? (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <GhostBtn onClick={() => setEditMode(false)}>Cancel</GhostBtn>
                      <OrangeBtn onClick={handleSubmit} disabled={isLoading}>
                        <Icon d={ICONS.check} size={13} color="#fff" />
                        {isLoading ? 'Saving…' : 'Save Changes'}
                      </OrangeBtn>
                    </div>
                  ) : (
                    <OrangeBtn onClick={() => setEditMode(true)}>
                      <Icon d={ICONS.edit} size={13} color="#fff" />
                      Edit Profile
                    </OrangeBtn>
                  )}
                </div>

                <div style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                    {/* Bio */}
                    <div>
                      <label style={labelStyle}>About</label>
                      {editMode ? (
                        <textarea
                          name="bio" rows={3} value={formData.bio} onChange={handleChange}
                          className="profile-textarea"
                          style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                          placeholder="Tell us a bit about yourself…"
                        />
                      ) : (
                        <p style={{ fontSize: 14, color: formData?.bio ? '#444' : '#bbb', lineHeight: 1.7, margin: 0 }}>
                          {formData?.bio || 'No bio added yet.'}
                        </p>
                      )}
                    </div>

                    {/* Phone + Location */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div>
                        <label style={labelStyle}>Phone</label>
                        {editMode ? (
                          <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                            className="profile-input" style={inputStyle} placeholder="+254 7XX XXX XXX" />
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Icon d={ICONS.phone} size={14} color="#E8541A" />
                            <span style={{ fontSize: 14, color: formData?.phone ? '#444' : '#bbb' }}>{formData?.phone || 'Not provided'}</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <label style={labelStyle}>Location</label>
                        {editMode ? (
                          <input type="text" name="location" value={formData.location} onChange={handleChange}
                            className="profile-input" style={inputStyle} placeholder="City, Country" />
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Icon d={ICONS.location} size={14} color="#E8541A" />
                            <span style={{ fontSize: 14, color: formData?.location ? '#444' : '#bbb' }}>{formData?.location || 'Not specified'}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Membership */}
                    <div>
                      <label style={labelStyle}>Membership Level</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, background: '#fff7ed', color: '#E8541A', border: '1px solid rgba(232,84,26,0.25)', padding: '4px 12px', borderRadius: 20 }}>
                          {userData?.membership || 'Basic'}
                        </span>
                        <Link href="/membership" className="link-orange">Upgrade →</Link>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div style={cardStyle}>
                <div style={sectionHeaderStyle}>
                  <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 16, fontWeight: 800, color: '#111', margin: 0 }}>Payment Methods</h2>
                  {paymentEditMode ? (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <GhostBtn onClick={() => setPaymentEditMode(false)}>Cancel</GhostBtn>
                      <OrangeBtn onClick={handlePaymentSubmit} disabled={isLoading}>
                        <Icon d={ICONS.check} size={13} color="#fff" />
                        {isLoading ? 'Saving…' : 'Save'}
                      </OrangeBtn>
                    </div>
                  ) : (
                    <OrangeBtn onClick={() => setPaymentEditMode(true)}>
                      <Icon d={ICONS.edit} size={13} color="#fff" />
                      Edit
                    </OrangeBtn>
                  )}
                </div>

                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

                  {/* M-Pesa */}
                  <div>
                    <label style={labelStyle}>M-Pesa Number</label>
                    {paymentEditMode ? (
                      <div style={{ display: 'flex', borderRadius: 10, border: '1.5px solid #e8e8e8', overflow: 'hidden', background: '#fafafa' }}>
                        <span style={{ padding: '10px 14px', background: '#f5f5f5', borderRight: '1.5px solid #e8e8e8', fontSize: 13, fontWeight: 600, color: '#888', whiteSpace: 'nowrap' }}>
                          +254
                        </span>
                        <input
                          type="tel" name="mpesaNumber"
                          value={paymentData.mpesaNumber} onChange={handlePaymentChange}
                          placeholder="7XX XXX XXX"
                          className="profile-input"
                          style={{ ...inputStyle, border: 'none', borderRadius: 0, background: 'transparent', flex: 1 }}
                        />
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 18 }}>📱</span>
                        <span style={{ fontSize: 14, color: formData?.mpesa ? '#444' : '#bbb', fontWeight: formData?.mpesa ? 600 : 400 }}>
                          {formData.mpesa || 'Not set'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* PayPal */}
                  <div>
                    <label style={labelStyle}>PayPal Email</label>
                    {paymentEditMode ? (
                      <input
                        type="email" name="paypalEmail"
                        value={paymentData.paypalEmail} onChange={handlePaymentChange}
                        className="profile-input"
                        style={inputStyle} placeholder="you@example.com"
                      />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 18 }}>💳</span>
                        <span style={{ fontSize: 14, color: formData?.paypal ? '#444' : '#bbb', fontWeight: formData?.paypal ? 600 : 400 }}>
                          {formData.paypal || 'Not set'}
                        </span>
                      </div>
                    )}
                  </div>

                </div>
              </div>

              {/* Account Settings */}
              <div style={cardStyle}>
                <div style={{ padding: '18px 24px', borderBottom: '1px solid #f5f5f5' }}>
                  <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 16, fontWeight: 800, color: '#111', margin: 0 }}>Account Settings</h2>
                </div>
                <div style={{ padding: '8px 0' }}>
                  {[
                    { label: 'Email Address', value: currentUser.email, icon: ICONS.email },
                    { label: 'Password',      value: '••••••••••',       icon: ICONS.lock  },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 24px', borderBottom: i === 0 ? '1px solid #f5f5f5' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 10, background: '#fff7ed', border: '1px solid rgba(232,84,26,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon d={item.icon} size={15} color="#E8541A" />
                        </div>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 700, color: '#111', margin: 0 }}>{item.label}</p>
                          <p style={{ fontSize: 12, color: '#aaa', margin: 0 }}>{item.value}</p>
                        </div>
                      </div>
                      <button style={{ fontSize: 13, fontWeight: 600, color: '#E8541A', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
                        onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                        onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                      >
                        Change
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
