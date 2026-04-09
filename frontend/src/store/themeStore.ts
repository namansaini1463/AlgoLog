import { create } from 'zustand';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  toggle: () => void;
}

const getInitialTheme = (): Theme => {
  const stored = localStorage.getItem('theme') as Theme | null;
  return stored || 'light';
};

export const useThemeStore = create<ThemeState>((set, get) => {
  const initial = getInitialTheme();
  // Apply on load
  if (initial === 'dark') {
    document.documentElement.classList.add('dark');
  }

  return {
    theme: initial,
    toggle: () => {
      const next = get().theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', next);
      document.documentElement.classList.toggle('dark', next === 'dark');
      set({ theme: next });
    },
  };
});
