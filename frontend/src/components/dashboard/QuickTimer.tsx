import { useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTimerStore, type TimerMode } from '../../store/timerStore';
import { showTimerNotification } from '../../services/notifications';
import Card from '../ui/Card';
import { cn } from '../../utils/cn';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function playSound() {
  try {
    const ctx = new AudioContext();
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.2 + 0.5);
      osc.start(ctx.currentTime + i * 0.2);
      osc.stop(ctx.currentTime + i * 0.2 + 0.5);
    });
  } catch { /* Audio not available */ }
}

const MODE_COLORS: Record<TimerMode, string> = {
  pomodoro: 'from-primary to-purple-600',
  shortBreak: 'from-emerald-500 to-teal-600',
  longBreak: 'from-blue-500 to-indigo-600',
  custom: 'from-amber-500 to-orange-600',
};

const MODE_LABELS: Record<TimerMode, string> = {
  pomodoro: 'Focus',
  shortBreak: 'Short Break',
  longBreak: 'Long Break',
  custom: 'Custom',
};

export default function QuickTimer() {
  const store = useTimerStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleComplete = useCallback(() => {
    if (store.soundEnabled) playSound();
    const label = store.mode === 'pomodoro' ? 'Pomodoro Session'
      : store.mode === 'shortBreak' ? 'Short Break'
        : store.mode === 'longBreak' ? 'Long Break'
          : 'Custom Timer';
    showTimerNotification(label);
    if (store.mode !== 'custom') store.skipToNext();
  }, [store]);

  useEffect(() => {
    if (store.isRunning) {
      intervalRef.current = setInterval(() => {
        const completed = store.tick();
        if (completed) handleComplete();
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [store.isRunning, store, handleComplete]);

  useEffect(() => {
    if (store.isRunning) {
      document.title = `${formatTime(store.remainingSeconds)} - AlgoLog`;
    } else {
      document.title = 'AlgoLog - DSA Progress Tracker';
    }
    return () => { document.title = 'AlgoLog - DSA Progress Tracker'; };
  }, [store.remainingSeconds, store.isRunning]);

  const progress = store.totalSeconds > 0
    ? ((store.totalSeconds - store.remainingSeconds) / store.totalSeconds) * 100
    : 0;

  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300">
          Focus Timer
        </h3>
        <Link
          to="/timer"
          className="text-xs text-primary hover:underline font-medium"
        >
          Full timer →
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {/* Compact circular timer */}
        <div className="relative flex-shrink-0">
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle
              cx="60" cy="60" r="54"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-gray-200 dark:text-gray-700"
            />
            <circle
              cx="60" cy="60" r="54"
              fill="none"
              strokeWidth="4"
              strokeLinecap="round"
              stroke="url(#quickTimerGrad)"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-linear"
              transform="rotate(-90 60 60)"
            />
            <defs>
              <linearGradient id="quickTimerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                {store.mode === 'shortBreak' ? (
                  <><stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#0d9488" /></>
                ) : store.mode === 'longBreak' ? (
                  <><stop offset="0%" stopColor="#3b82f6" /><stop offset="100%" stopColor="#4f46e5" /></>
                ) : store.mode === 'custom' ? (
                  <><stop offset="0%" stopColor="#f59e0b" /><stop offset="100%" stopColor="#ea580c" /></>
                ) : (
                  <><stop offset="0%" stopColor="#7F77DD" /><stop offset="100%" stopColor="#9333ea" /></>
                )}
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-mono font-bold text-gray-900 dark:text-gray-100 tabular-nums">
              {formatTime(store.remainingSeconds)}
            </span>
            <span className="text-[10px] text-gray-400 dark:text-gray-500">
              {MODE_LABELS[store.mode]}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex-1 space-y-2.5">
          {/* Mode pills */}
          <div className="flex flex-wrap gap-1">
            {(['pomodoro', 'shortBreak', 'longBreak'] as TimerMode[]).map((m) => (
              <button
                key={m}
                onClick={() => store.setMode(m)}
                className={cn(
                  'rounded-md px-2 py-1 text-[11px] font-medium transition-all',
                  store.mode === m
                    ? `bg-gradient-to-r ${MODE_COLORS[m]} text-white shadow-sm`
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                )}
              >
                {MODE_LABELS[m]}
              </button>
            ))}
          </div>

          {/* Play / Pause / Reset */}
          <div className="flex items-center gap-2">
            {!store.isRunning ? (
              <button
                onClick={store.startTimer}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-white transition-all active:scale-95',
                  `bg-gradient-to-r ${MODE_COLORS[store.mode]} hover:shadow-md`
                )}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                {store.remainingSeconds < store.totalSeconds ? 'Resume' : 'Start'}
              </button>
            ) : (
              <button
                onClick={store.pauseTimer}
                className="flex items-center gap-1.5 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-all active:scale-95"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
                Pause
              </button>
            )}
            <button
              onClick={store.resetTimer}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition-colors"
              title="Reset"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            {store.mode !== 'custom' && (
              <button
                onClick={store.skipToNext}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition-colors"
                title="Skip to next"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>

          {/* Session dots */}
          {store.mode !== 'custom' && (
            <div className="flex items-center gap-1.5">
              {Array.from({ length: store.sessionsBeforeLongBreak }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'w-2 h-2 rounded-full transition-all',
                    i < store.completedSessions % store.sessionsBeforeLongBreak
                      ? 'bg-primary shadow-sm'
                      : 'bg-gray-200 dark:bg-gray-700'
                  )}
                />
              ))}
              <span className="ml-1 text-[10px] text-gray-400 dark:text-gray-500">
                {store.completedSessions} done
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
