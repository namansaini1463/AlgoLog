import { create } from 'zustand';

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface DayChecklist {
  date: string; // YYYY-MM-DD
  items: ChecklistItem[];
}

interface ChecklistState {
  /** All stored days, keyed by YYYY-MM-DD */
  days: Record<string, ChecklistItem[]>;
  /** The reset time (HH:MM in 24h). Defaults to "00:00" (midnight). */
  resetTime: string;

  addItem: (text: string) => void;
  toggleItem: (id: string) => void;
  removeItem: (id: string) => void;
  editItem: (id: string, text: string) => void;
  setResetTime: (time: string) => void;

  /** Returns today's key accounting for resetTime */
  getEffectiveDate: () => string;
  /** Returns the items for "today" (after accounting for reset time) */
  getTodayItems: () => ChecklistItem[];
  /** Returns past days (most recent first), excluding today */
  getPastDays: (limit?: number) => DayChecklist[];
}

const STORAGE_KEY = 'algolog_daily_checklist';

function loadState(): { days: Record<string, ChecklistItem[]>; resetTime: string } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        days: parsed.days ?? {},
        resetTime: parsed.resetTime ?? '00:00',
      };
    }
  } catch { /* ignore */ }
  return { days: {}, resetTime: '00:00' };
}

function saveState(days: Record<string, ChecklistItem[]>, resetTime: string) {
  // Only keep the last 30 days to avoid localStorage bloat
  const sortedKeys = Object.keys(days).sort().reverse().slice(0, 30);
  const trimmed: Record<string, ChecklistItem[]> = {};
  for (const key of sortedKeys) {
    trimmed[key] = days[key];
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ days: trimmed, resetTime }));
}

/**
 * Given a reset time like "04:00", returns the effective date key.
 * If current time is before resetTime, the effective date is yesterday.
 */
function computeEffectiveDate(resetTime: string): string {
  const now = new Date();
  const [rh, rm] = resetTime.split(':').map(Number);
  const resetMinutes = rh * 60 + rm;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const effective = new Date(now);
  if (nowMinutes < resetMinutes) {
    // Before reset → still counts as "yesterday"
    effective.setDate(effective.getDate() - 1);
  }

  return effective.toISOString().slice(0, 10);
}

const initial = loadState();

export const useChecklistStore = create<ChecklistState>((set, get) => ({
  days: initial.days,
  resetTime: initial.resetTime,

  getEffectiveDate: () => computeEffectiveDate(get().resetTime),

  getTodayItems: () => {
    const dateKey = computeEffectiveDate(get().resetTime);
    return get().days[dateKey] ?? [];
  },

  getPastDays: (limit = 7) => {
    const state = get();
    const todayKey = computeEffectiveDate(state.resetTime);
    return Object.keys(state.days)
      .filter((d) => d !== todayKey)
      .sort()
      .reverse()
      .slice(0, limit)
      .map((date) => ({ date, items: state.days[date] }));
  },

  addItem: (text) => {
    const state = get();
    const dateKey = computeEffectiveDate(state.resetTime);
    const existing = state.days[dateKey] ?? [];
    const item: ChecklistItem = { id: Date.now().toString(36), text, done: false };
    const updated = { ...state.days, [dateKey]: [...existing, item] };
    set({ days: updated });
    saveState(updated, state.resetTime);
  },

  toggleItem: (id) => {
    const state = get();
    const dateKey = computeEffectiveDate(state.resetTime);
    const items = state.days[dateKey] ?? [];
    const updated = {
      ...state.days,
      [dateKey]: items.map((i) => (i.id === id ? { ...i, done: !i.done } : i)),
    };
    set({ days: updated });
    saveState(updated, state.resetTime);
  },

  removeItem: (id) => {
    const state = get();
    const dateKey = computeEffectiveDate(state.resetTime);
    const items = state.days[dateKey] ?? [];
    const updated = {
      ...state.days,
      [dateKey]: items.filter((i) => i.id !== id),
    };
    set({ days: updated });
    saveState(updated, state.resetTime);
  },

  editItem: (id, text) => {
    const state = get();
    const dateKey = computeEffectiveDate(state.resetTime);
    const items = state.days[dateKey] ?? [];
    const updated = {
      ...state.days,
      [dateKey]: items.map((i) => (i.id === id ? { ...i, text } : i)),
    };
    set({ days: updated });
    saveState(updated, state.resetTime);
  },

  setResetTime: (time) => {
    const state = get();
    set({ resetTime: time });
    saveState(state.days, time);
  },
}));
