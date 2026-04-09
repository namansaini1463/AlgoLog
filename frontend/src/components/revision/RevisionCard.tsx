import { useState } from 'react';
import type { RevisionItem } from '../../api/revisions';
import Badge, { difficultyVariant } from '../ui/Badge';
import Button from '../ui/Button';
import RichTextViewer from '../ui/RichTextViewer';
import { cn } from '../../utils/cn';

interface RevisionCardProps {
  item: RevisionItem;
  onComplete: (revisionId: string, confidence: number) => void;
  onSnooze?: (revisionId: string) => void;
  completePending?: boolean;
  snoozePending?: boolean;
  compact?: boolean;
}

const CONFIDENCE_LABELS = ['Forgot', 'Shaky', 'Okay', 'Good', 'Perfect'];

function borderColor(state: string) {
  switch (state) {
    case 'FLAGGED': return 'border-l-purple-500';
    case 'OVERDUE': return 'border-l-red-500';
    case 'DUE_TODAY': return 'border-l-amber-500';
    default: return 'border-l-green-400';
  }
}

function stateBadge(item: RevisionItem) {
  if (item.isFlagged) {
    return <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">Flagged</Badge>;
  }
  if (item.isSnoozed) {
    return <Badge className="bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">Snoozed</Badge>;
  }
  if (item.daysOverdue > 0) {
    return (
      <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
        {item.daysOverdue}d overdue
      </Badge>
    );
  }
  if (item.daysOverdue === 0) {
    return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">Due today</Badge>;
  }
  return (
    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
      Due in {Math.abs(item.daysOverdue)}d
    </Badge>
  );
}

function formatRelativeDate(dateStr: string | null) {
  if (!dateStr) return 'Never';
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}

export default function RevisionCard({
  item,
  onComplete,
  onSnooze,
  completePending,
  snoozePending,
  compact = false,
}: RevisionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [confidence, setConfidence] = useState(3);
  const [showNotes, setShowNotes] = useState<'oneliner' | 'detailed' | null>(null);

  const canSnooze = item.revisionState === 'OVERDUE' || item.revisionState === 'DUE_TODAY';

  return (
    <div
      className={cn(
        'rounded-lg border border-l-4 bg-surface-light transition-all dark:bg-surface-dark',
        'border-gray-200 dark:border-gray-700',
        borderColor(item.revisionState),
        compact ? 'p-3' : 'p-4'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
              {item.problemTitle}
            </span>
            {item.difficulty && (
              <Badge variant={difficultyVariant(item.difficulty)}>{item.difficulty}</Badge>
            )}
            {item.topic && <Badge variant="topic">{item.topic}</Badge>}
            {stateBadge(item)}
          </div>

          {/* Meta row */}
          <div className="mt-1.5 flex items-center gap-3 flex-wrap text-xs text-gray-500 dark:text-gray-400">
            {item.platform && item.platformUrl && (
              <a href={item.platformUrl} target="_blank" rel="noopener noreferrer"
                className="text-primary hover:underline">{item.platform}</a>
            )}
            {item.flaggedNote && (
              <span className="italic text-purple-500" title={item.flaggedNote}>
                "{item.flaggedNote}"
              </span>
            )}
          </div>

          {/* Notes toggle */}
          {!compact && (item.oneLiner || item.detailedNotes) && (
            <div className="mt-2 flex gap-2">
              {item.oneLiner && (
                <button
                  type="button"
                  onClick={() => setShowNotes(showNotes === 'oneliner' ? null : 'oneliner')}
                  className={cn(
                    'rounded-md px-2 py-0.5 text-xs font-medium transition-colors',
                    showNotes === 'oneliner'
                      ? 'bg-primary/10 text-primary'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'
                  )}
                >
                  One-liner
                </button>
              )}
              {item.detailedNotes && (
                <button
                  type="button"
                  onClick={() => setShowNotes(showNotes === 'detailed' ? null : 'detailed')}
                  className={cn(
                    'rounded-md px-2 py-0.5 text-xs font-medium transition-colors',
                    showNotes === 'detailed'
                      ? 'bg-primary/10 text-primary'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'
                  )}
                >
                  Detailed
                </button>
              )}
            </div>
          )}

          {/* Notes content */}
          {showNotes === 'oneliner' && item.oneLiner && (
            <p className="mt-2 rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-700 dark:bg-gray-800/50 dark:text-gray-300">
              {item.oneLiner}
            </p>
          )}
          {showNotes === 'detailed' && item.detailedNotes && (
            <div className="mt-2 rounded-md bg-gray-50 px-3 py-2 dark:bg-gray-800/50">
              <RichTextViewer html={item.detailedNotes} className="text-sm" />
            </div>
          )}

          {/* Stats row */}
          {!compact && (
            <div className="mt-2 flex items-center gap-2 sm:gap-4 flex-wrap text-xs text-gray-400">
              <span>Revised {item.timesRevised}x</span>
              <span>Last: {formatRelativeDate(item.lastReviewedAt)}</span>
              {item.streakCount > 0 && (
                <span className="text-green-500">Streak: {item.streakCount}</span>
              )}
              {item.daysOverdue >= 7 && item.revisionState === 'OVERDUE' && (
                <span className="text-red-400 font-medium">Long overdue</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Inline confidence picker (expanded) */}
      {expanded && (
        <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50">
          <p className="mb-2 text-xs font-medium text-gray-600 dark:text-gray-400">
            How well did you recall this?
          </p>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setConfidence(n)}
                className={cn(
                  'flex flex-col items-center rounded-lg px-2.5 sm:px-3 py-2 text-xs font-medium transition-all border',
                  n === confidence
                    ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary/30'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400'
                )}
              >
                <span className="text-base sm:text-lg">{n}</span>
                <span className="mt-0.5 text-[10px]">{CONFIDENCE_LABELS[n - 1]}</span>
              </button>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => setExpanded(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => onComplete(item.revisionId, confidence)}
              disabled={completePending}
            >
              {completePending ? 'Saving...' : 'Confirm'}
            </Button>
          </div>
        </div>
      )}

      {/* Action buttons */}
      {!expanded && (
        <div className="mt-3 flex items-center gap-2">
          <Button size="sm" onClick={() => setExpanded(true)}>
            Mark as Revised
          </Button>
          {canSnooze && onSnooze && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onSnooze(item.revisionId)}
              disabled={snoozePending || item.isSnoozed}
            >
              {item.isSnoozed ? 'Snoozed' : 'Snooze 1 day'}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
