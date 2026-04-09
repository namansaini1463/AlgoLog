import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

export default function Modal({ open, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />
      <div
        className={cn(
          'relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto',
          'rounded-xl bg-white p-5 sm:p-6 shadow-2xl',
          'dark:bg-surface-dark border border-gray-200 dark:border-gray-800',
          'animate-in fade-in zoom-in-95 duration-200',
          className
        )}
      >
        {title && (
          <h2 className="mb-4 text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  );
}
