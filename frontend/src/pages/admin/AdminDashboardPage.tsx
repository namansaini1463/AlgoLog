import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import Card from '../../components/ui/Card';
import StatCard from '../../components/dashboard/StatCard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboardPage() {
  const { data: analytics } = useQuery({
    queryKey: ['admin', 'analytics'],
    queryFn: () => adminApi.getAnalytics().then((r) => r.data),
  });

  return (
    <div>
      <h1 className="mb-4 sm:mb-6 text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100">Admin Analytics</h1>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-3">
        <StatCard label="Total Users" value={analytics?.totalUsers ?? 0} icon="👥" color="bg-blue-100 dark:bg-blue-900/20" />
        <StatCard label="Total Problems" value={analytics?.totalProblems ?? 0} icon="📋" color="bg-purple-100 dark:bg-purple-900/20" />
        <StatCard label="Active Today" value={analytics?.activeToday ?? 0} icon="🟢" color="bg-green-100 dark:bg-green-900/20" />
      </div>

      {analytics?.topTopics && analytics.topTopics.length > 0 && (
        <Card>
          <h3 className="mb-4 text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300">Top Topics in Bank</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analytics.topTopics}>
              <XAxis dataKey="topic" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" height={60} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#FF6B6B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
}
