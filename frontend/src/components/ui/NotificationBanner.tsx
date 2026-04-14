import { useState, useEffect } from 'react';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
} from '../../services/notifications';

export default function NotificationBanner() {
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setPermission(getNotificationPermission());
    setDismissed(localStorage.getItem('algolog_notif_dismissed') === 'true');
  }, []);

  if (!isNotificationSupported() || permission !== 'default' || dismissed) {
    return null;
  }

  const handleEnable = async () => {
    const result = await requestNotificationPermission();
    setPermission(result);
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('algolog_notif_dismissed', 'true');
  };

  return (
    <div className="mb-4 flex items-center gap-3 rounded-lg bg-primary/10 dark:bg-primary/20 border border-primary/20 px-4 py-3">
      <span className="text-lg">🔔</span>
      <p className="flex-1 text-sm text-gray-700 dark:text-gray-300">
        Enable notifications to get reminded when problems are due for revision.
      </p>
      <button
        onClick={handleEnable}
        className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-dark transition-colors"
      >
        Enable
      </button>
      <button
        onClick={handleDismiss}
        className="rounded-md px-2 py-1.5 text-xs text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        Later
      </button>
    </div>
  );
}
