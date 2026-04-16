import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileHeader from './MobileHeader';
import CategoryTabs from './CategoryTabs';
import { useCategoryStore } from '../../store/categoryStore';
import { useAuthStore } from '../../store/authStore';
import { startNotificationPolling, stopNotificationPolling } from '../../services/notifications';

export default function AppShell() {
  const fetchCategories = useCategoryStore((s) => s.fetchCategories);
  const token = useAuthStore((s) => s.token);

  // Fetch user's custom categories on mount (only if authenticated)
  useEffect(() => {
    if (token) {
      fetchCategories();
    }
  }, [fetchCategories, token]);

  // Start checking for due revisions and showing notifications
  useEffect(() => {
    startNotificationPolling();
    return () => stopNotificationPolling();
  }, []);

  return (
    <div className="flex min-h-screen bg-bg-light dark:bg-bg-dark transition-colors">
      <Sidebar />
      {/* Mobile header with hamburger */}
      <MobileHeader />
      <main className="flex-1 p-4 pt-16 sm:p-6 sm:pt-18 md:ml-[210px] md:pt-6 lg:p-8 max-w-[1600px] w-full mx-auto">
        <div className="mb-4">
          <CategoryTabs />
        </div>
        <Outlet />
      </main>
    </div>
  );
}
