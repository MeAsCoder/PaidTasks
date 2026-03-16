import { FiClock, FiUsers, FiPlay, FiCheckCircle, FiLock, FiTrendingUp } from 'react-icons/fi';

const getCategoryIcon = (link = '') => {
  if (link.includes('/surveys/')) return '📋';
  if (link.includes('/videos/')) return '🎬';
  if (link.includes('/testing/')) return '🧪';
  if (link.includes('/microtasks/')) return '⚡';
  if (link.includes('/ai-tasks/')) return '🤖';
  return '✦';
};

export default function TaskCard({
  task,
  taskCompleted = false,
  isOnCooldown = false,
  isCategoryComplete = false,
  isActivated = true,
  cooldownRemaining = 0,
  formatTime,
  onStartTask,  // single handler — page decides what to do
}) {
  // Guard: task must be a valid object with a link
  if (!task || typeof task.link === 'undefined') return null;

  const icon = getCategoryIcon(task.link);

  // Determine visual state — but NEVER disable the button entirely when !isActivated,
  // because clicking it should open the activation modal (handled by onStartTask in the page).
  const isHardDisabled = isActivated && (isCategoryComplete || isOnCooldown || taskCompleted);

  const getStatus = () => {
    if (!isActivated)
      return { label: 'Activate Account', icon: <FiLock className="w-4 h-4" />, btnClass: 'btn-locked', badge: null };
    if (isOnCooldown)
      return { label: `Available in ${formatTime ? formatTime(cooldownRemaining) : cooldownRemaining + 'm'}`, icon: <FiClock className="w-4 h-4" />, btnClass: 'btn-cooldown', badge: { text: 'Cooldown', cls: 'badge-cooldown' } };
    if (isCategoryComplete)
      return { label: 'Category Done', icon: <FiLock className="w-4 h-4" />, btnClass: 'btn-cooldown', badge: { text: 'Locked', cls: 'badge-cooldown' } };
    if (taskCompleted)
      return { label: 'Completed', icon: <FiCheckCircle className="w-4 h-4" />, btnClass: 'btn-done', badge: { text: 'Done', cls: 'badge-done' } };
    return { label: 'Start Task', icon: <FiPlay className="w-4 h-4" />, btnClass: 'btn-active', badge: null };
  };

  const status = getStatus();

  return (
    <>
      <style jsx>{`
        .task-card {
          background: #ffffff;
          border-radius: 16px;
          border: 1.5px solid #f0f2f5;
          overflow: hidden;
          transition: box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease;
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .task-card:not(.task-card--disabled):hover {
          box-shadow: 0 8px 32px rgba(37, 99, 235, 0.10);
          transform: translateY(-2px);
          border-color: #dbeafe;
        }
        .task-card--disabled { opacity: 0.80; }

        .card-accent { height: 4px; background: linear-gradient(90deg, #2563eb 0%, #60a5fa 100%); }
        .task-card--done .card-accent { background: linear-gradient(90deg, #059669 0%, #6ee7b7 100%); }
        .task-card--cooldown .card-accent { background: linear-gradient(90deg, #9ca3af 0%, #d1d5db 100%); }
        .task-card--ai .card-accent { background: linear-gradient(90deg, #7c3aed 0%, #a78bfa 100%); }

        .card-body { padding: 20px 20px 14px; flex: 1; }
        .card-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 12px; gap: 10px; }
        .task-icon { font-size: 22px; line-height: 1; flex-shrink: 0; margin-top: 2px; }
        .task-title { font-size: 14px; font-weight: 700; color: #111827; line-height: 1.35; flex: 1; letter-spacing: -0.01em; }

        .status-badge { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; padding: 3px 8px; border-radius: 20px; flex-shrink: 0; }
        .badge-done { background: #d1fae5; color: #065f46; }
        .badge-cooldown { background: #fef3c7; color: #92400e; }

        .reward-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
        .reward-amount { font-size: 21px; font-weight: 800; color: #1d4ed8; letter-spacing: -0.03em; }
        .reward-label { font-size: 11px; color: #6b7280; font-weight: 500; margin-top: 1px; }
        .approval-chip { display: flex; align-items: center; gap: 4px; background: #f0fdf4; border: 1px solid #bbf7d0; color: #16a34a; font-size: 11px; font-weight: 600; padding: 4px 9px; border-radius: 20px; }

        .meta-row { display: flex; gap: 14px; margin-bottom: 14px; }
        .meta-item { display: flex; align-items: center; gap: 5px; font-size: 12px; color: #6b7280; font-weight: 500; }

        .progress-bar-wrap { background: #f3f4f6; border-radius: 4px; height: 4px; margin-bottom: 0; overflow: hidden; }
        .progress-bar-fill { height: 100%; background: linear-gradient(90deg, #2563eb, #60a5fa); border-radius: 4px; transition: width 0.4s ease; }

        .card-footer { padding: 14px 20px 20px; }
        .task-btn {
          width: 100%; display: flex; align-items: center; justify-content: center; gap: 7px;
          padding: 11px 16px; border-radius: 10px; font-size: 14px; font-weight: 700;
          border: none; cursor: pointer; transition: background 0.15s ease, transform 0.1s ease, box-shadow 0.15s ease;
          letter-spacing: 0.01em;
        }
        .btn-active { background: #2563eb; color: #fff; box-shadow: 0 2px 10px rgba(37,99,235,0.25); }
        .btn-active:hover { background: #1d4ed8; transform: translateY(-1px); box-shadow: 0 4px 16px rgba(37,99,235,0.30); }
        .btn-done { background: #d1fae5; color: #065f46; cursor: default; }
        .btn-cooldown { background: #f3f4f6; color: #9ca3af; cursor: not-allowed; }
        .btn-locked { background: linear-gradient(135deg, #1e40af, #3b82f6); color: #fff; cursor: pointer; }
        .btn-locked:hover { background: linear-gradient(135deg, #1e3a8a, #2563eb); }
      `}</style>

      <div className={`task-card ${taskCompleted && isActivated ? 'task-card--done' : ''} ${(isCategoryComplete || isOnCooldown) && isActivated ? 'task-card--cooldown' : ''} ${task.link.includes('/ai-tasks/') ? 'task-card--ai' : ''} ${isHardDisabled ? 'task-card--disabled' : ''}`}>
        <div className="card-accent" />

        <div className="card-body">
          <div className="card-header">
            <span className="task-icon">{icon}</span>
            <span className="task-title">{task.title}</span>
            {status.badge && (
              <span className={`status-badge ${status.badge.cls}`}>{status.badge.text}</span>
            )}
          </div>

          <div className="reward-row">
            <div>
              <div className="reward-amount">Ksh {task.reward.toLocaleString()}</div>
              <div className="reward-label">Reward</div>
            </div>
            <div className="approval-chip">
              <FiTrendingUp className="w-3 h-3" />
              98% approval
            </div>
          </div>

          <div className="meta-row">
            <div className="meta-item"><FiClock className="w-3.5 h-3.5" />{task.time}</div>
            <div className="meta-item"><FiUsers className="w-3.5 h-3.5" />{task.completed.toLocaleString()} done</div>
          </div>

          <div className="progress-bar-wrap">
            <div className="progress-bar-fill" style={{ width: `${Math.min(100, (task.completed / 10000) * 100)}%` }} />
          </div>
        </div>

        <div className="card-footer">
          {/*
            CLICK LOGIC:
            - isHardDisabled = task is done / category cooldown (and user IS activated) → truly disabled
            - !isActivated → NOT disabled; click opens activation modal via onStartTask
            - normal active task → onStartTask routes to task page
          */}
          <button
            className={`task-btn ${status.btnClass}`}
            disabled={isHardDisabled}
            onClick={(e) => {
              e.preventDefault();
              if (!isHardDisabled && onStartTask) {
                onStartTask(task, e);
              }
            }}
          >
            {status.icon}
            {status.label}
          </button>
        </div>
      </div>
    </>
  );
}