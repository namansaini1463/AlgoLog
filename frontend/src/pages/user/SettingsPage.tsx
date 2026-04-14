import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi, type NotificationPreferences } from '../../api/settings';
import TopBar from '../../components/layout/TopBar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
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
