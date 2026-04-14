import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { activityApi } from '../../api/activity';
import { revisionsApi, type RevisionItem } from '../../api/revisions';
import { useAuthStore } from '../../store/authStore';
import TopBar from '../../components/layout/TopBar';
import StatCard from '../../components/dashboard/StatCard';
import ActivityHeatmap from '../../components/dashboard/ActivityHeatmap';
import TopicBreakdown from '../../components/dashboard/TopicBreakdown';
import RevisionCard from '../../components/revision/RevisionCard';
import Card from '../../components/ui/Card';
import NotificationBanner from '../../components/ui/NotificationBanner';
import DailyChecklist from '../../components/dashboard/DailyChecklist';
import QuickTimer from '../../components/dashboard/QuickTimer';

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  const { data: streak } = useQuery({
    queryKey: ['streak'],
    queryFn: () => activityApi.streak().then((r) => r.data),
  });

  const { data: queue } = useQuery({
    queryKey: ['revisions', 'queue'],
    queryFn: () => revisionsApi.queue().then((r) => r.data),
  });

  const completeMutation = useMutation({
    mutationFn: ({ id, confidence }: { id: string; confidence: number }) =>
      revisionsApi.complete(id, confidence),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['revisions'] });
      queryClient.invalidateQueries({ queryKey: ['streak'] });
      queryClient.invalidateQueries({ queryKey: ['heatmap'] });
    },
  });

  const snoozeMutation = useMutation({
    mutationFn: (id: string) => revisionsApi.snooze(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['revisions'] });
    },
  });

  // Build a merged list of up to 5 items: flagged -> overdue -> due today
  const dashboardRevisions: RevisionItem[] = [];
  if (queue) {
    dashboardRevisions.push(...queue.flagged);
    dashboardRevisions.push(...queue.overdue);
    dashboardRevisions.push(...queue.dueToday);
  }
  const revisionItems = dashboardRevisions.slice(0, 5);
  const moreCount = dashboardRevisions.length - 5;
  const stats = queue?.stats;
  const overdueCount = stats?.overdueCount ?? 0;
  const dueTodayCount = stats?.dueTodayCount ?? 0;

  // Personalization helpers
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getMotivationalMessage = () => {
    const currentStreak = streak?.currentStreak ?? 0;
    const totalSolved = streak?.totalSolved ?? 0;
    
    if (overdueCount > 5) {
      return "You've got this! Let's tackle those overdue revisions together. 💪";
    }
    if (currentStreak >= 7) {
      return `Amazing ${currentStreak}-day streak! You're on fire! 🔥`;
    }
    if (currentStreak >= 3) {
      return `${currentStreak} days strong! Keep the momentum going! 🚀`;
    }
    if (totalSolved === 0) {
      return "Welcome to AlgoLog! Ready to start your coding journey? 🌟";
    }
    if (dueTodayCount === 0 && overdueCount === 0) {
      return "All caught up! Time to learn something new? 📚";
    }
    if (dueTodayCount > 0) {
      return `${dueTodayCount} problem${dueTodayCount > 1 ? 's' : ''} waiting for review. Let's reinforce that knowledge! 🎯`;
    }
    return "Every problem solved is a step forward. Keep growing! 🌱";
  };

  return (
    <div>
      <TopBar title="Dashboard" showAddButton />

      <NotificationBanner />

      {/* Personalized Welcome Section */}
      <div className="mb-6 rounded-xl bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 dark:from-primary/20 dark:via-purple-500/20 dark:to-pink-500/20 p-5 sm:p-6 border border-primary/20 dark:border-primary/30 shadow-sm">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {getGreeting()}, {user?.username || 'there'}! 👋
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          {getMotivationalMessage()}
        </p>
      </div>

      {/* Stats row */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Total Solved" value={streak?.totalSolved ?? 0} icon="✅" />
        <StatCard label="Total Revised" value={streak?.totalRevised ?? 0} icon="🔁" color="bg-blue-100 dark:bg-blue-900/20" />
        <StatCard label="Due Today" value={dueTodayCount} icon="📅" color="bg-amber-100 dark:bg-amber-900/20" />
        <StatCard label="Current Streak" value={`${streak?.currentStreak ?? 0}d`} icon="🔥" color="bg-orange-100 dark:bg-orange-900/20" />
        <StatCard label="Overdue" value={overdueCount} icon="⚠️" color="bg-red-100 dark:bg-red-900/20" />
      </div>

      {/* Quick Timer + Daily Checklist */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <QuickTimer />
        <DailyChecklist />
      </div>

      {/* Two-column: Revisions + Topic breakdown */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Today's Revisions */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300">
              Today's Revisions ({dashboardRevisions.length})
            </h3>
            <Link
              to="/revisions"
              className="text-xs sm:text-sm text-primary hover:underline font-medium"
            >
              See full queue →
            </Link>
          </div>
          {revisionItems.length > 0 ? (
            <>
              <div className="space-y-3">
                {revisionItems.map((item) => (
                  <RevisionCard
                    key={item.revisionId}
                    item={item}
                    onComplete={(id, confidence) => completeMutation.mutate({ id, confidence })}
                    onSnooze={(id) => snoozeMutation.mutate(id)}
                    completePending={completeMutation.isPending}
                    snoozePending={snoozeMutation.isPending}
                    compact
                  />
                ))}
              </div>
              {moreCount > 0 && (
                <div className="mt-4 text-center">
                  <Link to="/revisions" className="text-xs sm:text-sm text-primary hover:underline font-medium">
                    + {moreCount} more due today →
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 sm:py-12 text-center">
              <div className="text-4xl sm:text-5xl mb-3">🎉</div>
              <p className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-1">
                All caught up, {user?.username}!
              </p>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">No revisions due today.</p>
            </div>
          )}
        </Card>

        {/* Topic breakdown */}
        <TopicBreakdown />
      </div>

      {/* Heatmap - full width */}
      <ActivityHeatmap />
    </div>
  );
}
