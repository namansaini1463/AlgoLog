import { useCategoryStore } from '../../store/categoryStore';
import { cn } from '../../utils/cn';

export default function CategoryTabs() {
  const { category, setCategory, categories, isLoaded } = useCategoryStore();

  if (!isLoaded || categories.length === 0) return null;

  return (
    <div className="flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800 w-fit overflow-x-auto">
      <button
        onClick={() => setCategory('ALL')}
        className={cn(
          'rounded-md px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap',
          category === 'ALL'
            ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100'
            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
        )}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => setCategory(cat.name)}
          className={cn(
            'rounded-md px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap',
            category === cat.name
              ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          )}
          style={category === cat.name ? { borderBottom: `2px solid ${cat.colorHex}` } : undefined}
        >
          <span
            className="mr-1.5 inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: cat.colorHex }}
          />
          {cat.name}
        </button>
      ))}
    </div>
  );
}
