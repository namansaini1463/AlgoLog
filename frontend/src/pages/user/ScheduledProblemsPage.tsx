import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { revisionsApi, type RevisionItem } from '../../api/revisions';
import TopBar from '../../components/layout/TopBar';
import Badge, { difficultyVariant } from '../../components/ui/Badge';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { cn } from '../../utils/cn';

function statusBadge(state: string) {
  switch (state) {
    case 'FLAGGED':
      return <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">Flagged</Badge>;
    case 'OVERDUE':
      return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">Overdue</Badge>;
    case 'DUE_TODAY':
      return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">Due Today</Badge>;
    default:
      return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">Upcoming</Badge>;
  }
}

function relativeDate(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (days < -1) return `${Math.abs(days)} days ago`;
  if (days === -1) return 'Yesterday';
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `in ${days} days`;
}

function confidenceDots(val: number | null) {
  if (val == null) return <span className="text-xs text-gray-400">-</span>;
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={cn(
            'h-2 w-2 rounded-full',
            n <= val ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
          )}
        />
      ))}
    </div>
  );
}

export default function ScheduledProblemsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['revisions', 'scheduled', page],
    queryFn: () => revisionsApi.scheduled({ page, size: 20 }).then((r) => r.data),
  });

  const completeMutation = useMutation({
    mutationFn: ({ id, confidence }: { id: string; confidence: number }) =>
      revisionsApi.complete(id, confidence),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['revisions'] });
    },
  });

  const snoozeMutation = useMutation({
    mutationFn: (id: string) => revisionsApi.snooze(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['revisions'] });
    },
  });

  const flagMutation = useMutation({
    mutationFn: ({ id, flagged }: { id: string; flagged: boolean }) =>
      revisionsApi.flag(id, flagged),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['revisions'] });
    },
  });

  // Client-side filtering (since backend returns all)
  let filtered = data?.content || [];
  if (statusFilter) {
    filtered = filtered.filter((item) => item.revisionState === statusFilter);
  }
  if (difficultyFilter) {
    filtered = filtered.filter((item) => item.difficulty === difficultyFilter);
  }

  return (
    <div>
      <TopBar title="All Scheduled Problems" />

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3">
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: '', label: 'All Statuses' },
            { value: 'FLAGGED', label: 'Flagged' },
            { value: 'OVERDUE', label: 'Overdue' },
            { value: 'DUE_TODAY', label: 'Due Today' },
            { value: 'UPCOMING', label: 'Upcoming' },
          ]}
        />
        <Select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
          options={[
            { value: '', label: 'All Difficulties' },
            { value: 'EASY', label: 'Easy' },
            { value: 'MEDIUM', label: 'Medium' },
            { value: 'HARD', label: 'Hard' },
          ]}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner className="h-8 w-8" /></div>
      ) : filtered.length === 0 ? (
        <p className="py-12 text-center text-gray-400">No scheduled problems found.</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 font-medium">Problem</th>
                  <th className="px-4 py-3 font-medium">Difficulty</th>
                  <th className="px-4 py-3 font-medium">Topic</th>
                  <th className="px-4 py-3 font-medium">Next Due</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Interval</th>
                  <th className="px-4 py-3 font-medium">Revised</th>
                  <th className="px-4 py-3 font-medium">Confidence</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filtered.map((item) => (
                  <tr key={item.revisionId} className="bg-surface-light dark:bg-surface-dark">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {item.problemTitle}
                        </span>
                        {item.platformUrl && (
                          <a href={item.platformUrl} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline">{item.platform}</a>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {item.difficulty && <Badge variant={difficultyVariant(item.difficulty)}>{item.difficulty}</Badge>}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{item.topic || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="text-xs">
                        <div className="text-gray-900 dark:text-gray-100">
                          {new Date(item.nextDueAt).toLocaleDateString()}
                        </div>
                        <div className="text-gray-400">{relativeDate(item.nextDueAt)}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{statusBadge(item.revisionState)}</td>
                    <td className="px-4 py-3 text-gray-500">{item.intervalDays}d</td>
                    <td className="px-4 py-3 text-gray-500">{item.timesRevised}x</td>
                    <td className="px-4 py-3">{confidenceDots(item.lastConfidence)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {(item.revisionState === 'OVERDUE' || item.revisionState === 'DUE_TODAY') && (
                          <button
                            onClick={() => completeMutation.mutate({ id: item.revisionId, confidence: 3 })}
                            className="text-xs text-primary hover:underline"
                          >
                            Revise
                          </button>
                        )}
                        <button
                          onClick={() => flagMutation.mutate({ id: item.userProblemId, flagged: !item.isFlagged })}
                          className={cn(
                            'text-xs hover:underline',
                            item.isFlagged ? 'text-purple-500' : 'text-gray-400'
                          )}
                        >
                          {item.isFlagged ? 'Unflag' : 'Flag'}
                        </button>
                        {(item.revisionState === 'OVERDUE' || item.revisionState === 'DUE_TODAY') && !item.isSnoozed && (
                          <button
                            onClick={() => snoozeMutation.mutate(item.revisionId)}
                            className="text-xs text-gray-400 hover:underline"
                          >
                            Snooze
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="mt-4 flex justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="rounded-lg px-3 py-1 text-sm disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm text-gray-500">
                {page + 1} / {data.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.totalPages - 1, p + 1))}
                disabled={page >= data.totalPages - 1}
                className="rounded-lg px-3 py-1 text-sm disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
