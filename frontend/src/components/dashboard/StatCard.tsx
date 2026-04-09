import Card from '../ui/Card';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  color?: string;
}

export default function StatCard({ label, value, icon, color }: StatCardProps) {
  return (
    <Card className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4">
      <div className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg text-lg sm:text-xl transition-transform hover:scale-110 ${color || 'bg-primary/10 dark:bg-primary/20'}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">{value}</p>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">{label}</p>
      </div>
    </Card>
  );
}
