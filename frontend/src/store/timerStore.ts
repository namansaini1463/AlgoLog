import { create } from 'zustand';

export type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak' | 'custom';

export interface TimerPreset {
  id: string;
  name: string;
  minutes: number;
}

interface TimerState {
  // Pomodoro settings
  pomodoroMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  sessionsBeforeLongBreak: number;

  // Current state
  mode: TimerMode;
  totalSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  completedSessions: number;

  // Custom timers
  customPresets: TimerPreset[];
  activePresetId: string | null;

  // Preferences
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  soundEnabled: boolean;

  // Actions
  setMode: (mode: TimerMode) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  tick: () => boolean; // returns true when timer completes
  skipToNext: () => void;

  // Custom timer actions
  startCustomTimer: (minutes: number, presetId?: string) => void;
  addPreset: (name: string, minutes: number) => void;
  removePreset: (id: string) => void;

  // Settings
  updateSettings: (settings: Partial<Pick<TimerState,
    'pomodoroMinutes' | 'shortBreakMinutes' | 'longBreakMinutes' |
    'sessionsBeforeLongBreak' | 'autoStartBreaks' | 'autoStartPomodoros' | 'soundEnabled'
  >>) => void;
}

function loadSettings() {
  try {
    const stored = localStorage.getItem('algolog_timer_settings');
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return {};
}

function saveSettings(state: Partial<TimerState>) {
  const toSave = {
    pomodoroMinutes: state.pomodoroMinutes,
    shortBreakMinutes: state.shortBreakMinutes,
    longBreakMinutes: state.longBreakMinutes,
    sessionsBeforeLongBreak: state.sessionsBeforeLongBreak,
    customPresets: state.customPresets,
    autoStartBreaks: state.autoStartBreaks,
    autoStartPomodoros: state.autoStartPomodoros,
    soundEnabled: state.soundEnabled,
  };
  localStorage.setItem('algolog_timer_settings', JSON.stringify(toSave));
}

const defaults = {
  pomodoroMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  sessionsBeforeLongBreak: 4,
  customPresets: [] as TimerPreset[],
  autoStartBreaks: false,
  autoStartPomodoros: false,
  soundEnabled: true,
};

const saved = loadSettings();

function getMinutesForMode(mode: TimerMode, state: TimerState): number {
  switch (mode) {
    case 'pomodoro': return state.pomodoroMinutes;
    case 'shortBreak': return state.shortBreakMinutes;
    case 'longBreak': return state.longBreakMinutes;
    default: return state.pomodoroMinutes;
  }
}

export const useTimerStore = create<TimerState>((set, get) => ({
  pomodoroMinutes: saved.pomodoroMinutes ?? defaults.pomodoroMinutes,
  shortBreakMinutes: saved.shortBreakMinutes ?? defaults.shortBreakMinutes,
  longBreakMinutes: saved.longBreakMinutes ?? defaults.longBreakMinutes,
  sessionsBeforeLongBreak: saved.sessionsBeforeLongBreak ?? defaults.sessionsBeforeLongBreak,

  mode: 'pomodoro',
  totalSeconds: (saved.pomodoroMinutes ?? defaults.pomodoroMinutes) * 60,
  remainingSeconds: (saved.pomodoroMinutes ?? defaults.pomodoroMinutes) * 60,
  isRunning: false,
  completedSessions: 0,

  customPresets: saved.customPresets ?? defaults.customPresets,
  activePresetId: null,

  autoStartBreaks: saved.autoStartBreaks ?? defaults.autoStartBreaks,
  autoStartPomodoros: saved.autoStartPomodoros ?? defaults.autoStartPomodoros,
  soundEnabled: saved.soundEnabled ?? defaults.soundEnabled,

  setMode: (mode) => {
    const state = get();
    const minutes = getMinutesForMode(mode, state);
    const seconds = minutes * 60;
    set({
      mode,
      totalSeconds: seconds,
      remainingSeconds: seconds,
      isRunning: false,
      activePresetId: null,
    });
  },

  startTimer: () => set({ isRunning: true }),
  pauseTimer: () => set({ isRunning: false }),

  resetTimer: () => {
    const state = get();
    if (state.mode === 'custom' && state.activePresetId) {
      set({ remainingSeconds: state.totalSeconds, isRunning: false });
    } else {
      const minutes = getMinutesForMode(state.mode, state);
      const seconds = minutes * 60;
      set({ totalSeconds: seconds, remainingSeconds: seconds, isRunning: false });
    }
  },

  tick: () => {
    const state = get();
    if (!state.isRunning || state.remainingSeconds <= 0) return false;

    const next = state.remainingSeconds - 1;
    if (next <= 0) {
      set({ remainingSeconds: 0, isRunning: false });
      return true; // Timer completed
    }
    set({ remainingSeconds: next });
    return false;
  },

  skipToNext: () => {
    const state = get();
    if (state.mode === 'pomodoro') {
      const newCompleted = state.completedSessions + 1;
      const isLongBreak = newCompleted % state.sessionsBeforeLongBreak === 0;
      const nextMode = isLongBreak ? 'longBreak' : 'shortBreak';
      const minutes = isLongBreak ? state.longBreakMinutes : state.shortBreakMinutes;
      const seconds = minutes * 60;
      set({
        mode: nextMode,
        completedSessions: newCompleted,
        totalSeconds: seconds,
        remainingSeconds: seconds,
        isRunning: state.autoStartBreaks,
      });
    } else if (state.mode === 'shortBreak' || state.mode === 'longBreak') {
      const seconds = state.pomodoroMinutes * 60;
      set({
        mode: 'pomodoro',
        totalSeconds: seconds,
        remainingSeconds: seconds,
        isRunning: state.autoStartPomodoros,
      });
    }
  },

  startCustomTimer: (minutes, presetId) => {
    const seconds = minutes * 60;
    set({
      mode: 'custom',
      totalSeconds: seconds,
      remainingSeconds: seconds,
      isRunning: true,
      activePresetId: presetId ?? null,
    });
  },

  addPreset: (name, minutes) => {
    const state = get();
    const preset: TimerPreset = {
      id: Date.now().toString(36),
      name,
      minutes,
    };
    const updated = { ...state, customPresets: [...state.customPresets, preset] };
    set({ customPresets: updated.customPresets });
    saveSettings(updated);
  },

  removePreset: (id) => {
    const state = get();
    const updated = { ...state, customPresets: state.customPresets.filter((p) => p.id !== id) };
    set({ customPresets: updated.customPresets });
    saveSettings(updated);
  },

  updateSettings: (settings) => {
    const state = get();
    const updated = { ...state, ...settings };
    set(settings);
    saveSettings(updated);

    // If timer is not running, update the current timer to reflect new duration
    if (!state.isRunning && state.mode !== 'custom') {
      const minutes = getMinutesForMode(state.mode, updated as TimerState);
      const seconds = minutes * 60;
      set({ totalSeconds: seconds, remainingSeconds: seconds });
    }
  },
}));
