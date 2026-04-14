import { forwardRef, type ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface CardProps {
  children: ReactNode;
  className?: string;
}

const Card = forwardRef<HTMLDivElement, CardProps>(function Card({ children, className }, ref) {
  return (
    <div
      ref={ref}
      className={cn(
        'rounded-xl bg-white p-4 sm:p-5 shadow-sm border border-gray-200 transition-all duration-200',
        'hover:shadow-md hover:border-gray-300',
        'dark:bg-surface-dark dark:border-gray-800 dark:hover:border-gray-700',
        className
      )}
    >
      {children}
    </div>
  );
});

export default Card;
