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
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">Reported Problems</h1>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner className="h-8 w-8" /></div>
      ) : !data?.content.length ? (
        <p className="py-12 text-center text-gray-400">No pending reports.</p>
      ) : (
        <div className="space-y-3">
          {data.content.map((r) => (
            <div key={r.id} className="rounded-lg border border-gray-200 bg-surface-light p-4 dark:border-gray-700 dark:bg-surface-dark">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-gray-100">{r.problemTitle}</span>
                    <Badge>{r.status}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{r.reason}</p>
                  <p className="mt-1 text-xs text-gray-400">
                    Reported by {r.userEmail} on {formatDate(r.createdAt)}
                  </p>
                </div>
                {r.status === 'PENDING' && (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => updateMutation.mutate({ id: r.id, status: 'RESOLVED' })}>
                      Resolve
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => updateMutation.mutate({ id: r.id, status: 'DISMISSED' })}>
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
        <div className="mt-4 flex justify-center gap-2">
          <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
            className="rounded-lg px-3 py-1 text-sm disabled:opacity-40">Previous</button>
          <span className="px-3 py-1 text-sm text-gray-500">{page + 1} / {data.totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(data.totalPages - 1, p + 1))} disabled={page >= data.totalPages - 1}
            className="rounded-lg px-3 py-1 text-sm disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  );
}
