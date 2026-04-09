import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bankApi, type ProblemBank } from '../../api/bank';
import { problemsApi } from '../../api/problems';
import TopBar from '../../components/layout/TopBar';
import Badge, { difficultyVariant } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import ConfidencePicker from '../../components/ui/ConfidencePicker';
import Spinner from '../../components/ui/Spinner';

export default function BrowseBankPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [topic] = useState('');
  const [selected, setSelected] = useState<ProblemBank | null>(null);
  const [confidence, setConfidence] = useState(3);
  const [oneLiner, setOneLiner] = useState('');
  const queryClient = useQueryClient();

  const params: Record<string, string | number> = { page, size: 20 };
  if (search) params.search = search;
  if (difficulty) params.difficulty = difficulty;
  if (topic) params.topic = topic;

  const { data, isLoading } = useQuery({
    queryKey: ['bank', page, search, difficulty, topic],
    queryFn: () => bankApi.browse(params).then((r) => r.data),
  });

  const logMutation = useMutation({
    mutationFn: (bankProblemId: string) =>
      problemsApi.log({ bankProblemId, confidence, oneLiner }),
    onSuccess: () => {
      setSelected(null);
      setOneLiner('');
      setConfidence(3);
      queryClient.invalidateQueries({ queryKey: ['problems'] });
    },
  });

  return (
    <div>
      <TopBar title="Browse Problem Bank" />

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3">
        <Input
          placeholder="Search by title..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          className="w-full sm:w-64"
        />
        <Select
          value={difficulty}
          onChange={(e) => { setDifficulty(e.target.value); setPage(0); }}
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
      ) : !data?.content.length ? (
        <p className="py-12 text-center text-gray-400">No problems found.</p>
      ) : (
        <>
          <div className="space-y-2">
            {data.content.map((p) => (
              <div
                key={p.id}
                className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-gray-200 bg-surface-light p-3 sm:p-4 dark:border-gray-700 dark:bg-surface-dark"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-gray-900 dark:text-gray-100">{p.title}</span>
                    <Badge variant={difficultyVariant(p.difficulty)}>{p.difficulty}</Badge>
                    <Badge variant="topic">{p.topic}</Badge>
                    {p.platform && (
                      <a href={p.platformUrl} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline">
                        {p.platform}
                      </a>
                    )}
                  </div>
                  {p.tags?.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {p.tags.map((t) => (
                        <Badge key={t} className="text-[10px]">{t}</Badge>
                      ))}
                    </div>
                  )}
                </div>
                <Button size="sm" onClick={() => setSelected(p)} className="shrink-0 self-start sm:self-center">
                  + Add to My List
                </Button>
              </div>
            ))}
          </div>

          {data.totalPages > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
                className="rounded-lg px-3 py-1 text-sm disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-800">Previous</button>
              <span className="px-3 py-1 text-sm text-gray-500">{page + 1} / {data.totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(data.totalPages - 1, p + 1))} disabled={page >= data.totalPages - 1}
                className="rounded-lg px-3 py-1 text-sm disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-800">Next</button>
            </div>
          )}
        </>
      )}

      {/* Add to my list modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={`Add "${selected?.title}"`}>
        <div className="space-y-4">
          <ConfidencePicker value={confidence} onChange={setConfidence} />
          <Input
            label="One-liner (approach summary)"
            value={oneLiner}
            onChange={(e) => setOneLiner(e.target.value)}
            placeholder="e.g. Two pointer from both ends"
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setSelected(null)}>Cancel</Button>
            <Button
              onClick={() => selected && logMutation.mutate(selected.id)}
              disabled={logMutation.isPending}
            >
              {logMutation.isPending ? 'Adding...' : 'Add Problem'}
            </Button>
          </div>
          {logMutation.isError && (
            <p className="text-sm text-red-500">
              {(logMutation.error as any)?.response?.data?.message || 'Failed to add'}
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
}
