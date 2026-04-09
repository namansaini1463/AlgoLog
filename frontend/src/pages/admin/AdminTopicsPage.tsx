import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, type TopicDto } from '../../api/admin';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';

export default function AdminTopicsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TopicDto | null>(null);
  const [name, setName] = useState('');
  const [colorHex, setColorHex] = useState('#7F77DD');
  const queryClient = useQueryClient();

  const { data: topics = [], isLoading } = useQuery({
    queryKey: ['admin', 'topics'],
    queryFn: () => adminApi.getTopics().then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: { name: string; colorHex: string }) => adminApi.createTopic(data),
    onSuccess: () => { closeModal(); queryClient.invalidateQueries({ queryKey: ['admin', 'topics'] }); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string; colorHex: string } }) => adminApi.updateTopic(id, data),
    onSuccess: () => { closeModal(); queryClient.invalidateQueries({ queryKey: ['admin', 'topics'] }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteTopic(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'topics'] }),
  });

  const openCreate = () => { setEditing(null); setName(''); setColorHex('#7F77DD'); setModalOpen(true); };
  const openEdit = (t: TopicDto) => { setEditing(t); setName(t.name); setColorHex(t.colorHex || '#7F77DD'); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditing(null); };

  const handleSubmit = () => {
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: { name, colorHex } });
    } else {
      createMutation.mutate({ name, colorHex });
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Topics</h1>
        <Button onClick={openCreate}>+ New Topic</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner className="h-8 w-8" /></div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((t) => (
            <div key={t.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-surface-light p-4 dark:border-gray-700 dark:bg-surface-dark">
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 rounded-full" style={{ backgroundColor: t.colorHex || '#7F77DD' }} />
                <span className="font-medium text-gray-900 dark:text-gray-100">{t.name}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(t)} className="text-xs text-primary hover:underline">Edit</button>
                <button onClick={() => deleteMutation.mutate(t.id)} className="text-xs text-red-500 hover:underline">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Edit Topic' : 'New Topic'}>
        <div className="space-y-4">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Color</label>
            <input type="color" value={colorHex} onChange={(e) => setColorHex(e.target.value)} className="h-10 w-20 cursor-pointer rounded border-0" />
          </div>
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
