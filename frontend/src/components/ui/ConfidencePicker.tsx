import { cn } from '../../utils/cn';

interface ConfidencePickerProps {
  value: number;
  onChange: (val: number) => void;
}

export default function ConfidencePicker({ value, onChange }: ConfidencePickerProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500 dark:text-gray-400">Confidence:</span>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={cn(
              'h-4 w-4 rounded-full border-2 transition-colors',
              n <= value
                ? 'bg-primary border-primary'
                : 'bg-transparent border-gray-300 dark:border-gray-600'
            )}
            aria-label={`Confidence ${n}`}
          />
        ))}
      </div>
      <span className="text-xs text-gray-400">{value}/5</span>
    </div>
  );
}
