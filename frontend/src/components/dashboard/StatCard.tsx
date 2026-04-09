import Card from '../ui/Card';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  color?: string;
}

export default function StatCard({ label, value, icon, color }: StatCardProps) {
  return (
    <Card className="flex items-center gap-4">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg text-lg ${color || 'bg-primary/10'}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      </div>
    </Card>
  );
}
