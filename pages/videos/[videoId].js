import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import { FiCheck, FiClock, FiLock, FiArrowLeft, FiDollarSign, FiPlay, FiCheckCircle } from 'react-icons/fi'
import { ref, update } from 'firebase/database'
import { database } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'
import { creditEarnings } from '@/lib/earningsService'

// ─── Video data ───────────────────────────────────────────────────────────────
const videoData = {
  'product-demo': {
    id: 201, title: "Watch Product Demo", rewardUsd: 2.50,
    description: "Watch this demonstration of our latest product features and capabilities.",
    duration: 120,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  },
  'advertisement': {
    id: 202, title: "View Advertisement", rewardUsd: 2.00,
    description: "View this promotional content from our advertising partners.",
    duration: 60,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  },
  'educational': {
    id: 203, title: "Educational Content", rewardUsd: 4.50,
    description: "Learn something new with this informative educational video.",
    duration: 90,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  },
  'brand-awareness': {
    id: 204, title: "Brand Awareness Video", rewardUsd: 6.00,
    description: "This video helps build recognition for our partner brands.",
    duration: 75,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  },
  'breaking-habits': {
    id: 205, title: "Breaking Habits Video", rewardUsd: 3.00,
    description: "This video helps build awareness on breaking bad habits.",
    duration: 180,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
  },
};

const formatUsd = (n) => `$${Number(n).toFixed(2)}`;
const REQUIRED_PCT = 30; // must watch 30% to qualify

const VideoPage = () => {
  const router = useRouter();
  const { videoId } = router.query;
  const { currentUser } = useAuth();
  const videoRef = useRef(null);

  const currentVideo = videoData[videoId] || videoData['product-demo'];

  const [timeWatched,    setTimeWatched]    = useState(0);
  const [videoDuration,  setVideoDuration]  = useState(0);
  const [videoLoaded,    setVideoLoaded]    = useState(false);
  const [hasQualified,   setHasQualified]   = useState(false);
  const [isSubmitting,   setIsSubmitting]   = useState(false);
  const [categoryState,  setCategoryState]  = useState({ isCompleted: false, cooldownEnd: null });

  // Load localStorage state
  useEffect(() => {
    if (!videoId) return;
    const saved =
      JSON.parse(localStorage.getItem(`surveyCategory-${videoId}`)) ||
      JSON.parse(localStorage.getItem(`task-${currentVideo.id}`)) ||
      { isCompleted: false, cooldownEnd: null };
    setCategoryState(saved);
  }, [videoId, currentVideo.id]);

  // Cooldown ticker
  useEffect(() => {
    if (!categoryState.cooldownEnd) return;
    const t = setInterval(() => {
      if (Date.now() >= categoryState.cooldownEnd) {
        const s = { isCompleted: false, cooldownEnd: null };
        setCategoryState(s);
        localStorage.setItem(`surveyCategory-${videoId}`, JSON.stringify(s));
        localStorage.setItem(`task-${currentVideo.id}`, JSON.stringify(s));
      }
    }, 1000);
    return () => clearInterval(t);
  }, [categoryState.cooldownEnd, videoId, currentVideo.id]);

  // Qualification check
  useEffect(() => {
    const duration = videoDuration || currentVideo.duration;
    const required = duration * (REQUIRED_PCT / 100);
    setHasQualified(timeWatched >= required && duration > 0);
  }, [timeWatched, videoDuration, currentVideo.duration]);

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
      setVideoLoaded(true);
    }
  };

  const handleTimeUpdate = (e) => {
    const t = e.target.currentTime;
    if (isNaN(t) || t < 0) return;
    setTimeWatched(t);
    // Track progress in Firebase (analytics only)
    if (currentUser) {
      const dur = e.target.duration || videoDuration || currentVideo.duration;
      const pct = dur > 0 ? Math.min(100, Math.floor((t / dur) * 100)) : 0;
      update(ref(database, `usersweb/${currentUser.uid}/videos/${currentVideo.id}`), {
        lastWatched: Date.now(), progress: pct,
      }).catch(() => {});
    }
  };

  const handleVideoEnded = () => setHasQualified(true);

  // ── Submit via earningsService ─────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!hasQualified)           return;
    if (categoryState.isCompleted) return;
    if (isSubmitting)            return;
    if (!currentUser?.uid)       { alert('Please log in first.'); return; }

    setIsSubmitting(true);
    try {
      await new Promise(r => setTimeout(r, 800));

      // Single unified write → usersweb/{uid}
      await creditEarnings({
        uid:       currentUser.uid,
        taskId:    `video-${currentVideo.id}`,
        taskTitle: currentVideo.title,
        rewardUsd: currentVideo.rewardUsd,
        taskType:  'video',
      });

      const newCooldownEnd = Date.now() + 5 * 60 * 60 * 1000;
      const newState = { isCompleted: true, cooldownEnd: newCooldownEnd };
      setCategoryState(newState);
      localStorage.setItem(`surveyCategory-${videoId}`, JSON.stringify(newState));
      localStorage.setItem(`task-${currentVideo.id}`, JSON.stringify(newState));

      // Log video completion record (analytics only)
      update(ref(database, `usersweb/${currentUser.uid}/videos/${currentVideo.id}`), {
        title: currentVideo.title, rewardUsd: currentVideo.rewardUsd,
        completedAt: Date.now(), cooldownEnd: newCooldownEnd,
        status: 'completed', watchTime: timeWatched,
        totalDuration: videoDuration || currentVideo.duration,
      }).catch(() => {});

      router.push({ pathname: '/video-complete', query: { reward: currentVideo.rewardUsd, videoTitle: currentVideo.title } });
    } catch (err) {
      console.error('Video submission error:', err);
      alert('Submission failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  const actualDuration  = videoDuration || currentVideo.duration;
  const watchPct        = actualDuration > 0 ? Math.min(100, (timeWatched / actualDuration) * 100) : 0;
  const isButtonDisabled = !hasQualified || isSubmitting || categoryState.isCompleted;

  // ── Auth gate ─────────────────────────────────────────────────────────────
  if (!currentUser) return (
    <Layout title="Video Task">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>
      <div style={{ maxWidth: 440, margin: '60px auto', padding: '48px 32px', background: '#fff', borderRadius: 20, border: '1px solid #f0f0f0', textAlign: 'center', fontFamily: "'DM Sans', sans-serif", boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
        <div style={{ width: 60, height: 60, borderRadius: 16, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}><FiLock size={26} color="#E8541A" /></div>
        <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 800, color: '#111', marginBottom: 8 }}>Login Required</h2>
        <p style={{ fontSize: 14, color: '#888', marginBottom: 24, lineHeight: 1.6 }}>Please log in to watch videos and earn rewards.</p>
        <button onClick={() => router.push('/auth/login')} style={{ padding: '11px 28px', background: '#E8541A', color: '#fff', border: 'none', borderRadius: 50, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Go to Login</button>
      </div>
    </Layout>
  );

  // ── Cooldown state ────────────────────────────────────────────────────────
  if (categoryState.isCompleted && categoryState.cooldownEnd) {
    const hrs = Math.ceil((categoryState.cooldownEnd - Date.now()) / 3600000);
    return (
      <Layout title="Video Completed">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>
        <div style={{ maxWidth: 440, margin: '60px auto', padding: '48px 32px', background: '#fff', borderRadius: 20, border: '1px solid #f0f0f0', textAlign: 'center', fontFamily: "'DM Sans', sans-serif", boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <div style={{ width: 60, height: 60, borderRadius: 16, background: 'rgba(5,150,105,0.1)', border: '1.5px solid rgba(5,150,105,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}><FiCheck size={28} color="#059669" /></div>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 800, color: '#111', marginBottom: 8 }}>Video Completed!</h2>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(5,150,105,0.08)', border: '1px solid rgba(5,150,105,0.2)', borderRadius: 50, padding: '6px 16px', marginBottom: 12 }}>
            <FiDollarSign size={14} color="#059669" />
            <span style={{ fontSize: 16, fontWeight: 800, color: '#059669', fontFamily: "'Sora', sans-serif" }}>{formatUsd(currentVideo.rewardUsd)} earned!</span>
          </div>
          <p style={{ fontSize: 14, color: '#888', marginBottom: 20, lineHeight: 1.6 }}>Thank you for watching &quot;{currentVideo.title}&quot;.</p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '10px 16px', marginBottom: 24 }}>
            <FiClock size={13} color="#92400e" /><span style={{ fontSize: 13, color: '#92400e', fontWeight: 600 }}>Available again in {hrs} hour{hrs !== 1 ? 's' : ''}</span>
          </div>
          <br />
          <button onClick={() => router.push('/tasks')} style={{ padding: '11px 28px', background: '#E8541A', color: '#fff', border: 'none', borderRadius: 50, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <FiArrowLeft size={14} /> Back to Tasks
          </button>
        </div>
      </Layout>
    );
  }

  // ── Main video UI ─────────────────────────────────────────────────────────
  return (
    <Layout title={currentVideo.title}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
        video::-webkit-media-controls { background: rgba(26,10,0,0.8); }
      `}</style>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 16px 60px', fontFamily: "'DM Sans', sans-serif" }}>

        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #1a0a00 0%, #2d1200 40%, #0f1a2e 100%)', borderRadius: 18, padding: '24px 28px', marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -20, right: -20, width: 140, height: 140, background: 'radial-gradient(circle, rgba(232,84,26,0.18) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, position: 'relative', zIndex: 1 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#E8541A', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 6px' }}>🎬 Video Task</p>
              <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 800, color: '#fff', margin: '0 0 6px', lineHeight: 1.3 }}>{currentVideo.title}</h1>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: 0 }}>{currentVideo.description}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(5,150,105,0.2)', border: '1px solid rgba(5,150,105,0.35)', borderRadius: 50, padding: '8px 16px', flexShrink: 0 }}>
              <FiDollarSign size={15} color="#34d399" />
              <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 800, color: '#34d399' }}>{formatUsd(currentVideo.rewardUsd)}</span>
              <span style={{ fontSize: 11, color: 'rgba(52,211,153,0.7)', fontWeight: 500 }}>reward</span>
            </div>
          </div>
        </div>

        {/* Video player */}
        <div style={{ background: '#0d0d0d', borderRadius: 16, overflow: 'hidden', marginBottom: 20, border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 8px 40px rgba(0,0,0,0.3)' }}>
          <video
            ref={videoRef}
            controls
            style={{ width: '100%', display: 'block', maxHeight: 400 }}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleVideoEnded}
            onLoadedMetadata={handleLoadedMetadata}
          >
            <source src={currentVideo.videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Progress card */}
        <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 16, padding: '20px 22px', marginBottom: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {hasQualified
                ? <><FiCheckCircle size={16} color="#059669" /><span style={{ fontSize: 13, fontWeight: 700, color: '#059669' }}>Minimum watch time reached!</span></>
                : <><FiPlay size={14} color="#E8541A" /><span style={{ fontSize: 13, fontWeight: 600, color: '#555' }}>Watch at least {REQUIRED_PCT}% to qualify</span></>
              }
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: watchPct >= REQUIRED_PCT ? '#059669' : '#E8541A' }}>
              {watchPct.toFixed(0)}% watched
            </span>
          </div>

          {/* Watch progress bar */}
          <div style={{ height: 8, background: '#f0f0f0', borderRadius: 8, overflow: 'visible', position: 'relative', marginBottom: 8 }}>
            <div style={{ height: '100%', width: `${watchPct}%`, background: watchPct >= REQUIRED_PCT ? 'linear-gradient(90deg, #059669, #34d399)' : 'linear-gradient(90deg, #E8541A, #fb923c)', borderRadius: 8, transition: 'width 0.3s ease' }} />
            {/* 30% threshold marker */}
            <div style={{ position: 'absolute', left: `${REQUIRED_PCT}%`, top: -3, width: 2, height: 14, background: '#111', borderRadius: 1 }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#bbb' }}>
            <span>{Math.floor(timeWatched)}s watched</span>
            <span style={{ position: 'relative', left: `-${100 - REQUIRED_PCT}%` }}>↑ {REQUIRED_PCT}% goal</span>
            <span>{Math.floor(actualDuration)}s total</span>
          </div>
        </div>

        {/* Reward info */}
        <div style={{ background: hasQualified ? 'rgba(5,150,105,0.06)' : '#fafafa', border: `1px solid ${hasQualified ? 'rgba(5,150,105,0.2)' : '#f0f0f0'}`, borderRadius: 14, padding: '16px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: hasQualified ? 'rgba(5,150,105,0.1)' : '#fff7ed', border: `1px solid ${hasQualified ? 'rgba(5,150,105,0.2)' : 'rgba(232,84,26,0.15)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <FiDollarSign size={20} color={hasQualified ? '#059669' : '#E8541A'} />
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: hasQualified ? '#059669' : '#111', margin: '0 0 3px' }}>
              {hasQualified ? `You've qualified for ${formatUsd(currentVideo.rewardUsd)}!` : 'Task Reward'}
            </p>
            <p style={{ fontSize: 12, color: '#888', margin: 0 }}>
              {hasQualified
                ? 'Click "Claim Reward" below to credit your account.'
                : `Watch at least ${REQUIRED_PCT}% of the video to earn ${formatUsd(currentVideo.rewardUsd)}.`}
            </p>
          </div>
        </div>

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={isButtonDisabled}
          style={{
            width: '100%', padding: '15px', borderRadius: 50,
            background: isSubmitting ? '#aaa' : !hasQualified ? '#e0e0e0' : '#059669',
            border: 'none',
            color: !hasQualified || isSubmitting ? (isSubmitting ? '#fff' : '#aaa') : '#fff',
            fontSize: 15, fontWeight: 700,
            cursor: isButtonDisabled ? 'not-allowed' : 'pointer',
            fontFamily: "'DM Sans', sans-serif",
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'background 0.2s',
            boxShadow: !isButtonDisabled ? '0 4px 20px rgba(5,150,105,0.3)' : 'none',
          }}
        >
          {isSubmitting ? (
            <><div style={{ width: 16, height: 16, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Processing…</>
          ) : hasQualified ? (
            <><FiCheckCircle size={16} /> Claim Reward — {formatUsd(currentVideo.rewardUsd)}</>
          ) : (
            `Watch ${REQUIRED_PCT}% to Enable`
          )}
        </button>

        {/* Back link */}
        <button onClick={() => router.push('/tasks')} style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '20px auto 0', background: 'none', border: 'none', color: '#aaa', fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
          <FiArrowLeft size={13} /> Back to Tasks
        </button>

      </div>
    </Layout>
  );
};

export default VideoPage;
