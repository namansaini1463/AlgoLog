import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
        'active:scale-95',
        {
          'bg-primary text-white hover:bg-primary-dark hover:shadow-md hover:shadow-primary/20': variant === 'primary',
          'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700': variant === 'secondary',
          'bg-red-500 text-white hover:bg-red-600 hover:shadow-md hover:shadow-red-500/20': variant === 'danger',
          'bg-transparent text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800': variant === 'ghost',
        },
        {
          'px-3 py-1.5 text-xs sm:text-sm': size === 'sm',
          'px-4 py-2 text-sm sm:text-base': size === 'md',
          'px-6 py-3 text-base sm:text-lg': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
