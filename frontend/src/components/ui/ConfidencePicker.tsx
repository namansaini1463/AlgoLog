import { cn } from '../../utils/cn';

interface ConfidencePickerProps {
  value: number;
  onChange: (val: number) => void;
}

const CONFIDENCE_LABELS = ['Forgot', 'Shaky', 'Okay', 'Good', 'Perfect'];

export default function ConfidencePicker({ value, onChange }: ConfidencePickerProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-500 dark:text-gray-400">Confidence:</span>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            title={CONFIDENCE_LABELS[n - 1]}
            className={cn(
              'h-5 w-5 rounded-full border-2 cursor-pointer transition-all duration-150',
              'hover:scale-125 hover:shadow-md',
              n <= value
                ? 'bg-primary border-primary hover:bg-primary/80 hover:border-primary/80'
                : 'bg-transparent border-gray-300 dark:border-gray-600 hover:border-primary/50 hover:bg-primary/10'
            )}
            aria-label={`Confidence ${n} — ${CONFIDENCE_LABELS[n - 1]}`}
          />
        ))}
      </div>
      <span className="text-xs text-gray-400">{value}/5</span>
    </div>
  );
}
