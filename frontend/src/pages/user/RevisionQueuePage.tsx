import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { revisionsApi, type RevisionItem } from '../../api/revisions';
import { useCategoryStore } from '../../store/categoryStore';
import TopBar from '../../components/layout/TopBar';
import RevisionCard from '../../components/revision/RevisionCard';
import Spinner from '../../components/ui/Spinner';
import { cn } from '../../utils/cn';

function SectionHeader({ title, count, color }: { title: string; count: number; color: string }) {
  if (count === 0) return null;
  return (
    <div className="flex items-center gap-2 mb-2 mt-6 first:mt-0">
      <div className={cn('h-2.5 w-2.5 rounded-full', color)} />
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        {title} ({count})
      </h3>
    </div>
  );
}

function StatChip({ label, value, active, onClick, color }: {
  label: string; value: number; active?: boolean; onClick?: () => void; color: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors border',
        active
          ? `${color} ring-1 ring-primary/20`
          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400'
      )}
    >
      {label}: <span className="font-bold">{value}</span>
    </button>
  );
}

export default function RevisionQueuePage() {
  const queryClient = useQueryClient();
  const [showUpcoming, setShowUpcoming] = useState(false);
  const { category } = useCategoryStore();

  const { data: rawQueue, isLoading } = useQuery({
    queryKey: ['revisions', 'queue'],
    queryFn: () => revisionsApi.queue().then((r) => r.data),
  });

  // Client-side category filter
  const filterByCategory = (items: RevisionItem[]) =>
    category === 'ALL' ? items : items.filter((i) => i.category === category);

  const queue = useMemo(() => {
    if (!rawQueue) return null;
    return {
      ...rawQueue,
      flagged: filterByCategory(rawQueue.flagged),
      overdue: filterByCategory(rawQueue.overdue),
      dueToday: filterByCategory(rawQueue.dueToday),
      upcoming7Days: filterByCategory(rawQueue.upcoming7Days),
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawQueue, category]);

  const completeMutation = useMutation({
    mutationFn: ({ id, confidence }: { id: string; confidence: number }) =>
      revisionsApi.complete(id, confidence),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['revisions'] });
      queryClient.invalidateQueries({ queryKey: ['streak'] });
      queryClient.invalidateQueries({ queryKey: ['heatmap'] });
    },
  });

  const snoozeMutation = useMutation({
    mutationFn: (id: string) => revisionsApi.snooze(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['revisions'] });
    },
  });

  const handleComplete = (revisionId: string, confidence: number) => {
    completeMutation.mutate({ id: revisionId, confidence });
  };

  const handleSnooze = (revisionId: string) => {
    snoozeMutation.mutate(revisionId);
  };

  const stats = queue?.stats;
  const hasAnyDue = (queue?.flagged.length || 0) + (queue?.overdue.length || 0) + (queue?.dueToday.length || 0) > 0;

  // Find next due date for "all caught up" message
  const nextDueDate = !hasAnyDue && queue?.upcoming7Days?.[0]?.nextDueAt
    ? new Date(queue.upcoming7Days[0].nextDueAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null;

  return (
    <div>
      <TopBar title="Revision Queue" />

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner className="h-8 w-8" /></div>
      ) : !queue ? (
        <p className="py-12 text-center text-gray-400">Failed to load queue.</p>
      ) : (
        <>
          {/* Stats bar */}
          {stats && (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <StatChip label="Flagged" value={stats.flaggedCount} color="bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800" />
              <StatChip label="Overdue" value={stats.overdueCount} color="bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800" />
              <StatChip label="Due today" value={stats.dueTodayCount} color="bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800" />
              <StatChip label="This week" value={stats.thisWeekCount} color="bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800" />
              <StatChip label="Total" value={stats.totalScheduled} color="bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700" />
              <Link
                to="/revisions/scheduled"
                className="w-full sm:w-auto sm:ml-auto text-xs text-primary hover:underline"
              >
                Browse all scheduled
              </Link>
            </div>
          )}

          {/* All caught up state */}
          {!hasAnyDue && (
            <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center dark:border-green-900 dark:bg-green-900/10">
              <p className="text-lg font-medium text-green-700 dark:text-green-400">
                You're all caught up!
              </p>
              {nextDueDate && (
                <p className="mt-1 text-sm text-green-600 dark:text-green-500">
                  Next revision due on {nextDueDate}
                </p>
              )}
              {!nextDueDate && stats?.totalScheduled === 0 && (
                <p className="mt-1 text-sm text-green-600 dark:text-green-500">
                  No problems scheduled yet. Start solving!
                </p>
              )}
            </div>
          )}

          {/* Flagged section */}
          {queue.flagged.length > 0 && (
            <>
              <SectionHeader title="Flagged" count={queue.flagged.length} color="bg-purple-500" />
              <div className="space-y-3">
                {queue.flagged.map((item) => (
                  <RevisionCard
                    key={item.revisionId}
                    item={item}
                    onComplete={handleComplete}
                    onSnooze={handleSnooze}
                    completePending={completeMutation.isPending}
                    snoozePending={snoozeMutation.isPending}
                  />
                ))}
              </div>
            </>
          )}

          {/* Overdue section */}
          {queue.overdue.length > 0 && (
            <>
              <SectionHeader title="Overdue" count={queue.overdue.length} color="bg-red-500" />
              <div className="space-y-3">
                {queue.overdue.map((item) => (
                  <RevisionCard
                    key={item.revisionId}
                    item={item}
                    onComplete={handleComplete}
                    onSnooze={handleSnooze}
                    completePending={completeMutation.isPending}
                    snoozePending={snoozeMutation.isPending}
                  />
                ))}
              </div>
            </>
          )}

          {/* Due Today section */}
          {queue.dueToday.length > 0 && (
            <>
              <SectionHeader title="Due Today" count={queue.dueToday.length} color="bg-amber-500" />
              <div className="space-y-3">
                {queue.dueToday.map((item) => (
                  <RevisionCard
                    key={item.revisionId}
                    item={item}
                    onComplete={handleComplete}
                    onSnooze={handleSnooze}
                    completePending={completeMutation.isPending}
                    snoozePending={snoozeMutation.isPending}
                  />
                ))}
              </div>
            </>
          )}

          {/* Upcoming section (collapsed by default) */}
          {queue.upcoming7Days.length > 0 && (
            <>
              <div className="mt-6">
                <button
                  onClick={() => setShowUpcoming(!showUpcoming)}
                  className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  <svg
                    className={cn('h-4 w-4 transition-transform', showUpcoming && 'rotate-90')}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                  Show upcoming ({queue.upcoming7Days.length})
                </button>
              </div>
              {showUpcoming && (
                <div className="mt-3 space-y-3">
                  {queue.upcoming7Days.map((item) => (
                    <RevisionCard
                      key={item.revisionId}
                      item={item}
                      onComplete={handleComplete}
                      completePending={completeMutation.isPending}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
