import { FiClock, FiUsers, FiPlay, FiCheckCircle, FiLock, FiZap } from 'react-icons/fi';

const getCategoryMeta = (link = '') => {
  if (link.includes('/surveys/'))    return { icon: '📋', color: '#fb7340', light: 'rgba(232,84,26,0.2)',  border: 'rgba(232,84,26,0.35)',  label: 'Survey' };
  if (link.includes('/videos/'))     return { icon: '🎬', color: '#a78bfa', light: 'rgba(124,58,237,0.2)', border: 'rgba(124,58,237,0.35)', label: 'Video' };
  if (link.includes('/testing/'))    return { icon: '🧪', color: '#38bdf8', light: 'rgba(8,145,178,0.2)',  border: 'rgba(8,145,178,0.35)',  label: 'Testing' };
  if (link.includes('/microtasks/')) return { icon: '⚡', color: '#34d399', light: 'rgba(5,150,105,0.2)',  border: 'rgba(5,150,105,0.35)',  label: 'Micro Task' };
  if (link.includes('/ai-tasks/'))   return { icon: '🤖', color: '#fb7340', light: 'rgba(232,84,26,0.2)',  border: 'rgba(232,84,26,0.35)',  label: 'AI Task' };
  return                                    { icon: '✦',  color: '#fb7340', light: 'rgba(232,84,26,0.2)',  border: 'rgba(232,84,26,0.35)',  label: 'Task' };
};

export default function TaskCard({
  task,
  taskCompleted = false,
  isOnCooldown = false,
  isCategoryComplete = false,
  isActivated = true,
  cooldownRemaining = 0,
  formatTime,
  onStartTask,
}) {
  if (!task || typeof task.link === 'undefined') return null;

  const meta = getCategoryMeta(task.link);
  const isHardDisabled = isActivated && (isCategoryComplete || isOnCooldown || taskCompleted);

  const getStatus = () => {
    if (!isActivated)       return { label: 'Start Task',        icon: <FiPlay />,        variant: 'locked'   };
    if (isOnCooldown)       return { label: `Resets in ${formatTime ? formatTime(cooldownRemaining) : cooldownRemaining + 'm'}`, icon: <FiClock />, variant: 'cooldown' };
    if (isCategoryComplete) return { label: 'Category Complete', icon: <FiCheckCircle />, variant: 'done'     };
    if (taskCompleted)      return { label: 'Completed',         icon: <FiCheckCircle />, variant: 'done'     };
    return                         { label: 'Start Task',        icon: <FiPlay />,        variant: 'active'   };
  };

  const status = getStatus();

  // ── Bar color at top of card
  const barColor =
    taskCompleted && isActivated ? '#059669' :
    isOnCooldown  && isActivated ? 'rgba(255,255,255,0.12)' :
    meta.color;

  // ── Button style per variant
  const btnMap = {
    active:   { bg: '#E8541A',              color: '#fff',                  cursor: 'pointer',      hoverBg: '#c94412',              shadow: '0 4px 16px rgba(232,84,26,0.35)' },
    locked:   { bg: '#E8541A',              color: '#fff',                  cursor: 'pointer',      hoverBg: '#c94412',              shadow: '0 4px 16px rgba(232,84,26,0.35)' },
    done:     { bg: 'rgba(5,150,105,0.15)', color: '#34d399',               cursor: 'default',      hoverBg: 'rgba(5,150,105,0.15)', shadow: 'none' },
    cooldown: { bg: 'rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.45)', cursor: 'not-allowed', hoverBg: 'rgba(255,255,255,0.10)', shadow: 'none' },
  };
  const btn = btnMap[status.variant] || btnMap.active;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        .task-card-wrap {
          background: #1a0f07;
          border: 1px solid rgba(232,84,26,0.18);
          border-radius: 16px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          height: 100%;
          transition: box-shadow 0.2s, transform 0.2s, border-color 0.2s, background 0.2s;
        }
        .task-card-wrap:not(.disabled):hover {
          background: #221308;
          border-color: rgba(232,84,26,0.5);
          box-shadow: 0 12px 40px rgba(0,0,0,0.5);
          transform: translateY(-3px);
        }
        .task-card-wrap.disabled { opacity: 0.55; }
        .task-start-btn {
          width: 100%;
          display: flex; align-items: center; justify-content: center; gap: 7px;
          padding: 11px 16px; border-radius: 10px;
          font-size: 13px; font-weight: 700; border: none;
          letter-spacing: 0.01em;
          transition: background 0.15s, box-shadow 0.15s, transform 0.1s;
          font-family: 'DM Sans', sans-serif;
        }
        .task-start-btn.active:hover { transform: translateY(-1px); }
      `}</style>

      <div
        className={`task-card-wrap${isHardDisabled ? ' disabled' : ''}`}
      >
        {/* ── Top accent bar */}
        <div style={{ height: 3, background: barColor, flexShrink: 0 }} />

        {/* ── Body */}
        <div style={{ padding: '18px 18px 14px', flex: 1 }}>

          {/* Icon + label row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: meta.light,
                border: `1px solid ${meta.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 17, flexShrink: 0,
              }}>
                {meta.icon}
              </div>
              <span style={{
                fontSize: 10, fontWeight: 700, letterSpacing: '0.07em',
                color: meta.color, textTransform: 'uppercase',
                background: meta.light,
                border: `1px solid ${meta.border}`,
                padding: '3px 8px', borderRadius: 20,
                fontFamily: "'DM Sans', sans-serif",
              }}>
                {meta.label}
              </span>
            </div>

            {/* Status icon */}
            {taskCompleted && isActivated ? (
              <FiCheckCircle style={{ color: '#34d399', width: 16, height: 16, flexShrink: 0 }} />
            ) : isOnCooldown && isActivated ? (
              <FiClock style={{ color: 'rgba(255,255,255,0.55)', width: 16, height: 16, flexShrink: 0 }} />
            ) : !isActivated ? (
              <FiLock style={{ color: 'rgba(255,255,255,0.55)', width: 16, height: 16, flexShrink: 0 }} />
            ) : null}
          </div>

          {/* Title */}
          <h3 style={{
            fontSize: 14, fontWeight: 700,
            color: '#fff',
            lineHeight: 1.45, marginBottom: 16,
            letterSpacing: '-0.01em',
            fontFamily: "'DM Sans', sans-serif",
          }}>
            {task.title}
          </h3>

          {/* Reward row */}
          <div style={{
            display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
            marginBottom: 14, paddingBottom: 14,
            borderBottom: '1px solid rgba(255,255,255,0.12)',
          }}>
            <div>
              <div style={{
                fontSize: 26, fontWeight: 800,
                color: taskCompleted && isActivated ? '#34d399' : '#E8541A',
                letterSpacing: '-0.04em', lineHeight: 1,
                fontFamily: "'Sora', sans-serif",
              }}>
                ${task.reward.toFixed(2)}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: 500, marginTop: 3, fontFamily: "'DM Sans', sans-serif" }}>
                per completion
              </div>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 4,
              background: 'rgba(5,150,105,0.15)',
              border: '1px solid rgba(5,150,105,0.3)',
              color: '#34d399', fontSize: 11, fontWeight: 700,
              padding: '4px 9px', borderRadius: 20,
              fontFamily: "'DM Sans', sans-serif",
            }}>
              <FiZap style={{ width: 11, height: 11 }} />
              Instant pay
            </div>
          </div>

          {/* Meta row — time + completions */}
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>
              <FiClock style={{ width: 12, height: 12 }} />
              {task.time}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>
              <FiUsers style={{ width: 12, height: 12 }} />
              {task.completed.toLocaleString()} done
            </div>
          </div>
        </div>

        {/* ── Footer / Button */}
        <div style={{ padding: '10px 18px 18px' }}>
          <button
            disabled={isHardDisabled}
            className={`task-start-btn ${status.variant === 'active' || status.variant === 'locked' ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              if (!isHardDisabled && onStartTask) onStartTask(task, e);
            }}
            style={{
              background: btn.bg,
              color: btn.color,
              cursor: btn.cursor,
              boxShadow: btn.shadow,
            }}
            onMouseEnter={e => { if (btn.cursor === 'pointer') e.currentTarget.style.background = btn.hoverBg; }}
            onMouseLeave={e => { if (btn.cursor === 'pointer') e.currentTarget.style.background = btn.bg; }}
          >
            <span style={{ width: 15, height: 15, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {status.icon}
            </span>
            {status.label}
          </button>
        </div>
      </div>
    </>
  );
}
