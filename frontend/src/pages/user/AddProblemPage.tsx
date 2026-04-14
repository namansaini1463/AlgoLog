import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { bankApi, type ProblemBank } from '../../api/bank';
import { problemsApi } from '../../api/problems';
import { topicsApi } from '../../api/topics';
import TopBar from '../../components/layout/TopBar';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import RichTextEditor from '../../components/ui/RichTextEditor';
import ConfidencePicker from '../../components/ui/ConfidencePicker';
import Select from '../../components/ui/Select';
import TagPicker from '../../components/ui/TagPicker';
import Badge, { difficultyVariant } from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { cn } from '../../utils/cn';
import { detectPlatform, ALL_PLATFORMS, type Platform } from '../../utils/detectPlatform';

type Mode = 'bank' | 'custom';

export default function AddProblemPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('custom');

  // Bank search state
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0);
  const [difficulty, setDifficulty] = useState('');
  const [selected, setSelected] = useState<ProblemBank | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0); // Reset to first page on search
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Custom problem state
  const [customTitle, setCustomTitle] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [customPlatformOverride, setCustomPlatformOverride] = useState<Platform | null>(null);
  const [customDifficulty, setCustomDifficulty] = useState('MEDIUM');
  const [customTags, setCustomTags] = useState<string[]>([]);

  // Auto-detect platform from URL; override takes precedence
  const detectedPlatform = useMemo(() => detectPlatform(customUrl), [customUrl]);
  const activePlatform = customPlatformOverride ?? detectedPlatform;

  // Shared state
  const [confidence, setConfidence] = useState(3);
  const [detailedNotes, setDetailedNotes] = useState('');
  const [timeTakenMins, setTimeTakenMins] = useState('');

  const { data: results, isLoading: isLoadingBank } = useQuery({
    queryKey: ['bank-search', debouncedSearch, page, difficulty],
    queryFn: () => {
      const params: Record<string, string | number> = { page, size: 20 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (difficulty) params.difficulty = difficulty;
      return bankApi.browse(params).then((r) => r.data);
    },
    enabled: mode === 'bank',
  });

  const { data: bankTags } = useQuery({
    queryKey: ['bank-tags'],
    queryFn: () => bankApi.getTags().then((r) => r.data),
  });

  const { data: topics } = useQuery({
    queryKey: ['topics'],
    queryFn: () => topicsApi.list().then((r) => r.data.map((t) => t.name)),
  });

  // Merge pre-seeded topics with existing bank tags (deduplicated)
  const allTags = [...new Set([...(topics || []), ...(bankTags || [])])];

  const logMutation = useMutation({
    mutationFn: () => {
      if (mode === 'bank' && selected) {
        return problemsApi.log({
          bankProblemId: selected.id,
          confidence,
          detailedNotes: detailedNotes || undefined,
          timeTakenMins: timeTakenMins ? parseInt(timeTakenMins) : undefined,
        });
      }
      return problemsApi.log({
        customTitle,
        customUrl: customUrl || undefined,
        customTopic: customTags[0] || undefined,  // Set topic to first tag
        customDifficulty: customDifficulty || undefined,
        customTags: customTags.length > 0 ? customTags : undefined,
        confidence,
        detailedNotes: detailedNotes || undefined,
        timeTakenMins: timeTakenMins ? parseInt(timeTakenMins) : undefined,
      });
    },
    onSuccess: () => navigate('/problems'),
  });

  const canSubmit = mode === 'bank' ? !!selected : customTitle.trim().length > 0;

  return (
    <div>
      <TopBar title="Log a Problem" />

      {/* Mode toggle */}
      <div className="mb-6 flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800 w-fit">
        <button
          onClick={() => { setMode('custom'); setSelected(null); }}
          className={cn(
            'rounded-md px-4 py-2 text-sm font-medium transition-colors',
            mode === 'custom'
              ? 'bg-primary text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 dark:text-gray-400'
          )}
        >
          Add Custom
        </button>
        <button
          onClick={() => { setMode('bank'); setCustomTitle(''); setCustomUrl(''); }}
          className={cn(
            'rounded-md px-4 py-2 text-sm font-medium transition-colors',
            mode === 'bank'
              ? 'bg-primary text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 dark:text-gray-400'
          )}
        >
          From Problem Bank
        </button>
      </div>

      <div className={cn('space-y-5', mode === 'custom' ? 'max-w-xl' : 'max-w-2xl')}>
        {/* Problem identification */}
        {mode === 'custom' ? (
          <>
            <Input
              label="Problem Name"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="e.g. Two Sum"
              required
            />
            <Input
              label="Problem Link"
              value={customUrl}
              onChange={(e) => {
                setCustomUrl(e.target.value);
                setCustomPlatformOverride(null); // reset override on new URL
              }}
              placeholder="https://leetcode.com/problems/two-sum"
            />

            {/* Platform auto-detection */}
            {customUrl.trim() && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Platform:</span>
                {/* Auto-detected a known platform and no override active */}
                {detectedPlatform && detectedPlatform !== 'Other' && customPlatformOverride === null ? (
                  <>
                    <Badge className="bg-primary/10 text-primary">{detectedPlatform}</Badge>
                    <button
                      type="button"
                      onClick={() => setCustomPlatformOverride(detectedPlatform)}
                      className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      Change
                    </button>
                  </>
                ) : (
                  /* Unknown platform OR user clicked Change — show dropdown */
                  <>
                    <select
                      value={activePlatform || 'Other'}
                      onChange={(e) => setCustomPlatformOverride(e.target.value as Platform)}
                      className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                    >
                      {ALL_PLATFORMS.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                    {/* Show Reset only when overriding a known auto-detection */}
                    {detectedPlatform && detectedPlatform !== 'Other' && (
                      <button
                        type="button"
                        onClick={() => setCustomPlatformOverride(null)}
                        className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        Reset
                      </button>
                    )}
                  </>
                )}
              </div>
            )}

            <Select
              label="Difficulty"
              value={customDifficulty}
              onChange={(e) => setCustomDifficulty(e.target.value)}
              options={[
                { value: 'EASY', label: 'Easy' },
                { value: 'MEDIUM', label: 'Medium' },
                { value: 'HARD', label: 'Hard' },
              ]}
            />

            <TagPicker
              label="Tags (categories/topics)"
              availableTags={allTags}
              selectedTags={customTags}
              onChange={setCustomTags}
              allowCustom
              placeholder="Search or add tags..."
            />
          </>
        ) : !selected ? (
          <div>
            <div className="mb-4 flex flex-wrap gap-3">
              <Input
                placeholder="Search by title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-64"
              />
              <Select
                value={difficulty}
                onChange={(e) => { setDifficulty(e.target.value); setPage(0); }}
                options={[
                  { value: '', label: 'All Difficulties' },
                  { value: 'EASY', label: 'Easy' },
                  { value: 'MEDIUM', label: 'Medium' },
                  { value: 'HARD', label: 'Hard' },
                ]}
              />
            </div>
            {isLoadingBank ? (
              <div className="flex justify-center py-12"><Spinner className="h-8 w-8" /></div>
            ) : results?.content && results.content.length > 0 ? (
              <>
                <div className="space-y-2">
                  {results.content.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelected(p)}
                      className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-gray-200 bg-surface-light p-3 sm:p-4 text-left hover:border-primary/40 hover:bg-primary/5 dark:border-gray-700 dark:bg-surface-dark dark:hover:border-primary/40"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-gray-900 dark:text-gray-100">{p.title}</span>
                          <Badge variant={difficultyVariant(p.difficulty)}>{p.difficulty}</Badge>
                          <Badge variant="topic">{p.topic}</Badge>
                          {p.platform && (
                            <span className="text-xs text-primary">
                              {p.platform}
                            </span>
                          )}
                        </div>
                        {p.tags?.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {p.tags.map((t) => (
                              <Badge key={t} className="text-[10px]">{t}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="shrink-0 self-start sm:self-center text-xs font-medium text-primary">
                        Select →
                      </span>
                    </button>
                  ))}
                </div>
                {results.totalPages > 1 && (
                  <div className="mt-6 flex justify-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0}
                      className="rounded-lg px-3 py-1 text-sm disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1 text-sm text-gray-500">
                      {page + 1} / {results.totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(results.totalPages - 1, p + 1))}
                      disabled={page >= results.totalPages - 1}
                      className="rounded-lg px-3 py-1 text-sm disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <p className="py-12 text-center text-gray-400">No problems found.</p>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-primary/30 bg-primary/5 p-3 sm:p-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-gray-900 dark:text-gray-100">{selected.title}</span>
                <Badge variant={difficultyVariant(selected.difficulty)}>{selected.difficulty}</Badge>
                <Badge variant="topic">{selected.topic}</Badge>
                {selected.platform && (
                  <span className="text-xs text-primary">{selected.platform}</span>
                )}
              </div>
              {selected.tags?.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {selected.tags.map((t) => (
                    <Badge key={t} className="text-[10px]">{t}</Badge>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => setSelected(null)} className="shrink-0 self-start sm:self-center text-xs text-gray-400 hover:text-gray-600">
              Change
            </button>
          </div>
        )}

        {/* Shared fields — shown when problem is identified */}
        {(mode === 'custom' || selected) && (
          <>
            <ConfidencePicker value={confidence} onChange={setConfidence} />

            <Input
              label="Time Taken (minutes)"
              type="number"
              value={timeTakenMins}
              onChange={(e) => setTimeTakenMins(e.target.value)}
              placeholder="e.g. 25"
              className="w-full sm:w-40"
            />

            <RichTextEditor
              label="Revision Notes"
              value={detailedNotes}
              onChange={setDetailedNotes}
              placeholder="Approach, key insight, edge cases, mistakes — anything to help you review later..."
            />

            <div className="flex gap-3 pt-2">
              <Button variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
              <Button
                onClick={() => logMutation.mutate()}
                disabled={logMutation.isPending || !canSubmit}
              >
                {logMutation.isPending ? 'Saving...' : 'Log Problem'}
              </Button>
            </div>

            {logMutation.isError && (
              <p className="text-sm text-red-500">
                {(logMutation.error as any)?.response?.data?.message || 'Failed to log problem'}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
