import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { problemsApi } from '../../api/problems';
import { revisionsApi } from '../../api/revisions';
import { useCategoryStore } from '../../store/categoryStore';
import TopBar from '../../components/layout/TopBar';
import ProblemCard from '../../components/problem/ProblemCard';
import Spinner from '../../components/ui/Spinner';

const PAGE_SIZES = [10, 25, 50, 100] as const;

export default function ProblemsPage() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState<number>(25);
  const { category } = useCategoryStore();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['problems', page, pageSize, category],
    queryFn: () => {
      const params: Record<string, string | number> = { page, size: pageSize };
      if (category !== 'ALL') params.category = category;
      return problemsApi.list(params).then((r) => r.data);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => problemsApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['problems'] }),
  });

  const flagMutation = useMutation({
    mutationFn: ({ id, isFlagged, note }: { id: string; isFlagged: boolean; note?: string }) =>
      revisionsApi.flag(id, isFlagged, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['revisions'] });
      queryClient.invalidateQueries({ queryKey: ['problems'] });
    },
  });

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(0);
  };

  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;
  const startItem = page * pageSize + 1;
  const endItem = Math.min((page + 1) * pageSize, totalElements);

  return (
    <div>
      <TopBar title="All Problems Solved" showAddButton />

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner className="h-8 w-8" /></div>
      ) : !data?.content.length ? (
        <p className="py-12 text-center text-gray-400">No problems logged yet. Start tracking!</p>
      ) : (
        <>
          <div className="space-y-3">
            {data.content.map((p) => (
              <ProblemCard
                key={p.id}
                problem={p}
                isFlagged={p.isFlagged}
                flaggedNote={p.flaggedNote}
                onDelete={(id) => deleteMutation.mutate(id)}
                onFlag={(id, isFlagged, note) => flagMutation.mutate({ id, isFlagged, note })}
                onNotesUpdated={() => queryClient.invalidateQueries({ queryKey: ['problems'] })}
              />
            ))}
          </div>

          {/* Pagination controls */}
          <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            {/* Page size selector */}
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="hidden sm:inline">Show</span>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 transition-all"
              >
                {PAGE_SIZES.map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
              <span className="hidden sm:inline">per page</span>
              <span className="text-gray-500 dark:text-gray-500">
                {startItem}–{endItem} of {totalElements}
              </span>
            </div>

            {/* Page navigation */}
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(0)}
                  disabled={page === 0}
                  className="rounded-lg px-2 py-1.5 text-sm transition-colors disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-300"
                  title="First page"
                >
                  «
                </button>
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="rounded-lg px-3 py-1.5 text-sm transition-colors disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-300"
                >
                  Previous
                </button>
                <span className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {page + 1} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="rounded-lg px-3 py-1.5 text-sm transition-colors disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-300"
                >
                  Next
                </button>
                <button
                  onClick={() => setPage(totalPages - 1)}
                  disabled={page >= totalPages - 1}
                  className="rounded-lg px-2 py-1.5 text-sm transition-colors disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-300"
                  title="Last page"
                >
                  »
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
