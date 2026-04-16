import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi, type NotificationPreferences } from '../../api/settings';
import { categoriesApi, type UserCategoryRequest } from '../../api/categories';
import { useCategoryStore } from '../../store/categoryStore';
import TopBar from '../../components/layout/TopBar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
} from '../../services/notifications';
import { canInstallPWA, installPWA, isPWAInstalled } from '../../services/pwa';

const TIMEZONES = [
  'Asia/Kolkata',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
  'Pacific/Auckland',
];

function PWAInstallCard() {
  const [installable, setInstallable] = useState(canInstallPWA());
  const installed = isPWAInstalled();

  useEffect(() => {
    const onInstallable = () => setInstallable(true);
    const onInstalled = () => setInstallable(false);
    window.addEventListener('pwa-installable', onInstallable);
    window.addEventListener('pwa-installed', onInstalled);
    return () => {
      window.removeEventListener('pwa-installable', onInstallable);
      window.removeEventListener('pwa-installed', onInstalled);
    };
  }, []);

  if (installed) {
    return (
      <Card>
        <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">App Installation</h3>
        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
          <span>✓</span>
          <span>AlgoLog is installed as an app</span>
        </div>
      </Card>
    );
  }

  if (!installable) return null;

  return (
    <Card>
      <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Install App</h3>
      <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
        Install AlgoLog as an app for quick access and offline support.
      </p>
      <Button size="sm" onClick={() => installPWA()}>
        Install AlgoLog
      </Button>
    </Card>
  );
}

function PushNotificationCard() {
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(
    getNotificationPermission()
  );

  if (!isNotificationSupported()) {
    return (
      <Card>
        <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Push Notifications</h3>
        <p className="text-xs text-gray-500">Your browser does not support push notifications.</p>
      </Card>
    );
  }

  const handleRequest = async () => {
    const result = await requestNotificationPermission();
    setPermission(result);
  };

  return (
    <Card>
      <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Push Notifications</h3>
      <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
        Get notified when problems are due for revision.
      </p>
      {permission === 'granted' ? (
        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
          <span>✓</span>
          <span>Notifications enabled</span>
        </div>
      ) : permission === 'denied' ? (
        <p className="text-xs text-red-500">
          Notifications are blocked. Please enable them in your browser settings.
        </p>
      ) : (
        <Button size="sm" onClick={handleRequest}>
          Enable Notifications
        </Button>
      )}
    </Card>
  );
}

function CategoriesCard() {
  const { categories, fetchCategories } = useCategoryStore();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [colorHex, setColorHex] = useState('#6C63FF');
  const [error, setError] = useState('');

  const createMutation = useMutation({
    mutationFn: (data: UserCategoryRequest) => categoriesApi.create(data),
    onSuccess: () => { resetForm(); fetchCategories(); },
    onError: (err: any) => setError(err?.response?.data?.message || 'Failed to create'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UserCategoryRequest }) => categoriesApi.update(id, data),
    onSuccess: () => { resetForm(); fetchCategories(); },
    onError: (err: any) => setError(err?.response?.data?.message || 'Failed to update'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onSuccess: () => fetchCategories(),
    onError: (err: any) => setError(err?.response?.data?.message || 'Cannot delete — problems exist in this category'),
  });

  const reorderMutation = useMutation({
    mutationFn: (ids: string[]) => categoriesApi.reorder(ids),
    onSuccess: () => fetchCategories(),
  });

  const resetForm = () => {
    setAdding(false);
    setEditingId(null);
    setName('');
    setColorHex('#6C63FF');
    setError('');
  };

  const startEdit = (cat: typeof categories[0]) => {
    setEditingId(cat.id);
    setName(cat.name);
    setColorHex(cat.colorHex);
    setAdding(false);
    setError('');
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    setError('');
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: { name: name.trim(), colorHex } });
    } else {
      createMutation.mutate({ name: name.trim(), colorHex });
    }
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const ids = categories.map((c) => c.id);
    [ids[index - 1], ids[index]] = [ids[index], ids[index - 1]];
    reorderMutation.mutate(ids);
  };

  const moveDown = (index: number) => {
    if (index >= categories.length - 1) return;
    const ids = categories.map((c) => c.id);
    [ids[index], ids[index + 1]] = [ids[index + 1], ids[index]];
    reorderMutation.mutate(ids);
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Categories</h3>
        <Button size="sm" onClick={() => { resetForm(); setAdding(true); }}>+ Add</Button>
      </div>

      <div className="space-y-2">
        {categories.map((cat, i) => (
          <div key={cat.id} className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2.5 dark:border-gray-700 dark:bg-surface-dark">
            <div className="h-4 w-4 rounded-full shrink-0" style={{ backgroundColor: cat.colorHex }} />
            <span className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{cat.name}</span>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => moveUp(i)} disabled={i === 0}
                className="rounded p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 dark:hover:text-gray-300"
                title="Move up">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <button onClick={() => moveDown(i)} disabled={i >= categories.length - 1}
                className="rounded p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 dark:hover:text-gray-300"
                title="Move down">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <button onClick={() => startEdit(cat)}
                className="text-xs text-primary hover:underline ml-1">Edit</button>
              <button onClick={() => { setError(''); deleteMutation.mutate(cat.id); }}
                className="text-xs text-red-500 hover:underline ml-1">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit form */}
      {(adding || editingId) && (
        <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50 space-y-3">
          <Input
            label={editingId ? 'Rename Category' : 'Category Name'}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Spring Boot, React, DevOps..."
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Color</label>
            <input type="color" value={colorHex} onChange={(e) => setColorHex(e.target.value)}
              className="h-8 w-12 cursor-pointer rounded border-0" />
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={resetForm}>Cancel</Button>
            <Button size="sm" onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}>
              {editingId ? 'Save' : 'Create'}
            </Button>
          </div>
        </div>
      )}

      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </Card>
  );
}

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const isAdmin = useAuthStore((s) => s.isAdmin());
  const [form, setForm] = useState<NotificationPreferences>({
    emailReminders: true,
    reminderTime: '09:00',
    reminderTimezone: 'Asia/Kolkata',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['settings', 'notifications'],
    queryFn: () => settingsApi.getNotifications().then((r) => r.data),
  });

  useEffect(() => {
    if (data) {
      setForm({
        emailReminders: data.emailReminders,
        reminderTime: data.reminderTime || '09:00',
        reminderTimezone: data.reminderTimezone || 'Asia/Kolkata',
      });
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: (prefs: Partial<NotificationPreferences>) => settingsApi.updateNotifications(prefs),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });

  const testEmailMutation = useMutation({
    mutationFn: () => settingsApi.sendTestEmail().then((r) => r.data),
  });

  return (
    <div>
      <TopBar title="Settings" />

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner className="h-8 w-8" /></div>
      ) : (
        <div className="max-w-lg space-y-6">
          {/* Categories Management */}
          <CategoriesCard />

          {/* PWA Install */}
          <PWAInstallCard />

          {/* Push Notifications */}
          <PushNotificationCard />

          <Card>
            <h3 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
              Notification Preferences
            </h3>
            <p className="mb-4 text-xs text-gray-400">
              Receive daily email reminders about problems that are due for revision.
            </p>

            <div className="space-y-4">
              {/* Email reminders toggle */}
              <label className="flex items-center gap-3 cursor-pointer">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, emailReminders: !form.emailReminders })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    form.emailReminders ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                      form.emailReminders ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className="text-sm text-gray-700 dark:text-gray-300">Email reminders</span>
              </label>

              {/* Reminder time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Reminder time
                </label>
                <input
                  type="time"
                  value={form.reminderTime}
                  onChange={(e) => setForm({ ...form, reminderTime: e.target.value })}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>

              {/* Timezone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Timezone
                </label>
                <select
                  value={form.reminderTimezone}
                  onChange={(e) => setForm({ ...form, reminderTimezone: e.target.value })}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={() => saveMutation.mutate(form)}
                  disabled={saveMutation.isPending}
                >
                  {saveMutation.isPending ? 'Saving...' : 'Save Preferences'}
                </Button>
                {isAdmin && (
                  <Button
                    variant="secondary"
                    onClick={() => testEmailMutation.mutate()}
                    disabled={testEmailMutation.isPending}
                  >
                    {testEmailMutation.isPending ? 'Sending...' : 'Send Test Email'}
                  </Button>
                )}
              </div>

              {saveMutation.isSuccess && (
                <p className="text-xs text-green-500">Preferences saved!</p>
              )}
              {isAdmin && testEmailMutation.isSuccess && (
                <p className="text-xs text-green-500">
                  {testEmailMutation.data?.message} — {testEmailMutation.data?.note}
                </p>
              )}
              {isAdmin && testEmailMutation.isError && (
                <p className="text-xs text-red-500">
                  {(testEmailMutation.error as any)?.response?.data?.error || 'Failed to send test email'}
                </p>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
