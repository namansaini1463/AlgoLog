import { useState, useRef, useEffect } from 'react';
import type { UserProblem } from '../../api/problems';
import Badge, { difficultyVariant } from '../ui/Badge';
import Button from '../ui/Button';
import RichTextViewer from '../ui/RichTextViewer';
import { formatDate } from '../../utils/formatDate';
import { cn } from '../../utils/cn';
import { detectPlatform } from '../../utils/detectPlatform';

interface ProblemCardProps {
  problem: UserProblem;
  onDelete?: (id: string) => void;
  onFlag?: (id: string, isFlagged: boolean, note?: string) => void;
  isFlagged?: boolean;
  flaggedNote?: string | null;
}

export default function ProblemCard({ problem, onDelete, onFlag, isFlagged = false, flaggedNote }: ProblemCardProps) {
  const bp = problem.problem;
  const title = bp?.title || problem.customTitle || 'Untitled';
  const url = bp?.platformUrl || problem.customUrl;
  const difficulty = bp?.difficulty || problem.customDifficulty;
  const topic = bp?.topic || problem.customTopic;
  const tags = bp?.tags || problem.customTags;

  const [showFlagPopover, setShowFlagPopover] = useState(false);
  const [flagNote, setFlagNote] = useState('');
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowFlagPopover(false);
      }
    };
    if (showFlagPopover) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showFlagPopover]);

  const handleFlagClick = () => {
    if (isFlagged) {
      // Already flagged — confirm removal
      onFlag?.(problem.id, false);
    } else {
      setShowFlagPopover(true);
    }
  };

  const submitFlag = () => {
    onFlag?.(problem.id, true, flagNote || undefined);
    setShowFlagPopover(false);
    setFlagNote('');
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-surface-light p-3 sm:p-4 dark:border-gray-700 dark:bg-surface-dark">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-medium text-gray-900 dark:text-gray-100">{title}</h3>
            {difficulty && (
              <Badge variant={difficultyVariant(difficulty)}>{difficulty}</Badge>
            )}
            {topic && (
              <Badge variant="topic">{topic}</Badge>
            )}
            {!bp && <Badge>Custom</Badge>}
            {isFlagged && (
              <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                Flagged
              </Badge>
            )}
          </div>
          {tags && tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-xs text-primary hover:underline"
            >
              {bp?.platform || detectPlatform(url) || 'View Problem'}
            </a>
          )}
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 relative shrink-0">
          {/* Flag button */}
          {onFlag && (
            <button
              onClick={handleFlagClick}
              title={isFlagged ? (flaggedNote || 'Flagged for revision') : 'Flag for revision'}
              className={cn(
                'rounded-md p-1.5 transition-colors',
                isFlagged
                  ? 'text-purple-500 hover:bg-purple-100 dark:hover:bg-purple-900/30'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill={isFlagged ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h2V3H3zm4 0v12l7-3 7 3V3H7z" />
              </svg>
            </button>
          )}

          {/* Flag popover */}
          {showFlagPopover && (
            <div
              ref={popoverRef}
              className="absolute right-0 top-8 z-50 w-56 sm:w-64 rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-800"
            >
              <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Flag for revision
              </p>
              <input
                type="text"
                value={flagNote}
                onChange={(e) => setFlagNote(e.target.value)}
                placeholder="Optional note..."
                className="mb-2 w-full rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                onKeyDown={(e) => e.key === 'Enter' && submitFlag()}
              />
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => setShowFlagPopover(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={submitFlag}>Flag it</Button>
              </div>
            </div>
          )}

          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <span
                key={n}
                className={`h-2.5 w-2.5 rounded-full ${
                  n <= (problem.confidence || 0)
                    ? 'bg-primary'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>
          {onDelete && (
            <button
              onClick={() => onDelete(problem.id)}
              className="text-xs text-red-400 hover:text-red-600"
            >
              Remove
            </button>
          )}
        </div>
      </div>

      {problem.detailedNotes && (
        <div className="mt-2 line-clamp-3">
          <RichTextViewer html={problem.detailedNotes} className="text-sm text-gray-600 dark:text-gray-400" />
        </div>
      )}

      <div className="mt-2 flex items-center gap-2 sm:gap-4 flex-wrap text-xs text-gray-400">
        <span>Solved {formatDate(problem.solvedAt)}</span>
        {problem.timeTakenMins && <span>{problem.timeTakenMins} min</span>}
        {problem.hintsUsed && <span className="text-amber-500">Used hints</span>}
      </div>
    </div>
  );
}
