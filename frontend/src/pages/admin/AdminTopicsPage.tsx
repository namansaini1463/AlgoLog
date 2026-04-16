import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, type TopicDto } from '../../api/admin';
import { CategoryBadge } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import { useCategoryStore } from '../../store/categoryStore';
import { cn } from '../../utils/cn';

export default function AdminTopicsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TopicDto | null>(null);
  const [name, setName] = useState('');
  const [colorHex, setColorHex] = useState('#7F77DD');
  const [topicCategory, setTopicCategory] = useState('DSA');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const { categories } = useCategoryStore();
  const queryClient = useQueryClient();

  const { data: topics = [], isLoading } = useQuery({
    queryKey: ['admin', 'topics'],
    queryFn: () => adminApi.getTopics().then((r) => r.data),
  });

  const filteredTopics = filterCategory === 'ALL'
    ? topics
    : topics.filter((t) => t.category === filterCategory);

  const createMutation = useMutation({
    mutationFn: (data: { name: string; colorHex: string; category: string }) => adminApi.createTopic(data),
    onSuccess: () => { closeModal(); queryClient.invalidateQueries({ queryKey: ['admin', 'topics'] }); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string; colorHex: string; category: string } }) => adminApi.updateTopic(id, data),
    onSuccess: () => { closeModal(); queryClient.invalidateQueries({ queryKey: ['admin', 'topics'] }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteTopic(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'topics'] }),
  });

  const openCreate = () => { setEditing(null); setName(''); setColorHex('#7F77DD'); setTopicCategory('DSA'); setModalOpen(true); };
  const openEdit = (t: TopicDto) => { setEditing(t); setName(t.name); setColorHex(t.colorHex || '#7F77DD'); setTopicCategory(t.category || 'DSA'); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditing(null); };

  const handleSubmit = () => {
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: { name, colorHex, category: topicCategory } });
    } else {
      createMutation.mutate({ name, colorHex, category: topicCategory });
    }
  };

  return (
    <div>
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100">Topics</h1>
        <Button onClick={openCreate} className="w-full sm:w-auto">+ New Topic</Button>
      </div>

      {/* Category filter */}
      <div className="mb-4 flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800 w-fit overflow-x-auto">
        <button
          onClick={() => setFilterCategory('ALL')}
          className={cn(
            'rounded-md px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap',
            filterCategory === 'ALL'
              ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          )}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilterCategory(cat.name)}
            className={cn(
              'rounded-md px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap',
              filterCategory === cat.name
                ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner className="h-8 w-8" /></div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredTopics.map((t) => (
            <div key={t.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 transition-all hover:shadow-md dark:border-gray-700 dark:bg-surface-dark">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="h-4 w-4 rounded-full shrink-0" style={{ backgroundColor: t.colorHex || '#7F77DD' }} />
                <span className="font-medium text-gray-900 dark:text-gray-100 truncate">{t.name}</span>
                <CategoryBadge name={t.category} />
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => openEdit(t)} className="text-xs sm:text-sm text-primary hover:underline">Edit</button>
                <button onClick={() => deleteMutation.mutate(t.id)} className="text-xs sm:text-sm text-red-500 hover:underline">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Edit Topic' : 'New Topic'}>
        <div className="space-y-4">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
            <input
              type="text"
              value={topicCategory}
              onChange={(e) => setTopicCategory(e.target.value)}
              list="category-suggestions"
              placeholder="e.g. DSA, LLD, Spring Boot..."
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            />
            <datalist id="category-suggestions">
              {categories.map((c) => <option key={c.id} value={c.name} />)}
            </datalist>
          </div>
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
