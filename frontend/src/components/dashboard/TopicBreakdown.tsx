import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { problemsApi } from '../../api/problems';
import Card from '../ui/Card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { cn } from '../../utils/cn';

type ViewMode = 'chart' | 'list';

const BAR_COLORS = [
  '#7F77DD', '#6C63FF', '#5B54D6', '#8B83E8', '#9D96F0',
  '#A9A3F5', '#B5B0F7', '#C1BDF9', '#7068CC', '#645DC0',
];

export default function TopicBreakdown() {
  const [view, setView] = useState<ViewMode>('chart');
  const chartScrollRef = useRef<HTMLDivElement>(null);

  const { data } = useQuery({
    queryKey: ['problems', 'all'],
    queryFn: () => problemsApi.list({ size: 1000 }).then((r) => r.data),
  });

  const topicCounts: Record<string, number> = {};
  data?.content?.forEach((p) => {
    const topic = p.problem?.topic || p.customTopic || 'Unknown';
    topicCounts[topic] = (topicCounts[topic] || 0) + 1;
  });

  const allTopics = Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));

  const chartData = allTopics.slice(0, 10);
  const totalProblems = allTopics.reduce((sum, t) => sum + t.count, 0);

  // Ensure minimum chart width for readability on small screens
  const minChartWidth = Math.max(chartData.length * 60, 300);

  // Scroll to beginning on view change
  useEffect(() => {
    if (chartScrollRef.current) {
      chartScrollRef.current.scrollLeft = 0;
    }
  }, [view]);

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Topic Breakdown
        </h3>
        {allTopics.length > 0 && (
          <div className="flex rounded-lg bg-gray-100 p-0.5 dark:bg-gray-800">
            <button
              onClick={() => setView('chart')}
              className={cn(
                'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                view === 'chart'
                  ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              )}
            >
              Chart
            </button>
            <button
              onClick={() => setView('list')}
              className={cn(
                'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                view === 'list'
                  ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              )}
            >
              List
            </button>
          </div>
        )}
      </div>

      {allTopics.length === 0 ? (
        <p className="text-sm text-gray-400">No problems solved yet</p>
      ) : view === 'chart' ? (
        <div
          ref={chartScrollRef}
          className="scrollbar-styled overflow-x-auto pb-1"
        >
          <div style={{ minWidth: `${minChartWidth}px` }}>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData} margin={{ top: 8, right: 4, bottom: 0, left: -8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(156,163,175,0.15)" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10 }}
                  angle={-35}
                  textAnchor="end"
                  height={60}
                  stroke="#9CA3AF"
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(156,163,175,0.2)' }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11 }}
                  stroke="#9CA3AF"
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#F9FAFB',
                    fontSize: '12px',
                    padding: '8px 12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  }}
                  cursor={{ fill: 'rgba(127, 119, 221, 0.08)' }}
                  formatter={(value: any) =>
                    value !== undefined ? [`${value} problems`, 'Count'] : ['', '']
                  }
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={36} animationDuration={600}>
                  {chartData.map((_, index) => (
                    <Cell key={index} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="scrollbar-styled space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
          {allTopics.map((topic, i) => {
            const pct = totalProblems > 0 ? (topic.count / totalProblems) * 100 : 0;
            return (
              <div key={topic.name} className="group">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: BAR_COLORS[i % BAR_COLORS.length] }}
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                      {topic.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {topic.count}
                    </span>
                    <span className="text-xs text-gray-400 w-10 text-right">
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                </div>
                <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: BAR_COLORS[i % BAR_COLORS.length],
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary footer */}
      {allTopics.length > 0 && (
        <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-800">
          <span className="text-xs text-gray-400">
            {allTopics.length} {allTopics.length === 1 ? 'topic' : 'topics'}
          </span>
          <span className="text-xs text-gray-400">
            {totalProblems} {totalProblems === 1 ? 'problem' : 'problems'} total
          </span>
        </div>
      )}
    </Card>
  );
}
