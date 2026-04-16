import { Link, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';

const features = [
  {
    icon: '🧠',
    title: 'Spaced Repetition',
    description:
      'Our smart algorithm schedules revisions based on your confidence level — review problems right before you forget them.',
  },
  {
    icon: '📊',
    title: 'Progress Dashboard',
    description:
      'Activity heatmaps, streaks, topic breakdowns, and stats at a glance. See how far you\'ve come.',
  },
  {
    icon: '🔄',
    title: 'Revision Queue',
    description:
      'A prioritized queue of flagged, overdue, and due-today problems so you never miss a review.',
  },
  {
    icon: '🔍',
    title: 'Problem Bank',
    description:
      'Browse a curated bank of DSA, LLD, and HLD problems across platforms like LeetCode, YouTube, and more. Filter by category, difficulty, and topic.',
  },
  {
    icon: '⏱️',
    title: 'Focus Timer',
    description:
      'Built-in Pomodoro-style timer to keep your practice sessions focused and time-boxed.',
  },
  {
    icon: '📝',
    title: 'Rich Notes',
    description:
      'Capture your approach, key insights, and edge cases with a rich text editor. Perfect for future review.',
  },
  {
    icon: '📅',
    title: 'Daily Checklist',
    description:
      'Stay consistent with daily goals. Check off tasks and build the habit of deliberate practice.',
  },
  {
    icon: '📱',
    title: 'PWA & Notifications',
    description:
      'Install as a native app on any device. Get email and push reminders so you never skip a review day.',
  },
];

const steps = [
  {
    number: '01',
    title: 'Log Problems',
    description: 'Add problems you\'ve solved — from the curated bank or your own. Rate your confidence and jot down notes.',
  },
  {
    number: '02',
    title: 'Review on Schedule',
    description: 'The spaced repetition engine tells you exactly when to review. Problems you struggle with come back sooner.',
  },
  {
    number: '03',
    title: 'Master & Track',
    description: 'Watch your streaks grow, confidence rise, and topics fill in. Turn short-term cramming into lasting knowledge.',
  },
];

export default function LandingPage() {
  const token = useAuthStore((s) => s.token);
  const { theme, toggle } = useThemeStore();

  if (token) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark text-gray-900 dark:text-gray-100 transition-colors">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-surface-dark/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              AlgoLog
            </h1>
            <span className="hidden sm:inline text-xs text-gray-500 dark:text-gray-400 border-l border-gray-300 dark:border-gray-700 pl-2">
              DSA · LLD · HLD Tracker
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={toggle}
              className="rounded-lg p-2 text-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all hover:scale-110"
              title="Toggle theme"
              aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <Link
              to="/login"
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-dark transition-colors shadow-sm hover:shadow-md hover:shadow-primary/20"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Decorative gradient blobs */}
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-gradient-to-br from-primary/20 via-purple-500/10 to-pink-500/10 blur-3xl dark:from-primary/10 dark:via-purple-500/5 dark:to-pink-500/5" />

        <div className="relative mx-auto max-w-4xl px-4 pb-16 pt-20 sm:px-6 sm:pb-24 sm:pt-28 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary dark:border-primary/40 dark:bg-primary/10">
            <span className="inline-block h-2 w-2 rounded-full bg-primary animate-pulse" />
            Spaced repetition for DSA, LLD & HLD
          </div>
          <h2 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Stop forgetting the{' '}
            <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              problems you solved
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base text-gray-600 dark:text-gray-400 sm:text-lg sm:mt-6">
            AlgoLog combines a curated problem bank with a spaced repetition engine so you actually retain DSA, LLD, and HLD concepts.
            Log problems, review on schedule, and track your growth — all in one place.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto rounded-xl bg-primary px-8 py-3 text-base font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary-dark hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95"
            >
              Start Tracking — It's Free
            </Link>
            <a
              href="#features"
              className="w-full sm:w-auto rounded-xl border border-gray-300 dark:border-gray-700 px-8 py-3 text-base font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors active:scale-95"
            >
              See Features
            </a>
          </div>

          {/* Dashboard mockup */}
          <div className="relative mx-auto mt-14 sm:mt-16 max-w-3xl">
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-surface-dark shadow-2xl shadow-gray-200/50 dark:shadow-black/30 overflow-hidden">
              <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 px-4 py-3 bg-gray-50 dark:bg-gray-900/50">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400" />
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 mx-8">
                  <div className="rounded-md bg-gray-200 dark:bg-gray-800 px-3 py-1 text-xs text-gray-500 dark:text-gray-400 text-center">
                    algolog.app/dashboard
                  </div>
                </div>
              </div>
              {/* Mock dashboard content */}
              <div className="p-4 sm:p-6 space-y-4">
                {/* Welcome */}
                <div className="rounded-xl bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 dark:from-primary/20 dark:via-purple-500/20 dark:to-pink-500/20 p-4 border border-primary/20">
                  <div className="font-bold text-gray-900 dark:text-gray-100 text-sm sm:text-base">Good morning, Naman! 👋</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">5 days strong! Keep the momentum going! 🚀</div>
                </div>
                {/* Stats row */}
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
                  {[
                    { label: 'Solved', value: '47', icon: '✅' },
                    { label: 'Revised', value: '128', icon: '🔁' },
                    { label: 'Due Today', value: '3', icon: '📅' },
                    { label: 'Streak', value: '5d', icon: '🔥' },
                    { label: 'Overdue', value: '0', icon: '⚠️' },
                  ].map((s) => (
                    <div key={s.label} className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-2 sm:p-3 text-center">
                      <div className="text-base sm:text-lg">{s.icon}</div>
                      <div className="text-sm sm:text-lg font-bold text-gray-900 dark:text-gray-100">{s.value}</div>
                      <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">{s.label}</div>
                    </div>
                  ))}
                </div>
                {/* Heatmap placeholder */}
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-3 sm:p-4">
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Activity</div>
                  <div className="flex gap-1 flex-wrap">
                    {Array.from({ length: 52 }).map((_, i) => {
                      const opacity = [0, 0.15, 0.35, 0.55, 0.85][Math.floor(Math.random() * 5)];
                      return (
                        <div
                          key={i}
                          className="h-3 w-3 rounded-sm"
                          style={{
                            backgroundColor: opacity === 0
                              ? (theme === 'dark' ? '#374151' : '#e5e7eb')
                              : `rgba(127, 119, 221, ${opacity})`,
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-surface-dark">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="text-center mb-12 sm:mb-16">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">Features</h3>
            <p className="mt-2 text-2xl font-bold sm:text-3xl">Everything you need to master DSA, LLD & HLD</p>
            <p className="mt-3 text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
              Built by engineers who were tired of re-solving the same problems because they forgot them two weeks later.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="group rounded-xl border border-gray-200 dark:border-gray-800 p-5 sm:p-6 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 dark:hover:border-primary/40"
              >
                <div className="mb-3 text-3xl">{f.icon}</div>
                <h4 className="mb-2 text-base font-semibold">{f.title}</h4>
                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-gray-200 dark:border-gray-800">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="text-center mb-12 sm:mb-16">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">How It Works</h3>
            <p className="mt-2 text-2xl font-bold sm:text-3xl">Three steps to retention</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {steps.map((s) => (
              <div key={s.number} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 dark:bg-primary/20 text-xl font-bold text-primary">
                  {s.number}
                </div>
                <h4 className="mb-2 text-lg font-semibold">{s.title}</h4>
                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem showcase */}
      <section className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-surface-dark">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="text-center mb-10 sm:mb-14">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">Smart Revisions</h3>
            <p className="mt-2 text-2xl font-bold sm:text-3xl">Science-backed scheduling</p>
            <p className="mt-3 text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
              Problems you rate as low-confidence come back sooner. High-confidence ones gradually space out.
              The algorithm adapts to how well you actually know each problem.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Confidence example cards */}
            {[
              { confidence: 1, label: 'Struggled', interval: '1 day', color: 'red' },
              { confidence: 3, label: 'Decent', interval: '4 days', color: 'yellow' },
              { confidence: 4, label: 'Good', interval: '10 days', color: 'blue' },
              { confidence: 5, label: 'Nailed it', interval: '21 days', color: 'green' },
            ].map((c) => (
              <div
                key={c.confidence}
                className="flex items-center gap-4 rounded-xl border border-gray-200 dark:border-gray-800 p-4 transition-all hover:border-primary/30"
              >
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg font-bold text-lg ${
                  c.color === 'red' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                  : c.color === 'yellow' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                  : c.color === 'blue' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                }`}>
                  {c.confidence}
                </div>
                <div>
                  <div className="font-medium text-sm">{c.label}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Next review in {c.interval}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-gray-200 dark:border-gray-800">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24 text-center">
          <h3 className="text-2xl font-bold sm:text-3xl">
            Ready to stop re-solving problems?
          </h3>
          <p className="mt-3 text-gray-600 dark:text-gray-400">
            Join AlgoLog and start building lasting DSA, LLD & HLD knowledge today.
          </p>
          <Link
            to="/register"
            className="mt-8 inline-block rounded-xl bg-primary px-10 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary-dark hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95"
          >
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-surface-dark">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">AlgoLog</span>
              <span className="text-xs text-gray-400">— DSA · LLD · HLD Tracker</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="https://github.com/namansaini1463" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" aria-label="GitHub">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              </a>
              <a href="https://www.linkedin.com/in/namansaini1463/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" aria-label="LinkedIn">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            </div>
          </div>
          <div className="mt-4 text-center text-xs text-gray-400">
            Made with ❤️ by <a href="https://github.com/namansaini1463" target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">Naman</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
