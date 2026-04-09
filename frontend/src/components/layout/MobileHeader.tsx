import { useSidebarStore } from '../../store/sidebarStore';

export default function MobileHeader() {
  const toggle = useSidebarStore((s) => s.toggle);

  return (
    <header className="fixed top-0 left-0 right-0 z-30 flex items-center gap-3 border-b border-gray-200 bg-surface-light/95 px-4 py-3 backdrop-blur-sm dark:border-gray-800 dark:bg-surface-dark/95 md:hidden">
      <button
        onClick={toggle}
        className="rounded-lg p-1.5 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
        aria-label="Toggle sidebar"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <span className="text-lg font-bold text-primary">AlgoLog</span>
    </header>
  );
}
