import { useState, useEffect, useRef, useCallback } from 'react';
import { useTimerStore, type TimerMode } from '../../store/timerStore';
import { showTimerNotification, requestNotificationPermission, getNotificationPermission } from '../../services/notifications';
import TopBar from '../../components/layout/TopBar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { cn } from '../../utils/cn';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function playSound() {
  try {
    const ctx = new AudioContext();
    // Play a pleasant two-tone chime
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

const MODE_TABS: { mode: TimerMode; label: string }[] = [
  { mode: 'pomodoro', label: 'Pomodoro' },
  { mode: 'shortBreak', label: 'Short Break' },
  { mode: 'longBreak', label: 'Long Break' },
];

const MODE_COLORS: Record<TimerMode, string> = {
  pomodoro: 'from-primary to-purple-600',
  shortBreak: 'from-emerald-500 to-teal-600',
  longBreak: 'from-blue-500 to-indigo-600',
  custom: 'from-amber-500 to-orange-600',
};

const MODE_BG: Record<TimerMode, string> = {
  pomodoro: 'bg-primary/10 dark:bg-primary/20 border-primary/20',
  shortBreak: 'bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-500/20',
  longBreak: 'bg-blue-500/10 dark:bg-blue-500/20 border-blue-500/20',
  custom: 'bg-amber-500/10 dark:bg-amber-500/20 border-amber-500/20',
};

export default function TimerPage() {
  const store = useTimerStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [customMinutes, setCustomMinutes] = useState('');
  const [presetName, setPresetName] = useState('');
  const [presetMinutes, setPresetMinutes] = useState('');

  // Update document title with timer
  useEffect(() => {
    if (store.isRunning) {
      document.title = `${formatTime(store.remainingSeconds)} - AlgoLog Timer`;
    } else {
      document.title = 'AlgoLog - DSA Progress Tracker';
    }
    return () => {
      document.title = 'AlgoLog - DSA Progress Tracker';
    };
  }, [store.remainingSeconds, store.isRunning]);

  const handleComplete = useCallback(() => {
    if (store.soundEnabled) playSound();

    const modeLabel = store.mode === 'pomodoro' ? 'Pomodoro Session'
      : store.mode === 'shortBreak' ? 'Short Break'
        : store.mode === 'longBreak' ? 'Long Break'
          : 'Custom Timer';

    showTimerNotification(modeLabel);

    // Auto-advance for pomodoro flow
    if (store.mode !== 'custom') {
      store.skipToNext();
    }
  }, [store]);

  // Timer tick
  useEffect(() => {
    if (store.isRunning) {
      intervalRef.current = setInterval(() => {
        const completed = store.tick();
        if (completed) handleComplete();
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [store.isRunning, store, handleComplete]);

  const progress = store.totalSeconds > 0
    ? ((store.totalSeconds - store.remainingSeconds) / store.totalSeconds) * 100
    : 0;

  const circumference = 2 * Math.PI * 140;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const handleStartCustom = () => {
    const mins = parseInt(customMinutes);
    if (mins > 0 && mins <= 999) {
      store.startCustomTimer(mins);
      setCustomMinutes('');
      setShowCustom(false);
    }
  };

  const handleAddPreset = () => {
    const mins = parseInt(presetMinutes);
    if (presetName.trim() && mins > 0 && mins <= 999) {
      store.addPreset(presetName.trim(), mins);
      setPresetName('');
      setPresetMinutes('');
    }
  };

  return (
    <div>
      <TopBar title="Focus Timer" />

      {/* Mode Tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {MODE_TABS.map(({ mode, label }) => (
          <button
            key={mode}
            onClick={() => store.setMode(mode)}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200',
              store.mode === mode
                ? `bg-gradient-to-r ${MODE_COLORS[mode]} text-white shadow-md`
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
            )}
          >
            {label}
          </button>
        ))}
        <button
          onClick={() => setShowCustom(!showCustom)}
          className={cn(
            'rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200',
            store.mode === 'custom'
              ? `bg-gradient-to-r ${MODE_COLORS.custom} text-white shadow-md`
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
          )}
        >
          Custom
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Timer */}
        <div className="lg:col-span-2">
          <Card className={cn('border', MODE_BG[store.mode])}>
            {/* Timer Display */}
            <div className="flex flex-col items-center py-6 sm:py-10">
              {/* Circular progress */}
              <div className="relative mb-6">
                <svg width="300" height="300" viewBox="0 0 300 300" className="w-56 h-56 sm:w-72 sm:h-72">
                  {/* Background circle */}
                  <circle
                    cx="150" cy="150" r="140"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    className="text-gray-200 dark:text-gray-700"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="150" cy="150" r="140"
                    fill="none"
                    strokeWidth="6"
                    strokeLinecap="round"
                    stroke="url(#timerGradient)"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-1000 ease-linear"
                    transform="rotate(-90 150 150)"
                  />
                  <defs>
                    <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      {store.mode === 'shortBreak' ? (
                        <>
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#0d9488" />
                        </>
                      ) : store.mode === 'longBreak' ? (
                        <>
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#4f46e5" />
                        </>
                      ) : store.mode === 'custom' ? (
                        <>
                          <stop offset="0%" stopColor="#f59e0b" />
                          <stop offset="100%" stopColor="#ea580c" />
                        </>
                      ) : (
                        <>
                          <stop offset="0%" stopColor="#7F77DD" />
                          <stop offset="100%" stopColor="#9333ea" />
                        </>
                      )}
                    </linearGradient>
                  </defs>
                </svg>

                {/* Time text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl sm:text-6xl font-mono font-bold text-gray-900 dark:text-gray-100 tabular-nums">
                    {formatTime(store.remainingSeconds)}
                  </span>
                  <span className="mt-2 text-sm text-gray-500 dark:text-gray-400 capitalize">
                    {store.mode === 'shortBreak' ? 'Short Break' :
                      store.mode === 'longBreak' ? 'Long Break' :
                        store.mode === 'custom' ? 'Custom Timer' : 'Focus Time'}
                  </span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3">
                {!store.isRunning ? (
                  <Button
                    size="lg"
                    onClick={() => {
                      // Request notification permission on first start
                      if (getNotificationPermission() === 'default') {
                        requestNotificationPermission();
                      }
                      store.startTimer();
                    }}
                    className={cn('min-w-[120px] bg-gradient-to-r', MODE_COLORS[store.mode])}
                  >
                    {store.remainingSeconds < store.totalSeconds ? 'Resume' : 'Start'}
                  </Button>
                ) : (
                  <Button size="lg" onClick={store.pauseTimer} variant="secondary" className="min-w-[120px]">
                    Pause
                  </Button>
                )}
                <Button size="lg" onClick={store.resetTimer} variant="ghost">
                  Reset
                </Button>
                {store.mode !== 'custom' && (
                  <Button size="lg" onClick={store.skipToNext} variant="ghost" title="Skip to next">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                  </Button>
                )}
              </div>

              {/* Session counter for Pomodoro */}
              {store.mode !== 'custom' && (
                <div className="mt-6 flex items-center gap-2">
                  {Array.from({ length: store.sessionsBeforeLongBreak }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        'w-3 h-3 rounded-full transition-all duration-300',
                        i < store.completedSessions % store.sessionsBeforeLongBreak
                          ? `bg-gradient-to-r ${MODE_COLORS.pomodoro} shadow-sm`
                          : 'bg-gray-200 dark:bg-gray-700'
                      )}
                    />
                  ))}
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                    {store.completedSessions} session{store.completedSessions !== 1 ? 's' : ''} done
                  </span>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Quick Custom Timer */}
          {showCustom && (
            <Card>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Quick Timer</h3>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Minutes"
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(e.target.value)}
                  min={1}
                  max={999}
                  className="flex-1"
                />
                <Button onClick={handleStartCustom} size="sm">Start</Button>
              </div>
              {/* Quick presets */}
              <div className="mt-3 flex flex-wrap gap-2">
                {[10, 15, 20, 30, 45, 60].map((m) => (
                  <button
                    key={m}
                    onClick={() => store.startCustomTimer(m)}
                    className="rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-amber-100 hover:text-amber-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-amber-900/30 dark:hover:text-amber-400 transition-colors"
                  >
                    {m}m
                  </button>
                ))}
              </div>
            </Card>
          )}

          {/* Saved Presets */}
          <Card>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Saved Timers</h3>
            {store.customPresets.length > 0 ? (
              <div className="space-y-2 mb-3">
                {store.customPresets.map((preset) => (
                  <div
                    key={preset.id}
                    className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-gray-800/50 px-3 py-2"
                  >
                    <button
                      onClick={() => store.startCustomTimer(preset.minutes, preset.id)}
                      className="flex-1 text-left"
                    >
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{preset.name}</span>
                      <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">{preset.minutes}m</span>
                    </button>
                    <button
                      onClick={() => store.removePreset(preset.id)}
                      className="ml-2 rounded p-1 text-gray-400 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/30 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">No saved timers yet.</p>
            )}
            <div className="space-y-2">
              <Input
                placeholder="Timer name"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
              />
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Minutes"
                  value={presetMinutes}
                  onChange={(e) => setPresetMinutes(e.target.value)}
                  min={1}
                  max={999}
                  className="flex-1"
                />
                <Button onClick={handleAddPreset} size="sm" variant="secondary">Save</Button>
              </div>
            </div>
          </Card>

          {/* Settings */}
          <Card>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex w-full items-center justify-between text-sm font-semibold text-gray-700 dark:text-gray-300"
            >
              <span>Settings</span>
              <svg
                className={cn('w-4 h-4 transition-transform', showSettings && 'rotate-180')}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showSettings && (
              <div className="mt-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Focus (min)"
                    type="number"
                    value={store.pomodoroMinutes}
                    onChange={(e) => store.updateSettings({ pomodoroMinutes: parseInt(e.target.value) || 25 })}
                    min={1}
                    max={120}
                  />
                  <Input
                    label="Short Break"
                    type="number"
                    value={store.shortBreakMinutes}
                    onChange={(e) => store.updateSettings({ shortBreakMinutes: parseInt(e.target.value) || 5 })}
                    min={1}
                    max={60}
                  />
                  <Input
                    label="Long Break"
                    type="number"
                    value={store.longBreakMinutes}
                    onChange={(e) => store.updateSettings({ longBreakMinutes: parseInt(e.target.value) || 15 })}
                    min={1}
                    max={60}
                  />
                  <Input
                    label="Sessions"
                    type="number"
                    value={store.sessionsBeforeLongBreak}
                    onChange={(e) => store.updateSettings({ sessionsBeforeLongBreak: parseInt(e.target.value) || 4 })}
                    min={1}
                    max={10}
                  />
                </div>

                <div className="space-y-2 pt-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={store.autoStartBreaks}
                      onChange={(e) => store.updateSettings({ autoStartBreaks: e.target.checked })}
                      className="rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-800"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Auto-start breaks</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={store.autoStartPomodoros}
                      onChange={(e) => store.updateSettings({ autoStartPomodoros: e.target.checked })}
                      className="rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-800"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Auto-start focus</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={store.soundEnabled}
                      onChange={(e) => store.updateSettings({ soundEnabled: e.target.checked })}
                      className="rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-800"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Sound notifications</span>
                  </label>
                </div>
              </div>
            )}
          </Card>

          {/* Tips */}
          <Card className="bg-gradient-to-br from-primary/5 to-purple-500/5 dark:from-primary/10 dark:to-purple-500/10 border-primary/10">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Pomodoro Technique</h3>
            <ul className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400">
              <li>1. Focus for 25 minutes</li>
              <li>2. Take a 5-minute break</li>
              <li>3. Every 4 sessions, take a longer break</li>
              <li>4. Stay consistent for best results!</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
