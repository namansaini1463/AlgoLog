import { cn } from '../../utils/cn';

export default function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-primary dark:border-gray-700 dark:border-t-primary-light',
        className
      )}
    />
  );
}
