import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// ─── Icon Components ─────────────────────────────────────────────────────────
const Icon = ({ d, size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const icons = {
  menu: "M4 6h16M4 12h16M4 18h16",
  x: "M18 6L6 18M6 6l12 12",
  arrowRight: "M5 12h14M12 5l7 7-7 7",
  check: "M20 6L9 17l-5-5",
  dollar: "M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  users: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  globe: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z",
  trending: "M23 6l-9.5 9.5-5-5L1 18",
  cpu: "M18 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM9 9h6v6H9z",
  file: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6",
  msg: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  img: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
  search: "M11 17.25a6.25 6.25 0 1 1 0-12.5 6.25 6.25 0 0 1 0 12.5zM16 16l4.5 4.5",
  clock: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 6v6l4 2",
  star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  award: "M12 15a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM8.21 13.89L7 23l5-3 5 3-1.21-9.12",
  smartphone: "M17 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zM12 18h.01",
  phone: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z",
  bell: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  zap: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  mpessa: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15h-2v-2h2v2zm0-4h-2V7h2v6z",
};

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: scrolled ? 'rgba(255,255,255,0.97)' : '#fff',
      boxShadow: scrolled ? '0 1px 20px rgba(0,0,0,0.08)' : '0 1px 0 #f0f0f0',
      transition: 'box-shadow 0.3s',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <img src="/handshakelogo.png" alt="Logo" style={{ height: 70, width: 'auto', objectFit: 'contain' }} />
        </Link>

        {/* Desktop Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 32, fontSize: 15, fontWeight: 500 }} className="desktop-nav">
          <Link href="#about" style={{ color: '#444', textDecoration: 'none' }}>About Us</Link>
          <Link href="#experts" style={{ color: '#444', textDecoration: 'none' }}>Our Experts</Link>
          <Link href="#tasks" style={{ color: '#444', textDecoration: 'none' }}>Opportunities</Link>
          <Link href="#faq" style={{ color: '#444', textDecoration: 'none' }}>FAQ</Link>
        </nav>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }} className="desktop-cta">
          <Link href="/auth/login" style={{ padding: '9px 22px', borderRadius: 50, border: '1.5px solid #222', color: '#222', fontSize: 14, fontWeight: 600, textDecoration: 'none', transition: 'background 0.2s' }}>
            Login
          </Link>
          <Link href="/tasks" style={{ padding: '9px 22px', borderRadius: 50, background: '#E8541A', color: '#fff', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
            Get Started
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button onClick={() => setMobileOpen(!mobileOpen)} style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: '#222' }} className="mobile-toggle">
          <Icon d={mobileOpen ? icons.x : icons.menu} size={26} />
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div style={{ background: '#fff', borderTop: '1px solid #f0f0f0', padding: '16px 24px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {['About Us', 'Our Experts', 'Opportunities', 'FAQ'].map(item => (
            <Link key={item} href="#" onClick={() => setMobileOpen(false)} style={{ color: '#333', fontSize: 16, fontWeight: 500, textDecoration: 'none' }}>{item}</Link>
          ))}
          <div style={{ display: 'flex', gap: 12, paddingTop: 8, borderTop: '1px solid #f0f0f0' }}>
            <Link href="/auth/login" style={{ flex: 1, textAlign: 'center', padding: '10px', borderRadius: 50, border: '1.5px solid #222', color: '#222', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>Login</Link>
            <Link href="/tasks" style={{ flex: 1, textAlign: 'center', padding: '10px', borderRadius: 50, background: '#E8541A', color: '#fff', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>View Opportunities</Link>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        @media (max-width: 768px) {
          .desktop-nav, .desktop-cta { display: none !important; }
          .mobile-toggle { display: block !important; }
        }
        nav a:hover { color: #E8541A !important; }
      `}</style>
    </header>
  );
}

// ─── Auto-Scroll Track ────────────────────────────────────────────────────────
function AutoScrollTrack({ items, renderItem, speed = 40, reverse = false }) {
  const trackRef = useRef(null);
  const animRef = useRef(null);
  const posRef = useRef(0);
  const pausedRef = useRef(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const total = track.scrollWidth / 2;

    const animate = () => {
      if (!pausedRef.current) {
        posRef.current += reverse ? -0.6 : 0.6;
        if (posRef.current >= total) posRef.current = 0;
        if (posRef.current < 0) posRef.current = total;
        track.style.transform = `translateX(${-posRef.current}px)`;
      }
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [reverse]);

  const doubled = [...items, ...items];

  return (
    <div style={{ overflow: 'hidden', width: '100%' }}
      onMouseEnter={() => pausedRef.current = true}
      onMouseLeave={() => pausedRef.current = false}>
      <div ref={trackRef} style={{ display: 'flex', gap: 20, width: 'max-content', willChange: 'transform' }}>
        {doubled.map((item, i) => (
          <div key={i} style={{ flexShrink: 0 }}>{renderItem(item, i)}</div>
        ))}
      </div>
    </div>
  );
}

// ─── Transaction Flow Component ───────────────────────────────────────────────
function TransactionFlow() {
  // Generate random transaction data with KES and rounded numbers ending with 00
  const generateTransactions = () => {
    const comments = [
      'Another satisfied member',
      'Highest paid this week!',
      '⭐ Top earner bonus!',
      'Daily task completed',
      'Weekly reward payout',
      'Survey bonus added',
      'Referral earnings',
      'Special achievement',
      'Perfect score bonus',
      'Early bird reward'
    ];

    // More realistic Kenyan prefixes
    const phonePrefixes = [
      '+254700', '+254701', '+254702', '+254703',
      '+254704', '+254705', '+254706', '+254707',
      '+254708', '+254709', // Safaricom
      '+254710', '+254711', '+254712',
      '+254730', '+254731', '+254732', // Airtel
      '+254770', '+254771'            // Telkom
    ];

    const amounts = [2500, 3500, 4500, 5500, 6500, 7500, 8500, 9500, 3500, 3000, 4000, 6000, 8000];

    // ✅ Proper masked phone generator
    const generateMaskedPhone = () => {
      const prefix = phonePrefixes[Math.floor(Math.random() * phonePrefixes.length)];

      const lastThree = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, '0');

      return `${prefix}***${lastThree}`;
    };

    const transactions = [];
    for (let i = 0; i < 25; i++) {
      const amount = amounts[Math.floor(Math.random() * amounts.length)];
      const comment = comments[Math.floor(Math.random() * comments.length)];
      const phone = generateMaskedPhone();

      transactions.push({ amount, comment, phone });
    }

    return transactions;
  };

  const [transactions] = useState(generateTransactions());

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
      padding: '12px 0',
      borderBottom: '2px solid rgba(232,84,26,0.3)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        background: 'linear-gradient(90deg, transparent, #E8541A, #ff6b3d, #E8541A, transparent)',
        animation: 'shimmer 2s infinite',
      }} />
      
      <AutoScrollTrack
        items={transactions}
        speed={25}
        renderItem={(tx) => (
          <div style={{
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(10px)',
            borderRadius: 40,
            padding: '8px 18px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            border: '1px solid rgba(232,84,26,0.3)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            fontFamily: "'DM Sans', sans-serif",
          }}>
                 

<span style={{ background: '#E8541A', color: '#fff', padding: '4px 12px', borderRadius: 30, fontSize: 13, fontWeight: 800, fontFamily: "'Sora', sans-serif" }}>
  Paid {tx.amount.toLocaleString()} KSh
</span>
<span style={{ color: '#ff6b3d', fontSize: 16, fontWeight: 600 }}> → </span>




            <span style={{ 
              color: '#e0e0e0', 
              fontSize: 13, 
              fontWeight: 500, 
              letterSpacing: '0.5px' 
            }}>
              {tx.phone}
            </span>

            <span style={{ 
              color: '#4ade80', 
              fontSize: 12, 
              fontWeight: 500,
              background: 'rgba(74,222,128,0.1)',
              padding: '3px 10px',
              borderRadius: 20,
            }}>
              • {tx.comment}
            </span>
          </div>
        )}
      />

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}

// ─── App Download Feature (exactly as per image) ───────────────────────────────
function AppDownloadSection() {
  const PLAYSTORE_URL = "https://play.google.com/store/apps/details?id=com.payingsurveys.directtompesa";

  return (
    <div style={{
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      marginTop: 20
    }}>
      <div style={{
        width: '100%',
        maxWidth: 420,
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        borderRadius: 20,
        padding: '18px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
      }}>
        
        {/* LEFT: Phone UI */}
        <div style={{
          position: 'relative',
          width: 56,
          height: 56,
          borderRadius: 16,
          background: '#E8541A',      // changed from green to orange
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          
          {/* Glow */}
          <div style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 16,
            background: '#E8541A',    // changed from green to orange
            filter: 'blur(14px)',
            opacity: 0.6,
          }} />

          {/* Phone Body */}
          <div style={{
            position: 'relative',
            width: 24,
            height: 34,
            borderRadius: 6,
            background: '#0f172a',
            border: '2px solid #fff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: 2,
            zIndex: 2
          }}>
            
            {/* Screen */}
            <div style={{
              width: '100%',
              height: 22,
              background: '#1e293b',
              borderRadius: 3,
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 1,
              padding: 2
            }}>
              {/* Fake app icons - now all orange */}
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} style={{
                  width: '100%',
                  height: '100%',
                  background: '#E8541A',   // all icons orange (previously green on odd indices)
                  borderRadius: 1
                }} />
              ))}
            </div>

            {/* Home Button */}
            <div style={{
              marginTop: 2,
              width: 6,
              height: 2,
              borderRadius: 2,
              background: '#ccc'
            }} />
          </div>
        </div>

        {/* MIDDLE: Text */}
        <div style={{
          flex: 1,
          marginLeft: 14,
        }}>
          <div style={{
            color: '#fff',
            fontSize: 16,
            fontWeight: 800,
            fontFamily: "'Sora', sans-serif",
            marginBottom: 2
          }}>
            Download Our App
          </div>
          <div style={{
            color: '#cbd5f5',
            fontSize: 13,
            fontWeight: 500
          }}>
            Get instant notifications
          </div>
        </div>

        {/* RIGHT: Button */}
        <a
          href={PLAYSTORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: '#fff',
            color: '#0f172a',
            padding: '10px 18px',
            borderRadius: 999,
            fontSize: 13,
            fontWeight: 700,
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
          }}
        >
          Get App
        </a>

      </div>
    </div>
  );
}

// ─── FAQ Section ─────────────────────────────────────────────────────────────
const faqs = [
  {
    q: "What qualifications do I need?",
    a: "We're looking for candidates with domain expertise across a wide range of fields. Minimum qualifications typically require undergraduate-level expertise. Preferred qualifications include being a graduate student, master's degree holder, or PhD candidate/graduate in the relevant domain. All candidates should demonstrate communication skills in English, though specific requirements may vary by project. We encourage you to apply even if you're uncertain about meeting every requirement."
  },
  {
    q: "What does the onboarding process look like?",
    a: "HandShake AI's onboarding process typically takes 30 to 90 minutes and includes creating your account, selecting your areas of expertise, completing skill screenings so we can match you with the right projects, and identity verification to ensure we're building a trusted community. Once you complete general onboarding, you'll proceed to project-specific onboarding, which varies by project."
  },
  {
    q: "How long do projects last?",
    a: "Project lengths vary depending on the needs of our customers. Once you complete a project, you'll have the opportunity to join additional projects."
  },
  {
    q: "What is HandShake AI?",
    a: "HandShake AI is a platform that connects experts with leading AI companies to provide human feedback that improves language learning models (LLMs). We're committed to making AI smarter, safer, and more efficient — while providing contributors with meaningful, flexible earning opportunities."
  },
  {
    q: "How much time should I expect to contribute?",
    a: "Flexibility is one of our core values at HandShake AI, which means you choose when, where, and how much you contribute. Your earnings are based on the hours you contribute each week, and you maintain complete control over your schedule with no minimum hour requirements."
  },
  {
    q: "Can I refer friends or colleagues?",
    a: "Absolutely! We welcome applications from qualified candidates and aim to provide everyone with the opportunity to contribute to the development of the next generation of AI models. We encourage referrals for candidates you can personally vouch for based on their expertise or professional experience. Once you've created an HandShake AI account, you'll be able to make referrals directly from your dashboard."
  },
  {
    q: "What do I need to apply?",
    a: "To apply you'll need: a valid ID and mobile phone from your country of residence, a current resume highlighting your expertise, and a LinkedIn profile showing your educational background and work experience."
  },
  {
    q: "What are contributors saying about HandShake AI?",
    a: "Contributors appreciate the flexibility, engaging projects, learning opportunities, strong community, and earning potential. Read the testimonials above to hear directly from our global community of earners."
  },
];

function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);
  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section id="faq" style={{ padding: '100px 24px', background: '#fff' }}>
      <style>{`
        .faq-item { border: 1px solid #e8e8e8; border-radius: 14px; margin-bottom: 10px; overflow: hidden; transition: box-shadow 0.2s; }
        .faq-item:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
        .faq-btn { width: 100%; background: none; border: none; padding: 24px 28px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; text-align: left; gap: 16px; }
        .faq-btn:focus { outline: 2px solid #E8541A; outline-offset: -2px; border-radius: 14px; }
        .faq-chevron { transition: transform 0.3s ease; flex-shrink: 0; }
        .faq-chevron.open { transform: rotate(180deg); }
        .faq-answer { overflow: hidden; transition: max-height 0.35s ease, padding 0.3s ease; }
        .faq-answer.open { max-height: 400px; }
        .faq-answer.closed { max-height: 0; }
      `}</style>

      <div style={{ maxWidth: 780, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <p style={{ color: '#E8541A', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14, fontFamily: "'DM Sans', sans-serif" }}>
            FREQUENTLY ASKED QUESTIONS
          </p>
          <h2 style={{ fontSize: 48, fontFamily: "'Sora', sans-serif", fontWeight: 800, letterSpacing: '-1.5px', color: '#0d0d0d' }}>
            FAQs
          </h2>
        </div>

        {/* Accordion */}
        {faqs.map((faq, i) => (
          <div key={i} className="faq-item">
            <button
              className="faq-btn"
              onClick={() => toggle(i)}
              aria-expanded={openIndex === i}
            >
              <span style={{
                fontSize: 17,
                fontWeight: 600,
                color: '#111',
                fontFamily: "'DM Sans', sans-serif",
                lineHeight: 1.4,
              }}>
                {faq.q}
              </span>
              <svg
                className={`faq-chevron ${openIndex === i ? 'open' : ''}`}
                width={22} height={22} viewBox="0 0 24 24"
                fill="none" stroke={openIndex === i ? '#E8541A' : '#888'}
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            <div className={`faq-answer ${openIndex === i ? 'open' : 'closed'}`}>
              <p style={{
                padding: '0 28px 24px',
                fontSize: 15,
                color: '#555',
                lineHeight: 1.8,
                fontFamily: "'DM Sans', sans-serif",
                margin: 0,
              }}>
                {faq.a}
              </p>
            </div>
          </div>
        ))}

        {/* See all FAQs link */}
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <Link href="/faq" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            fontSize: 15, fontWeight: 700, color: '#E8541A',
            textDecoration: 'none', fontFamily: "'DM Sans', sans-serif",
            borderBottom: '2px solid #E8541A', paddingBottom: 2,
          }}>
            See all FAQs
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Main Home Page ───────────────────────────────────────────────────────────
export default function Home() {
  const [activeStep, setActiveStep] = useState(0);

  const testimonials = [
    { name: "Sarah Johnson", role: "Freelance Designer", country: "🇺🇸 United States", content: "HandShake AI has completely transformed how I earn online. I made $1,200 in my first month completing simple tasks in my spare time!", earnings: "$1,200/mo" },
    { name: "Wanjiru Kamau", role: "College Student", country: "🇰🇪 Kenya", content: "HandShake AI gives me flexibility to earn around $320/month between classes. It covers all my transport and food expenses!", earnings: "$320/mo" },
    { name: "Emma Rodriguez", role: "Stay-at-Home Mom", country: "🇲🇽 Mexico", content: "I never thought I could earn real money from home. HandShake AI proved me wrong — $800 last month while taking care of my kids!", earnings: "$800/mo" },
    { name: "Kipchoge Mutai", role: "Freelance Writer", country: "🇰🇪 Kenya", content: "I complete AI data labeling and text review tasks every evening. Earning consistently has helped me save for my own business!", earnings: "$450/mo" },
    { name: "Priya Patel", role: "Digital Nomad", country: "🇮🇳 India", content: "I travel full-time and HandShake AI provides consistent income anywhere. Made $1,500 last month from beaches in Goa!", earnings: "$1,500/mo" },
    { name: "Akinyi Otieno", role: "Graphic Designer", country: "🇰🇪 Kenya", content: "The image annotation and AI feedback tasks are perfect for someone with a design background. Steady income daily.", earnings: "$380/mo" },
    { name: "Carlos Mendez", role: "Part-Time Worker", country: "🇨🇴 Colombia", content: "HandShake AI helped me cover rent when I was between jobs. Earned $1,100 last month working just 10–15 hours per week!", earnings: "$1,100/mo" },
    { name: "Fatuma Noor", role: "Teacher", country: "🇰🇪 Kenya", content: "After school hours, I do translation and survey tasks. This platform gave me a reliable second income.", earnings: "$290/mo" },
    { name: "Aisha Bah", role: "Entrepreneur", country: "🇳🇬 Nigeria", content: "I use HandShake AI to fund my startup. Consistent $1,800/month gives me financial runway to build my dream!", earnings: "$1,800/mo" },
    { name: "Thomas O'Reilly", role: "Retail Worker", country: "🇮🇪 Ireland", content: "This side hustle pays more than I expected! $2,300 last month — I'm putting it all towards buying my first home.", earnings: "$2,300/mo" },
    { name: "Yuki Tanaka", role: "Software Engineer", country: "🇯🇵 Japan", content: "I complete AI model feedback tasks in my free time. The technical tasks pay well and match my background perfectly.", earnings: "$950/mo" },
    { name: "Lerato Dlamini", role: "Marketing Graduate", country: "🇿🇦 South Africa", content: "I was job hunting and HandShake AI bridged the gap. Survey and content tasks are simple and payouts are reliable.", earnings: "$410/mo" },
  ];

  const taskCategories = [
    { icon: icons.file, title: "AI Text & Data Labeling", desc: "Help train AI by labeling datasets, classifying text, and tagging content.", pay: "Up to $20/hr", color: "#2563EB" },
    { icon: icons.msg, title: "AI Conversation Review", desc: "Rate and evaluate AI-generated responses for quality, accuracy, and tone.", pay: "Up to $25/hr", color: "#059669" },
    { icon: icons.img, title: "Image & Video Annotation", desc: "Draw bounding boxes, tag objects, and annotate visual content for ML models.", pay: "Up to $18/hr", color: "#7C3AED" },
    { icon: icons.search, title: "Search Quality Rating", desc: "Evaluate search engine results for relevance and accuracy.", pay: "Up to $22/hr", color: "#DC2626" },
    { icon: icons.cpu, title: "AI Model Testing", desc: "Test new AI tools, provide structured feedback, and identify edge cases.", pay: "Up to $30/hr", color: "#E8541A" },
    { icon: icons.globe, title: "Translation & Localization", desc: "Translate AI training content. High demand for Swahili, French, Arabic, and more.", pay: "Up to $28/hr", color: "#0891B2" },
    { icon: icons.star, title: "Content Moderation", desc: "Review and moderate user-generated content to maintain platform safety.", pay: "Up to $16/hr", color: "#B45309" },
    { icon: icons.award, title: "Survey & Research Tasks", desc: "Participate in market research studies and provide consumer insights.", pay: "Up to $15/hr", color: "#BE185D" },
  ];

  const steps = [
    { num: "01", title: "Create your profile", desc: "Set up your account in minutes. Tell us about your skills and interests." },
    { num: "02", title: "Import and review skills", desc: "Browse available opportunities matched to your expertise and availability." },
    { num: "03", title: "Verify your identity", desc: "Complete a quick identity verification to unlock all earning opportunities." },
    { num: "04", title: "Verify skills and start earning", desc: "Pass a short skill screening and begin earning immediately." },
  ];

  const stats = [
    { value: "$1.2M+", label: "Paid to Members" },
    { value: "85K+", label: "Active Earners" },
    { value: "120+", label: "Countries Supported" },
    { value: "95%", label: "Payment Success Rate" },
  ];

  const whyJoin = [
    { icon: icons.clock, title: "Opportunity on your terms", desc: "You decide when to work and how much time to commit. This flexibility lets millions earn money while controlling their schedule." },
    { icon: icons.users, title: "A community of experts", desc: "Our network brings together people from nearly every field of knowledge, united by passion for AI and meaningful work." },
    { icon: icons.award, title: "A rewarding experience", desc: "Count on competitive pay for engaging work. We provide fair policies, clear project information, and timely support." },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", color: '#111', background: '#fff' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        .hero-grad {
          background: linear-gradient(135deg, #fef3ee 0%, #fce8d8 30%, #e8f4fd 70%, #dbeeff 100%);
        }
        .task-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.1) !important; }
        .task-card { transition: transform 0.25s, box-shadow 0.25s; }
        .step-item { cursor: pointer; transition: all 0.2s; }
        .step-item:hover { background: #fef3ee; }
        .testi-card:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.12) !important; }
        .testi-card { transition: box-shadow 0.2s; }
        .cta-btn { transition: transform 0.2s, box-shadow 0.2s; }
        .cta-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(232,84,26,0.35) !important; }
        .outline-btn { transition: background 0.2s, color 0.2s; }
        .outline-btn:hover { background: #111 !important; color: #fff !important; }
        @media (max-width: 768px) {
          .hero-title { font-size: 36px !important; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
          .why-grid { grid-template-columns: 1fr !important; }
          .steps-layout { flex-direction: column !important; }
          .steps-panel { display: none !important; }
        }
      `}</style>

      <Navbar />
      
      {/* Transaction Flow at the top */}
      <TransactionFlow />

      {/* ── Hero ── */}
      <section className="hero-grad" style={{ padding: '60px 24px 80px', textAlign: 'center' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 60, flexWrap: 'wrap', justifyContent: 'center' }}>
          {/* Left side: Text content */}
          <div style={{ flex: 1, minWidth: 280, textAlign: 'center' }}>
            <div style={{ maxWidth: 500, margin: '0 auto' }}>
              <div style={{ 
                background: 'rgba(232,84,26,0.1)',
                display: 'inline-block',
                padding: '6px 16px',
                borderRadius: 30,
                marginBottom: 24,
              }}>
              <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '0.5px' }}>
              <span style={{ color: 'black' }}>Earn Real Money</span>
              <span style={{ color: '#E8541A' }}> with AI Surveys</span>
              </span>
              </div>
              <p style={{ fontSize: 13, color: '#555', marginBottom: 16, lineHeight: 1.6 }}>
                Join the most trusted survey community in Kenya. Complete tasks and get paid instantly to your M-Pesa.
              </p>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginTop: 24 }}>
                <Link href="/tasks" className="cta-btn" style={{ padding: '14px 28px', borderRadius: 50, background: '#E8541A', color: '#fff', fontSize: 15, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  Get Started for Free → <Icon d={icons.arrowRight} size={16} />
                </Link>
                <Link href="/auth/login" className="outline-btn" style={{ padding: '14px 28px', borderRadius: 50, border: '1.5px solid #222', color: '#222', fontSize: 15, fontWeight: 600, textDecoration: 'none' }}>
                  Already a member? Sign In
                </Link>
              </div>
            </div>
          </div>
          
          {/* Right side: App Download Feature (exactly as per image) */}
          <div style={{ flex: 1, minWidth: 280, display: 'flex', justifyContent: 'center' }}>
            <AppDownloadSection />
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section style={{ padding: '60px 24px', background: '#fff', borderBottom: '1px solid #f0f0f0' }}>
        <div className="stats-grid" style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0 }}>
          {stats.map((s, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '24px 16px', borderRight: i < 3 ? '1px solid #f0f0f0' : 'none' }}>
              <div style={{ fontSize: 40, fontFamily: "'Sora', sans-serif", fontWeight: 800, color: '#111', letterSpacing: '-1px' }}>{s.value}</div>
              <div style={{ fontSize: 14, color: '#777', marginTop: 6, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── About / Vision ── */}
      <section id="about" style={{ padding: '100px 24px', background: '#fff' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: '#E8541A', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 20 }}>OUR VISION</p>
          <h2 style={{ fontSize: 44, fontFamily: "'Sora', sans-serif", fontWeight: 800, letterSpacing: '-1px', marginBottom: 40, lineHeight: 1.2 }}>Why we built HandShake AI</h2>
          <p style={{ fontSize: 18, color: '#444', lineHeight: 1.8, marginBottom: 24 }}>
            HandShake AI is <strong>committed to making AI more knowledgeable, accurate, and impactful</strong> — all while providing individuals with meaningful and accessible job opportunities.
          </p>
          <p style={{ fontSize: 18, color: '#444', lineHeight: 1.8 }}>
            We&apos;ve built a <strong>best-in-class remote work platform for our contributors</strong> to provide valuable, specialized skills, and we strive to deliver a positive experience built on reliability, transparency, and flexibility.
          </p>
        </div>
      </section>

      {/* ── Why Join ── */}
      <section style={{ padding: '80px 24px', background: '#fafafa' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <p style={{ color: '#E8541A', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>WHY JOIN US</p>
            <h2 style={{ fontSize: 40, fontFamily: "'Sora', sans-serif", fontWeight: 800, letterSpacing: '-1px' }}>Our commitment to contributors</h2>
          </div>
          <div className="why-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 48 }}>
            {whyJoin.map((item, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '32px 24px' }}>
                <div style={{ width: 100, height: 100, borderRadius: '50%', background: '#fff', border: '2px solid #e8e8e8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', color: '#E8541A' }}>
                  <Icon d={item.icon} size={40} />
                </div>
                <h3 style={{ fontSize: 20, fontFamily: "'Sora', sans-serif", fontWeight: 700, marginBottom: 14 }}>{item.title}</h3>
                <p style={{ fontSize: 15, color: '#666', lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Task Categories (Auto-scroll) ── */}
      <section id="tasks" style={{ padding: '100px 0', background: '#fff', overflow: 'hidden' }}>
        <div style={{ textAlign: 'center', marginBottom: 60, padding: '0 24px' }}>
          <p style={{ color: '#E8541A', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>BECOME AN HandShake AI EXPERT</p>
          <h2 style={{ fontSize: 40, fontFamily: "'Sora', sans-serif", fontWeight: 800, letterSpacing: '-1px', marginBottom: 12 }}>
            Join our network of experts<br/>working from home
          </h2>
          <p style={{ fontSize: 16, color: '#666', maxWidth: 500, margin: '0 auto' }}>Browse task categories matched to your skills and start earning today.</p>
        </div>

        {/* Auto-scrolling row 1 */}
        <AutoScrollTrack
          items={taskCategories}
          speed={40}
          renderItem={(task) => (
            <div className="task-card" style={{
              width: 280, background: '#fafafa', border: '1px solid #ececec',
              borderRadius: 16, padding: '28px 24px', cursor: 'pointer'
            }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: `${task.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, color: task.color }}>
                <Icon d={task.icon} size={22} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, fontFamily: "'Sora', sans-serif" }}>{task.title}</h3>
              <p style={{ fontSize: 13, color: '#777', lineHeight: 1.6, marginBottom: 16 }}>{task.desc}</p>
              <span style={{ fontSize: 13, fontWeight: 700, color: task.color, background: `${task.color}12`, padding: '4px 12px', borderRadius: 20 }}>{task.pay} · Remote</span>
            </div>
          )}
        />

        <div style={{ height: 20 }} />

        {/* Auto-scrolling row 2 (reverse) */}
        <AutoScrollTrack
          items={[...taskCategories].reverse()}
          reverse={true}
          renderItem={(task) => (
            <div className="task-card" style={{
              width: 280, background: '#fafafa', border: '1px solid #ececec',
              borderRadius: 16, padding: '28px 24px', cursor: 'pointer'
            }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: `${task.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, color: task.color }}>
                <Icon d={task.icon} size={22} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, fontFamily: "'Sora', sans-serif" }}>{task.title}</h3>
              <p style={{ fontSize: 13, color: '#777', lineHeight: 1.6, marginBottom: 16 }}>{task.desc}</p>
              <span style={{ fontSize: 13, fontWeight: 700, color: task.color, background: `${task.color}12`, padding: '4px 12px', borderRadius: 20 }}>{task.pay} · Remote</span>
            </div>
          )}
        />

        <div style={{ textAlign: 'center', marginTop: 48, padding: '0 24px' }}>
          <Link href="/tasks" className="outline-btn" style={{
            display: 'inline-block', padding: '14px 48px', borderRadius: 50,
            border: '1.5px solid #222', color: '#222', fontSize: 15,
            fontWeight: 700, textDecoration: 'none'
          }}>View All Opportunities</Link>
        </div>
      </section>

      {/* ── How It Works (Steps) ── */}
      <section style={{ padding: '100px 24px', background: '#fafafa' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ color: '#E8541A', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>HOW IT WORKS</p>
            <h2 style={{ fontSize: 40, fontFamily: "'Sora', sans-serif", fontWeight: 800, letterSpacing: '-1px' }}>Start in 4 simple steps</h2>
          </div>
          <div className="steps-layout" style={{ display: 'flex', gap: 48 }}>
            {/* Steps list */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {steps.map((step, i) => (
                <div
                  key={i}
                  className="step-item"
                  onClick={() => setActiveStep(i)}
                  style={{
                    padding: '20px 24px',
                    borderRadius: 12,
                    background: activeStep === i ? '#fef3ee' : 'transparent',
                    borderLeft: activeStep === i ? '3px solid #E8541A' : '3px solid transparent',
                    display: 'flex',
                    gap: 20,
                    alignItems: 'flex-start',
                  }}
                >
                  <span style={{ fontSize: 14, fontWeight: 700, color: activeStep === i ? '#E8541A' : '#bbb', minWidth: 28, fontFamily: "'Sora', sans-serif" }}>{step.num}</span>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: activeStep === i ? '#111' : '#555', marginBottom: 4 }}>{step.title}</div>
                    {activeStep === i && <div style={{ fontSize: 14, color: '#777', lineHeight: 1.6 }}>{step.desc}</div>}
                  </div>
                </div>
              ))}
            </div>

            {/* Panel */}
            <div className="steps-panel" style={{ flex: 1, background: 'linear-gradient(135deg, #fef3ee, #fce8d8)', borderRadius: 20, padding: 40, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 300 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#E8541A', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>Step {steps[activeStep].num}</div>
                <h3 style={{ fontSize: 28, fontFamily: "'Sora', sans-serif", fontWeight: 800, marginBottom: 16, letterSpacing: '-0.5px' }}>{steps[activeStep].title}</h3>
                <p style={{ fontSize: 16, color: '#666', lineHeight: 1.7 }}>{steps[activeStep].desc}</p>
              </div>
              <Link href="/auth/register" className="cta-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 32, padding: '12px 28px', borderRadius: 50, background: '#E8541A', color: '#fff', fontSize: 15, fontWeight: 700, textDecoration: 'none', width: 'fit-content' }}>
                Start Earning <Icon d={icons.arrowRight} size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials (Auto-scroll) ── */}
      <section id="experts" style={{ padding: '100px 0', background: '#fff', overflow: 'hidden' }}>
        <div style={{ textAlign: 'center', marginBottom: 60, padding: '0 24px' }}>
          <p style={{ color: '#E8541A', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>TESTIMONIALS</p>
          <h2 style={{ fontSize: 40, fontFamily: "'Sora', sans-serif", fontWeight: 800, letterSpacing: '-1px' }}>Meet our experts</h2>
        </div>

        {/* Scrolling testimonials row */}
        <AutoScrollTrack
          items={testimonials}
          speed={35}
          renderItem={(t) => (
            <div className="testi-card" style={{
              width: 340, background: '#fff', border: '1px solid #ececec',
              borderRadius: 20, padding: '32px 28px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.05)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <span style={{ fontSize: 22, fontFamily: "'Sora', sans-serif", fontWeight: 800, color: '#E8541A', lineHeight: 1 }}>&quot;</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#059669', background: '#d1fae5', padding: '4px 12px', borderRadius: 20 }}>{t.earnings}</span>
              </div>
              <p style={{ fontSize: 15, color: '#444', lineHeight: 1.7, marginBottom: 24 }}>{t.content}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderTop: '1px solid #f5f5f5', paddingTop: 20 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#fef3ee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: '#E8541A', fontFamily: "'Sora', sans-serif", flexShrink: 0 }}>
                  {t.name[0]}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>{t.name}</div>
                  <div style={{ fontSize: 13, color: '#999' }}>{t.role} · {t.country}</div>
                </div>
              </div>
            </div>
          )}
        />
      </section>

      {/* ── FAQ ── */}
      <FAQSection />

      {/* ── Trust Bar ── */}
      <section style={{ padding: '28px 24px', background: '#111' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 32 }}>
          {["🔒 SSL Encrypted Payments", "✅ Verified Task Partners", "🌍 120+ Countries", "⚡ Payouts within 24 Hours", "🆓 Free to Join"].map((item, i) => (
            <span key={i} style={{ color: '#aaa', fontSize: 13, fontWeight: 500 }}>{item}</span>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '100px 24px', background: '#fafafa', textAlign: 'center' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h2 style={{ fontSize: 44, fontFamily: "'Sora', sans-serif", fontWeight: 800, letterSpacing: '-1px', marginBottom: 20, lineHeight: 1.2 }}>
            Ready to start earning?
          </h2>
          <p style={{ fontSize: 18, color: '#666', marginBottom: 48, lineHeight: 1.7 }}>
            Join thousands of contributors across the globe earning money on their own schedule — including right here in Kenya.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/auth/register" className="cta-btn" style={{ padding: '16px 44px', borderRadius: 50, background: '#E8541A', color: '#fff', fontSize: 16, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              Sign Up Free <Icon d={icons.arrowRight} size={18} />
            </Link>
            <Link href="/tasks" className="outline-btn" style={{ padding: '16px 44px', borderRadius: 50, border: '1.5px solid #222', color: '#222', fontSize: 16, fontWeight: 600, textDecoration: 'none' }}>
              Explore Tasks
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        background: 'linear-gradient(135deg, #fef3ee 0%, #fce8d8 30%, #e8f4fd 70%, #dbeeff 100%)',
        borderTop: '1px solid rgba(232,84,26,0.10)',
        padding: '56px 24px 36px',
        textAlign: 'center',
      }}>
        <style>{`
          .footer-link:hover { color: #E8541A !important; }
        `}</style>

        {/* Logo */}
        <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <img src="/handshakelogo.png" alt="Logo" style={{ height: 75, width: 'auto', objectFit: 'contain' }} />
        </div>
        <p style={{ marginBottom: 36, color: '#E8541A', fontSize: 11, fontWeight: 700, letterSpacing: '0.3em', fontFamily: "'DM Sans', sans-serif" }}>
          EARN · FLEX · GROW
        </p>

        {/* Nav Links */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 36, marginBottom: 40, flexWrap: 'wrap' }}>
          {[
            { label: 'About Us', href: '/about' },
            { label: 'Our Experts', href: '#experts' },
            { label: 'Opportunities', href: '/tasks' },
            { label: 'Blog', href: '/blog' },
            { label: 'FAQ', href: '#faq' },
            { label: 'Contact', href: '/contact' },
          ].map(item => (
            <Link key={item.label} href={item.href} className="footer-link" style={{
              color: '#555',
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: 500,
              fontFamily: "'DM Sans', sans-serif",
              transition: 'color 0.2s',
            }}>
              {item.label}
            </Link>
          ))}
        </div>

        {/* Divider */}
        <div style={{ width: 48, height: 2, background: 'rgba(232,84,26,0.25)', borderRadius: 2, margin: '0 auto 28px' }} />

        {/* Copyright */}
        <p style={{ fontSize: 13, color: '#999', fontFamily: "'DM Sans', sans-serif" }}>
          © {new Date().getFullYear()} HandShake AI. All rights reserved.
        </p>
      </footer>
    </div>
  );
}