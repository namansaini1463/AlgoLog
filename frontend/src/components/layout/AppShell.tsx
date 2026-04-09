import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileHeader from './MobileHeader';

export default function AppShell() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      {/* Mobile header with hamburger */}
      <MobileHeader />
      <main className="flex-1 p-4 pt-16 sm:p-6 sm:pt-18 md:ml-[210px] md:pt-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
