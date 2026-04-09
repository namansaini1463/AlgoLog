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
  { to: '/browse', label: 'Browse Bank', icon: '🔍' },
  { to: '/problems/add', label: 'Add Problem', icon: '➕' },
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
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={close}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-screen w-[210px] flex-col border-r border-gray-200 bg-surface-light dark:border-gray-800 dark:bg-surface-dark transition-transform duration-200 ease-in-out',
          // Mobile: slide in/out
          open ? 'translate-x-0' : '-translate-x-full',
          // Desktop: always visible
          'md:translate-x-0'
        )}
      >
        <div className="flex items-center justify-between px-5 py-6">
          <div>
            <h1 className="text-xl font-bold text-primary">AlgoLog</h1>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">DSA Tracker</p>
          </div>
          {/* Close button - mobile only */}
          <button
            onClick={close}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 md:hidden"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                )
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}

          {isAdmin() && (
            <>
              <div className="my-3 border-t border-gray-200 dark:border-gray-700" />
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/20'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                  )
                }
              >
                <span>⚙️</span>
                Admin Panel
              </NavLink>
            </>
          )}
        </nav>

        <div className="border-t border-gray-200 px-4 py-4 dark:border-gray-800">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.username}</span>
            <button
              onClick={toggle}
              className="rounded-md p-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
              title="Toggle theme"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>
          <button
            onClick={handleLogout}
            className="w-full rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
          >
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
