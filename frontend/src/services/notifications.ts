import { revisionsApi } from '../api/revisions';

const NOTIFICATION_CHECK_INTERVAL = 60 * 60 * 1000; // 1 hour
const LAST_NOTIFIED_KEY = 'algolog_last_notified';

export function isNotificationSupported(): boolean {
  return 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!isNotificationSupported()) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  return Notification.requestPermission();
}

export function showNotification(title: string, options?: Record<string, unknown>): void {
  if (getNotificationPermission() !== 'granted') return;

  const opts = {
    icon: '/icons/icon-192.svg',
    badge: '/favicon.svg',
    tag: 'algolog-revision',
    renotify: true,
    ...options,
  };

  // Use service worker notifications if available (works when app is in background)
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification(title, opts);
    });
  } else {
    // Fallback to regular notifications
    new Notification(title, opts as NotificationOptions);
  }
}

function shouldNotify(): boolean {
  const lastNotified = localStorage.getItem(LAST_NOTIFIED_KEY);
  if (!lastNotified) return true;
  return Date.now() - parseInt(lastNotified, 10) > NOTIFICATION_CHECK_INTERVAL;
}

function markNotified(): void {
  localStorage.setItem(LAST_NOTIFIED_KEY, Date.now().toString());
}

export async function checkAndNotifyDueRevisions(): Promise<void> {
  if (getNotificationPermission() !== 'granted') return;
  if (!shouldNotify()) return;

  try {
    const { data: stats } = await revisionsApi.stats();
    const total = stats.dueTodayCount + stats.overdueCount;

    if (total > 0) {
      const parts: string[] = [];
      if (stats.overdueCount > 0) {
        parts.push(`${stats.overdueCount} overdue`);
      }
      if (stats.dueTodayCount > 0) {
        parts.push(`${stats.dueTodayCount} due today`);
      }

      showNotification('AlgoLog - Revisions Due', {
        body: `You have ${parts.join(' and ')} problem${total > 1 ? 's' : ''} to review!`,
        actions: [
          { action: 'view', title: 'Review Now' },
          { action: 'dismiss', title: 'Later' },
        ],
      });
      markNotified();
    }
  } catch {
    // Silently fail - user may not be authenticated
  }
}

let intervalId: ReturnType<typeof setInterval> | null = null;

export function startNotificationPolling(): void {
  if (intervalId) return;
  // Check immediately
  checkAndNotifyDueRevisions();
  // Then check every hour
  intervalId = setInterval(checkAndNotifyDueRevisions, NOTIFICATION_CHECK_INTERVAL);
}

export function stopNotificationPolling(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

export function showTimerNotification(timerName: string): void {
  showNotification(`${timerName} Complete!`, {
    body: timerName.includes('Pomodoro')
      ? 'Time for a break! Great focus session.'
      : timerName.includes('Break')
        ? 'Break is over! Ready to get back to work?'
        : `Your ${timerName} timer has finished.`,
    tag: 'algolog-timer',
    requireInteraction: true,
  });
}
