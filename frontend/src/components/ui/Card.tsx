import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl bg-surface-light p-5 shadow-sm border border-gray-200 dark:bg-surface-dark dark:border-gray-800',
        className
      )}
    >
      {children}
    </div>
  );
}
