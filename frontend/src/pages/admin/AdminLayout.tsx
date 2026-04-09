import { NavLink, Outlet, useNavigate } from 'react-router-dom';
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

  return (
    <div className="flex min-h-screen">
      <aside className="fixed left-0 top-0 z-40 flex h-screen w-[210px] flex-col border-r border-orange-200 bg-orange-50 dark:border-orange-900/30 dark:bg-gray-900">
        <div className="px-5 py-6">
          <h1 className="text-xl font-bold text-orange-600">AlgoLog Admin</h1>
          <p className="mt-1 text-xs text-gray-500">{user?.email}</p>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {adminNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-orange-200/50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                    : 'text-gray-600 hover:bg-orange-100 dark:text-gray-400 dark:hover:bg-gray-800'
                )
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}

          <div className="my-3 border-t border-orange-200 dark:border-gray-700" />
          <NavLink
            to="/dashboard"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-orange-100 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <span>← </span>
            Back to App
          </NavLink>
        </nav>

        <div className="border-t border-orange-200 px-4 py-4 dark:border-gray-700">
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="w-full rounded-lg bg-orange-100 px-3 py-1.5 text-xs font-medium text-orange-700 hover:bg-orange-200 dark:bg-gray-800 dark:text-gray-400"
          >
            Sign Out
          </button>
        </div>
      </aside>
      <main className="ml-[210px] flex-1 p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
