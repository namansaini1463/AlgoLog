import { useState, useRef, useEffect } from 'react';
import type { UserProblem } from '../../api/problems';
import { problemsApi } from '../../api/problems';
import Badge, { difficultyVariant, CategoryBadge } from '../ui/Badge';
import Button from '../ui/Button';
import RichTextViewer from '../ui/RichTextViewer';
import RichTextEditor from '../ui/RichTextEditor';
import Modal from '../ui/Modal';
import { formatDate } from '../../utils/formatDate';
import { cn } from '../../utils/cn';
import { detectPlatform } from '../../utils/detectPlatform';

interface ProblemCardProps {
  problem: UserProblem;
  onDelete?: (id: string) => void;
  onFlag?: (id: string, isFlagged: boolean, note?: string) => void;
  onNotesUpdated?: () => void;
  isFlagged?: boolean;
  flaggedNote?: string | null;
}

export default function ProblemCard({ problem, onDelete, onFlag, onNotesUpdated, isFlagged = false, flaggedNote }: ProblemCardProps) {
  const bp = problem.problem;
  const title = bp?.title || problem.customTitle || 'Untitled';
  const url = bp?.platformUrl || problem.customUrl;
  const difficulty = bp?.difficulty || problem.customDifficulty;
  const topic = bp?.topic || problem.customTopic;
  const tags = bp?.tags || problem.customTags;

  const [showFlagPopover, setShowFlagPopover] = useState(false);
  const [flagNote, setFlagNote] = useState('');
  const [notesExpanded, setNotesExpanded] = useState(false);
  const [editNotesOpen, setEditNotesOpen] = useState(false);
  const [editNotesValue, setEditNotesValue] = useState(problem.detailedNotes || '');
  const [savingNotes, setSavingNotes] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      await problemsApi.update(problem.id, {
        confidence: problem.confidence,
        detailedNotes: editNotesValue || undefined,
      });
      setEditNotesOpen(false);
      onNotesUpdated?.();
    } catch {
      alert('Failed to save notes. Please try again.');
    } finally {
      setSavingNotes(false);
    }
  };

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
    <div className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4 transition-all hover:shadow-md dark:border-gray-700 dark:bg-surface-dark">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100">{title}</h3>
            {problem.category && (
              <CategoryBadge name={problem.category} />
            )}
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
            <div className="mt-2 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400"
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
              className="mt-2 inline-flex items-center gap-1 text-xs sm:text-sm text-primary hover:underline"
            >
              {bp?.platform || detectPlatform(url) || 'View Problem'}
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>
        <div className="flex items-center gap-2 sm:gap-2.5 relative shrink-0">
          {/* Flag button */}
          {onFlag && (
            <button
              onClick={handleFlagClick}
              title={isFlagged ? (flaggedNote || 'Flagged for revision') : 'Flag for revision'}
              className={cn(
                'rounded-md p-1.5 sm:p-2 transition-all hover:scale-110',
                isFlagged
                  ? 'text-purple-500 hover:bg-purple-100 dark:hover:bg-purple-900/30'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-500 dark:hover:text-gray-300 dark:hover:bg-gray-800'
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
              className="absolute right-0 top-10 z-50 w-56 sm:w-64 rounded-lg border border-gray-200 bg-white p-3 shadow-xl dark:border-gray-700 dark:bg-gray-800 animate-in fade-in zoom-in-95 duration-200"
            >
              <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Flag for revision
              </p>
              <input
                type="text"
                value={flagNote}
                onChange={(e) => setFlagNote(e.target.value)}
                placeholder="Optional note..."
                className="mb-3 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 transition-all"
                onKeyDown={(e) => e.key === 'Enter' && submitFlag()}
              />
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => setShowFlagPopover(false)} className="flex-1">
                  Cancel
                </Button>
                <Button size="sm" onClick={submitFlag} className="flex-1">Flag it</Button>
              </div>
            </div>
          )}

          <div className="flex gap-0.5 sm:gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <span
                key={n}
                className={`h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full transition-colors ${
                  n <= (problem.confidence || 0)
                    ? 'bg-primary dark:bg-primary-light'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>
          {onDelete && (
            <button
              onClick={() => onDelete(problem.id)}
              className="text-xs sm:text-sm text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors"
            >
              Remove
            </button>
          )}
        </div>
      </div>

      {/* Notes section */}
      <div className="mt-3 flex gap-2">
        {problem.detailedNotes && (
          <button
            type="button"
            onClick={() => setNotesExpanded(!notesExpanded)}
            className={cn(
              'rounded-md px-2 py-0.5 text-xs font-medium transition-colors',
              notesExpanded
                ? 'bg-primary/10 text-primary'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'
            )}
          >
            {notesExpanded ? 'Hide Notes' : 'Show Notes'}
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            setEditNotesValue(problem.detailedNotes || '');
            setEditNotesOpen(true);
          }}
          className="rounded-md px-2 py-0.5 text-xs font-medium transition-colors bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"
        >
          {problem.detailedNotes ? 'Edit Notes' : 'Add Notes'}
        </button>
      </div>
      {notesExpanded && problem.detailedNotes && (
        <div className="mt-2 rounded-md bg-gray-50 px-3 py-2 dark:bg-gray-800/50">
          <RichTextViewer html={problem.detailedNotes} className="text-sm text-gray-600 dark:text-gray-400" />
        </div>
      )}

      <div className="mt-3 flex items-center gap-3 sm:gap-4 flex-wrap text-xs sm:text-sm text-gray-500 dark:text-gray-400">
        <span className="font-medium">📅 {formatDate(problem.solvedAt)}</span>
        {problem.timeTakenMins && <span>⏱️ {problem.timeTakenMins} min</span>}
        {problem.hintsUsed && <span className="text-amber-600 dark:text-amber-500">💡 Used hints</span>}
      </div>

      {/* Edit notes modal */}
      <Modal open={editNotesOpen} onClose={() => setEditNotesOpen(false)} title="Edit Notes" className="max-w-2xl">
        <RichTextEditor
          value={editNotesValue}
          onChange={setEditNotesValue}
          placeholder="Approach, key insight, edge cases, mistakes..."
        />
        <div className="mt-4 flex gap-3 justify-end">
          <Button size="sm" variant="secondary" onClick={() => setEditNotesOpen(false)}>Cancel</Button>
          <Button size="sm" onClick={handleSaveNotes} disabled={savingNotes}>
            {savingNotes ? 'Saving...' : 'Save Notes'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
