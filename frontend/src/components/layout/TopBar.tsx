import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';

interface TopBarProps {
  title: string;
  showAddButton?: boolean;
}

export default function TopBar({ title, showAddButton = false }: TopBarProps) {
  const navigate = useNavigate();

  return (
    <div className="mb-4 sm:mb-6 flex items-center justify-between gap-3">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
      {showAddButton && (
        <Button onClick={() => navigate('/problems/add')} className="shrink-0 text-sm">
          + Log Problem
        </Button>
      )}
    </div>
  );
}
