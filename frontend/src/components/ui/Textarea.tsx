import { forwardRef } from 'react';
import type { TextareaHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm sm:text-base font-mono',
            'transition-all duration-200',
            'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30',
            'placeholder:text-gray-400 dark:placeholder:text-gray-500',
            'dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100',
            'disabled:bg-gray-50 disabled:cursor-not-allowed dark:disabled:bg-gray-800',
            error && 'border-red-400 focus:border-red-500 focus:ring-red-500/30 dark:border-red-500',
            className
          )}
          rows={4}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
export default Textarea;
