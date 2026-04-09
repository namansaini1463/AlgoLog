import { cn } from '../../utils/cn';

interface RevisionBadgeProps {
  nextDueAt: string;
}

export default function RevisionBadge({ nextDueAt }: RevisionBadgeProps) {
  const due = new Date(nextDueAt);
  const now = new Date();
  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  let label: string;
  let dotColor: string;

  if (diffDays < 0) {
    label = 'Overdue';
    dotColor = 'bg-red-500';
  } else if (diffDays === 0) {
    label = 'Due Today';
    dotColor = 'bg-amber-500';
  } else {
    label = `In ${diffDays}d`;
    dotColor = 'bg-green-500';
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
      <span className={cn('h-2 w-2 rounded-full', dotColor)} />
      {label}
    </span>
  );
}
