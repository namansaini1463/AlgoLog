import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { activityApi, type HeatmapEntry } from '../../api/activity';
import Card from '../ui/Card';
import { cn } from '../../utils/cn';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_LABELS = ['Mon', '', 'Wed', '', 'Fri', '', ''];

const INTENSITY_LEVELS = [
  'bg-gray-100 dark:bg-gray-800',           // 0
  'bg-primary/20',                           // 1
  'bg-primary/40',                           // 2
  'bg-primary/60',                           // 3
  'bg-primary/80',                           // 4
  'bg-primary',                              // 5+
];

function getIntensity(count: number, max: number): string {
  if (count === 0) return INTENSITY_LEVELS[0];
  if (max <= 5) {
    // Low-volume: direct mapping
    if (count === 1) return INTENSITY_LEVELS[1];
    if (count === 2) return INTENSITY_LEVELS[2];
    if (count === 3) return INTENSITY_LEVELS[3];
    if (count === 4) return INTENSITY_LEVELS[4];
    return INTENSITY_LEVELS[5];
  }
  // Scale relative to max
  const ratio = count / max;
  if (ratio <= 0.2) return INTENSITY_LEVELS[1];
  if (ratio <= 0.4) return INTENSITY_LEVELS[2];
  if (ratio <= 0.6) return INTENSITY_LEVELS[3];
  if (ratio <= 0.8) return INTENSITY_LEVELS[4];
  return INTENSITY_LEVELS[5];
}

interface MonthData {
  label: string;
  year: number;
  // weeks -> days (0=Mon..6=Sun)
  weeks: (HeatmapEntry | null)[][]; 
}

function groupByMonth(entries: HeatmapEntry[], monthsBack: number): MonthData[] {
  if (entries.length === 0) return [];

  const lookup = new Map<string, HeatmapEntry>();
  for (const e of entries) {
    lookup.set(e.date, e);
  }

  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth() - (monthsBack - 1), 1);

  const months: MonthData[] = [];
  const current = new Date(start);

  while (current <= today) {
    const year = current.getFullYear();
    const month = current.getMonth();
    const label = MONTH_NAMES[month];

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    if (lastDay > today) lastDay.setTime(today.getTime());

    const weeks: (HeatmapEntry | null)[][] = [];
    let currentWeek: (HeatmapEntry | null)[] = Array(7).fill(null);

    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
      const jsDay = d.getDay();
      const dayIdx = jsDay === 0 ? 6 : jsDay - 1;

      const dateStr = d.toISOString().split('T')[0];
      const entry = lookup.get(dateStr) || { date: dateStr, count: 0 };

      if (dayIdx === 0 && currentWeek.some((c) => c !== null)) {
        weeks.push(currentWeek);
        currentWeek = Array(7).fill(null);
      }

      currentWeek[dayIdx] = entry;
    }

    if (currentWeek.some((c) => c !== null)) {
      weeks.push(currentWeek);
    }

    months.push({ label, year, weeks });
    current.setMonth(current.getMonth() + 1);
  }

  return months;
}

interface TooltipData {
  date: string;
  count: number;
  rect: DOMRect;
}

function HeatmapTooltip({ data }: { data: TooltipData }) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ left: 0, top: 0 });

  useEffect(() => {
    const { rect } = data;
    const el = tooltipRef.current;
    if (!el) return;

    const tooltipWidth = el.offsetWidth;
    let left = rect.left + rect.width / 2 - tooltipWidth / 2;
    const top = rect.top - el.offsetHeight - 6;

    // Clamp to viewport
    if (left < 4) left = 4;
    if (left + tooltipWidth > window.innerWidth - 4) left = window.innerWidth - tooltipWidth - 4;

    setPos({ left, top });
  }, [data]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  return createPortal(
    <div
      ref={tooltipRef}
      className="pointer-events-none fixed z-[9999] rounded-lg bg-gray-900 px-3 py-1.5 text-xs text-white shadow-lg dark:bg-gray-700"
      style={{ left: pos.left, top: pos.top }}
    >
      <div className="font-medium">{formatDate(data.date)}</div>
      <div className="text-gray-300 dark:text-gray-400">
        {data.count} {data.count === 1 ? 'submission' : 'submissions'}
      </div>
      <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
    </div>,
    document.body
  );
}

function useContainerWidth(ref: React.RefObject<HTMLElement | null>) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setWidth(entry.contentRect.width);
      }
    });
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, [ref]);
  return width;
}

function getMonthsForWidth(width: number): number {
  if (width >= 1100) return 12;
  if (width >= 820) return 9;
  if (width >= 540) return 6;
  return 3;
}

export default function ActivityHeatmap() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const containerWidth = useContainerWidth(containerRef);
  const monthsToShow = getMonthsForWidth(containerWidth);

  const { data: entries = [] } = useQuery({
    queryKey: ['heatmap'],
    queryFn: () => activityApi.heatmap().then((r) => r.data),
  });

  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  const months = useMemo(() => groupByMonth(entries, monthsToShow), [entries, monthsToShow]);

  const maxCount = useMemo(
    () => entries.reduce((m, e) => Math.max(m, e.count), 0),
    [entries]
  );

  const totalSubmissions = useMemo(
    () => entries.reduce((sum, e) => sum + e.count, 0),
    [entries]
  );

  const activeDays = useMemo(
    () => entries.filter((e) => e.count > 0).length,
    [entries]
  );

  // Auto-scroll to the right (most recent) on mount
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollLeft = el.scrollWidth;
    }
  }, [months]);

  const handleMouseEnter = useCallback((entry: HeatmapEntry, e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setTooltip({ date: entry.date, count: entry.count, rect });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTooltip(null);
  }, []);

  return (
    <Card ref={containerRef}>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Activity (Last {monthsToShow} Months)
        </h3>
        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
          <span>
            <span className="font-semibold text-gray-700 dark:text-gray-200">{totalSubmissions}</span> submissions
          </span>
          <span className="h-3 w-px bg-gray-200 dark:bg-gray-700" />
          <span>
            <span className="font-semibold text-gray-700 dark:text-gray-200">{activeDays}</span> active days
          </span>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="scrollbar-styled relative overflow-x-auto pb-2"
      >
        <div className="inline-flex min-w-max gap-4 sm:gap-6">
          {/* Day labels column */}
          <div className="sticky left-0 z-10 flex flex-col bg-surface-light pt-6 dark:bg-surface-dark">
            {DAY_LABELS.map((label, i) => (
              <div key={i} className="flex h-[14px] items-center text-[10px] text-gray-400 dark:text-gray-500">
                {label}
              </div>
            ))}
          </div>

          {/* Monthly columns */}
          {months.map((month, mi) => (
            <div key={`${month.label}-${month.year}`} className="flex flex-col">
              {/* Month label */}
              <div className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                {month.label}{mi === 0 || month.label === 'Jan' ? ` '${String(month.year).slice(2)}` : ''}
              </div>

              {/* Weeks grid */}
              <div className="flex gap-[3px]">
                {month.weeks.map((week, wi) => (
                  <div key={wi} className="flex flex-col gap-[3px]">
                    {week.map((entry, di) => (
                      <div
                        key={di}
                        className={cn(
                          'h-[11px] w-[11px] rounded-sm transition-transform duration-100',
                          entry
                            ? cn(
                                getIntensity(entry.count, maxCount),
                                'cursor-pointer hover:scale-125 hover:ring-1 hover:ring-gray-400 dark:hover:ring-gray-500'
                              )
                            : 'bg-transparent'
                        )}
                        onMouseEnter={entry ? (e) => handleMouseEnter(entry, e) : undefined}
                        onMouseLeave={entry ? handleMouseLeave : undefined}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tooltip rendered via portal */}
      {tooltip && <HeatmapTooltip data={tooltip} />}

      {/* Legend */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <span>Less</span>
          {INTENSITY_LEVELS.map((cls, i) => (
            <div key={i} className={cn('h-[11px] w-[11px] rounded-sm', cls)} />
          ))}
          <span>More</span>
        </div>
        {maxCount > 0 && (
          <span className="text-[10px] text-gray-400 dark:text-gray-500">
            Peak: {maxCount} in a day
          </span>
        )}
      </div>
    </Card>
  );
}
