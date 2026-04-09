import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../utils/cn';

const adminNav = [
  { to: '/admin/dashboard', label: 'Analytics', icon: '📊' },
  { to: '/admin/bank', label: 'Problem Bank', icon: '📚' },
  { to: '/admin/topics', label: 'Topics', icon: '🏷️' },
  { to: '/admin/reports', label: 'Reports', icon: '🚩' },
];

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [navigate]);

  return (
    <div className="flex min-h-screen bg-bg-light dark:bg-bg-dark">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-screen w-[240px] sm:w-[260px] md:w-[210px] flex-col',
          'border-r border-orange-200 bg-orange-50 shadow-xl md:shadow-none',
          'dark:border-orange-900/30 dark:bg-gray-900',
          'transition-transform duration-300 ease-out',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'md:translate-x-0'
        )}
      >
        <div className="flex items-center justify-between px-5 py-5 sm:py-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-orange-600 dark:text-orange-500">AlgoLog Admin</h1>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 truncate">{user?.email}</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-gray-600 hover:bg-orange-100 dark:hover:bg-gray-800 md:hidden"
            aria-label="Close sidebar"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 overflow-y-auto scrollbar-thin">
          {adminNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-orange-200/50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 shadow-sm'
                    : 'text-gray-700 hover:bg-orange-100 dark:text-gray-300 dark:hover:bg-gray-800 hover:pl-4'
                )
              }
            >
              <span className="text-base">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
            </NavLink>
          ))}

          <div className="my-3 border-t border-orange-200 dark:border-gray-700" />
          <NavLink
            to="/dashboard"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-orange-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-all hover:pl-4"
          >
            <span className="text-base">← </span>
            <span className="flex-1">Back to App</span>
          </NavLink>
        </nav>

        <div className="border-t border-orange-200 px-4 py-4 dark:border-gray-700">
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="w-full rounded-lg bg-orange-100 px-3 py-2 text-xs sm:text-sm font-medium text-orange-700 hover:bg-orange-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-all"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="fixed top-0 left-0 right-0 z-30 flex items-center gap-3 border-b border-orange-200 bg-orange-50/95 px-4 py-3 backdrop-blur-md shadow-sm dark:border-orange-900/30 dark:bg-gray-900/95 md:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          className="rounded-lg p-2 text-gray-700 hover:bg-orange-100 dark:text-gray-300 dark:hover:bg-gray-800"
          aria-label="Toggle sidebar"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="text-lg sm:text-xl font-bold text-orange-600 dark:text-orange-500">AlgoLog Admin</span>
      </header>

      <main className="flex-1 p-4 pt-16 sm:p-6 sm:pt-18 md:ml-[210px] md:pt-6 lg:p-8 max-w-[1600px] w-full mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
