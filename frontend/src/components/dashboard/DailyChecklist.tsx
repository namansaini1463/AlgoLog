import { useState, useRef, useEffect } from 'react';
import { useChecklistStore, type DayChecklist } from '../../store/checklistStore';
import Card from '../ui/Card';
import { cn } from '../../utils/cn';

function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00'); // noon to avoid timezone issues
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (dateStr === today.toISOString().slice(0, 10)) return 'Today';
  if (dateStr === yesterday.toISOString().slice(0, 10)) return 'Yesterday';

  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function DailyChecklist() {
  const {
    getTodayItems,
    getPastDays,
    addItem,
    toggleItem,
    removeItem,
    editItem,
    resetTime,
    setResetTime,
  } = useChecklistStore();

  const items = getTodayItems();
  const pastDays = getPastDays(5);
  const doneCount = items.filter((i) => i.done).length;

  const [newText, setNewText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [showPast, setShowPast] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const editRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && editRef.current) editRef.current.focus();
  }, [editingId]);

  const handleAdd = () => {
    const trimmed = newText.trim();
    if (!trimmed) return;
    addItem(trimmed);
    setNewText('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
  };

  const startEdit = (id: string, text: string) => {
    setEditingId(id);
    setEditText(text);
  };

  const commitEdit = () => {
    if (editingId && editText.trim()) {
      editItem(editingId, editText.trim());
    }
    setEditingId(null);
    setEditText('');
  };

  return (
    <Card>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300">
            Daily Checklist
          </h3>
          {items.length > 0 && (
            <span className="rounded-full bg-primary/10 dark:bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
              {doneCount}/{items.length}
            </span>
          )}
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition-colors"
          title="Checklist settings"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      {/* Settings */}
      {showSettings && (
        <div className="mb-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 p-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Daily reset time
          </label>
          <input
            type="time"
            value={resetTime}
            onChange={(e) => setResetTime(e.target.value)}
            className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
          <p className="mt-1 text-[11px] text-gray-400">
            Checklist resets at this time each day. Items before this hour belong to the previous day.
          </p>
        </div>
      )}

      {/* Progress bar */}
      {items.length > 0 && (
        <div className="mb-3 h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-500 ease-out"
            style={{ width: `${(doneCount / items.length) * 100}%` }}
          />
        </div>
      )}

      {/* Add input */}
      <div className="flex gap-2 mb-3">
        <input
          ref={inputRef}
          type="text"
          placeholder="Add a task..."
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={handleKeyDown}
          className={cn(
            'flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm',
            'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
            'placeholder:text-gray-400 dark:placeholder:text-gray-500',
            'dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100',
          )}
        />
        <button
          onClick={handleAdd}
          disabled={!newText.trim()}
          className={cn(
            'rounded-lg px-3 py-2 text-sm font-medium transition-all',
            'bg-primary text-white hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed',
            'active:scale-95'
          )}
        >
          +
        </button>
      </div>

      {/* Today's items */}
      <div className="space-y-1 max-h-[280px] overflow-y-auto scrollbar-styled">
        {items.length === 0 ? (
          <p className="py-6 text-center text-xs text-gray-400 dark:text-gray-500">
            No tasks yet. Add one above to get started!
          </p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className={cn(
                'group flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors',
                'hover:bg-gray-50 dark:hover:bg-gray-800/50',
              )}
            >
              <button
                onClick={() => toggleItem(item.id)}
                className={cn(
                  'flex-shrink-0 w-[18px] h-[18px] rounded border-2 transition-all duration-200 flex items-center justify-center',
                  item.done
                    ? 'bg-primary border-primary text-white'
                    : 'border-gray-300 dark:border-gray-600 hover:border-primary'
                )}
              >
                {item.done && (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>

              {editingId === item.id ? (
                <input
                  ref={editRef}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onBlur={commitEdit}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitEdit();
                    if (e.key === 'Escape') { setEditingId(null); setEditText(''); }
                  }}
                  className="flex-1 rounded border border-primary/40 bg-transparent px-1.5 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30 dark:text-gray-100"
                />
              ) : (
                <span
                  onDoubleClick={() => startEdit(item.id, item.text)}
                  className={cn(
                    'flex-1 text-sm cursor-default select-none transition-all duration-200',
                    item.done
                      ? 'text-gray-400 line-through dark:text-gray-500'
                      : 'text-gray-700 dark:text-gray-300'
                  )}
                >
                  {item.text}
                </span>
              )}

              <button
                onClick={() => removeItem(item.id)}
                className="flex-shrink-0 rounded p-0.5 text-gray-300 opacity-0 group-hover:opacity-100 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400 transition-all"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>

      {/* Past days */}
      {pastDays.length > 0 && (
        <div className="mt-3 border-t border-gray-100 dark:border-gray-800 pt-2">
          <button
            onClick={() => setShowPast(!showPast)}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg
              className={cn('w-3 h-3 transition-transform', showPast && 'rotate-90')}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            Previous days ({pastDays.length})
          </button>

          {showPast && (
            <div className="mt-2 space-y-3 max-h-[240px] overflow-y-auto scrollbar-styled">
              {pastDays.map((day) => (
                <PastDaySection key={day.date} day={day} />
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

function PastDaySection({ day }: { day: DayChecklist }) {
  const doneCount = day.items.filter((i) => i.done).length;

  return (
    <div className="opacity-60">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
          {formatDateLabel(day.date)}
        </span>
        <span className="text-[11px] text-gray-400 dark:text-gray-500">
          {doneCount}/{day.items.length} done
        </span>
      </div>
      <div className="space-y-0.5">
        {day.items.map((item) => (
          <div key={item.id} className="flex items-center gap-2 px-2 py-1">
            <div
              className={cn(
                'flex-shrink-0 w-[14px] h-[14px] rounded border transition-colors',
                item.done
                  ? 'bg-gray-300 border-gray-300 dark:bg-gray-600 dark:border-gray-600'
                  : 'border-gray-300 dark:border-gray-600'
              )}
            >
              {item.done && (
                <svg className="w-full h-full text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span
              className={cn(
                'text-xs',
                item.done
                  ? 'text-gray-400 line-through dark:text-gray-500'
                  : 'text-gray-500 dark:text-gray-400'
              )}
            >
              {item.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
