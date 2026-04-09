import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { formatDate } from '../../utils/formatDate';

export default function AdminReportsPage() {
  const [page, setPage] = useState(0);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'reports', page],
    queryFn: () => adminApi.getReports({ page, size: 20 }).then((r) => r.data),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => adminApi.updateReport(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] }),
  });

  return (
    <div>
      <h1 className="mb-4 sm:mb-6 text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100">Reported Problems</h1>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner className="h-8 w-8" /></div>
      ) : !data?.content.length ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-5xl mb-4">🎉</div>
          <p className="text-gray-500 dark:text-gray-400">No pending reports.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.content.map((r) => (
            <div key={r.id} className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-surface-dark hover:shadow-md transition-all">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{r.problemTitle}</span>
                    <Badge>{r.status}</Badge>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{r.reason}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Reported by {r.userEmail} on {formatDate(r.createdAt)}
                  </p>
                </div>
                {r.status === 'PENDING' && (
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button size="sm" onClick={() => updateMutation.mutate({ id: r.id, status: 'RESOLVED' })} className="flex-1 sm:flex-none">
                      Resolve
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => updateMutation.mutate({ id: r.id, status: 'DISMISSED' })} className="flex-1 sm:flex-none">
                      Dismiss
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {data && data.totalPages > 1 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-2">
          <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
            className="w-full sm:w-auto rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40">
            Previous
          </button>
          <span className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300">{page + 1} / {data.totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(data.totalPages - 1, p + 1))} disabled={page >= data.totalPages - 1}
            className="w-full sm:w-auto rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40">
            Next
          </button>
        </div>
      )}
    </div>
  );
}
