import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { useSidebarStore } from '../../store/sidebarStore';
import { cn } from '../../utils/cn';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/problems', label: 'All Problems Solved', icon: '📋' },
  { to: '/revisions', label: 'Revision Queue', icon: '🔄' },
  { to: '/timer', label: 'Focus Timer', icon: '⏱️' },
  { to: '/browse', label: 'Browse Bank', icon: '🔍' },
  { to: '/problems/add', label: 'Log Problem', icon: '➕' },
  { to: '/settings', label: 'Settings', icon: '⚙️' },
];

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuthStore();
  const { theme, toggle } = useThemeStore();
  const { open, close } = useSidebarStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    close();
  }, [location.pathname, close]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      {/* Mobile overlay backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden transition-opacity"
          onClick={close}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-screen w-[240px] sm:w-[260px] md:w-[210px] flex-col',
          'border-r border-gray-200 bg-white shadow-xl md:shadow-none',
          'dark:border-gray-800 dark:bg-surface-dark',
          'transition-transform duration-300 ease-out',
          // Mobile: slide in/out
          open ? 'translate-x-0' : '-translate-x-full',
          // Desktop: always visible
          'md:translate-x-0'
        )}
      >
        <div className="flex items-center justify-between px-5 py-5 sm:py-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              AlgoLog
            </h1>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Problem Tracker</p>
          </div>
          {/* Close button - mobile only */}
          <button
            onClick={close}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:text-gray-400 dark:hover:text-gray-200 md:hidden transition-colors"
            aria-label="Close sidebar"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 overflow-y-auto scrollbar-thin">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary/10 text-primary dark:bg-primary/20 shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 hover:pl-4'
                )
              }
            >
              <span className="text-base">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
            </NavLink>
          ))}

          {isAdmin() && (
            <>
              <div className="my-3 border-t border-gray-200 dark:border-gray-700" />
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 hover:pl-4'
                  )
                }
              >
                <span className="text-base">⚙️</span>
                <span className="flex-1">Admin Panel</span>
              </NavLink>
            </>
          )}
        </nav>

        <div className="border-t border-gray-200 px-4 py-4 dark:border-gray-800">
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate font-medium">
              {user?.username}
            </span>
            <button
              onClick={toggle}
              className="rounded-lg p-2 text-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all hover:scale-110"
              title="Toggle theme"
              aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>
          <button
            onClick={handleLogout}
            className="w-full rounded-lg bg-gray-100 px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-all hover:shadow-sm"
          >
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
