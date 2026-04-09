import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, type ProblemBankRequest } from '../../api/admin';
import { bankApi, type ProblemBank } from '../../api/bank';
import { topicsApi } from '../../api/topics';
import Badge, { difficultyVariant } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import TagPicker from '../../components/ui/TagPicker';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import { detectPlatform, ALL_PLATFORMS } from '../../utils/detectPlatform';

const emptyForm: ProblemBankRequest = {
  title: '', difficulty: 'MEDIUM', topic: '', tags: [], platform: '', platformUrl: '', description: '',
};

export default function AdminBankPage() {
  const [page, setPage] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ProblemBank | null>(null);
  const [form, setForm] = useState<ProblemBankRequest>(emptyForm);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'bank', page],
    queryFn: () => adminApi.getProblems({ page, size: 20 }).then((r) => r.data),
  });

  const { data: bankTags } = useQuery({
    queryKey: ['bank-tags'],
    queryFn: () => bankApi.getTags().then((r) => r.data),
  });

  const { data: topics } = useQuery({
    queryKey: ['topics'],
    queryFn: () => topicsApi.list().then((r) => r.data.map((t) => t.name)),
  });

  // Merge pre-seeded topics with existing bank tags (deduplicated)
  const allTags = [...new Set([...(topics || []), ...(bankTags || [])])];

  const createMutation = useMutation({
    mutationFn: (data: ProblemBankRequest) => adminApi.createProblem(data),
    onSuccess: () => { 
      closeModal(); 
      queryClient.invalidateQueries({ queryKey: ['admin', 'bank'] });
      queryClient.invalidateQueries({ queryKey: ['bank-tags'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProblemBankRequest }) => adminApi.updateProblem(id, data),
    onSuccess: () => { 
      closeModal(); 
      queryClient.invalidateQueries({ queryKey: ['admin', 'bank'] });
      queryClient.invalidateQueries({ queryKey: ['bank-tags'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteProblem(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'bank'] }),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => adminApi.togglePublish(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'bank'] }),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (p: ProblemBank) => {
    setEditing(p);
    setForm({ title: p.title, difficulty: p.difficulty, topic: p.topic, tags: p.tags || [], platform: p.platform || '', platformUrl: p.platformUrl || '', description: p.description || '' });
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setEditing(null); };

  const handleSubmit = () => {
    // Set topic to first tag for backward compatibility
    const payload = { ...form, topic: form.tags?.[0] || '' };
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Problem Bank</h1>
        <Button onClick={openCreate}>+ New Problem</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner className="h-8 w-8" /></div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Tags</th>
                <th className="px-4 py-3 font-medium">Difficulty</th>
                <th className="px-4 py-3 font-medium">Platform</th>
                <th className="px-4 py-3 font-medium">Published</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {data?.content.map((p) => (
                <tr key={p.id} className="bg-surface-light dark:bg-surface-dark">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{p.title}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {p.tags && p.tags.length > 0 ? (
                        p.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="topic">{tag}</Badge>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400">No tags</span>
                      )}
                      {p.tags && p.tags.length > 3 && (
                        <span className="text-xs text-gray-400">+{p.tags.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3"><Badge variant={difficultyVariant(p.difficulty)}>{p.difficulty}</Badge></td>
                  <td className="px-4 py-3 text-gray-500">{p.platform || '-'}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleMutation.mutate(p.id)}
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        p.isPublished ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800'
                      }`}
                    >
                      {p.isPublished ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)} className="text-xs text-primary hover:underline">Edit</button>
                      <button onClick={() => deleteMutation.mutate(p.id)} className="text-xs text-red-500 hover:underline">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

      <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Edit Problem' : 'New Problem'}>
        <div className="space-y-4">
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Select label="Difficulty" value={form.difficulty}
            onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
            options={[{ value: 'EASY', label: 'Easy' }, { value: 'MEDIUM', label: 'Medium' }, { value: 'HARD', label: 'Hard' }]} />
          <TagPicker
            label="Tags (categories/topics)"
            availableTags={allTags}
            selectedTags={form.tags || []}
            onChange={(tags) => setForm({ ...form, tags })}
            allowCustom
            placeholder="Search or add tags..."
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Platform</label>
              <select
                value={form.platform || ''}
                onChange={(e) => setForm({ ...form, platform: e.target.value })}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="">Select platform...</option>
                {ALL_PLATFORMS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <Input
              label="Platform URL"
              value={form.platformUrl || ''}
              onChange={(e) => {
                const url = e.target.value;
                const detected = detectPlatform(url);
                setForm({
                  ...form,
                  platformUrl: url,
                  // Auto-fill platform only if currently empty or was previously auto-detected
                  ...(detected && (!form.platform || ALL_PLATFORMS.includes(form.platform as any))
                    ? { platform: detected }
                    : {}),
                });
              }}
            />
          </div>
          <Textarea label="Description" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
              {editing ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
