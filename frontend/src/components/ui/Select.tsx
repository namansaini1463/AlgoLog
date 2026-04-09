import type { SelectHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export default function Select({ label, options, className, ...props }: SelectProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <select
        className={cn(
          'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm sm:text-base',
          'transition-all duration-200',
          'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30',
          'dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100',
          'disabled:bg-gray-50 disabled:cursor-not-allowed dark:disabled:bg-gray-800',
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
