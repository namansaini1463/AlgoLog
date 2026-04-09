import { useState } from 'react';
import type { Revision } from '../../api/revisions';
import Badge, { difficultyVariant } from '../ui/Badge';
import RevisionBadge from './RevisionBadge';
import ConfidencePicker from '../ui/ConfidencePicker';
import Button from '../ui/Button';

interface RevisionItemProps {
  revision: Revision;
  onComplete: (id: string, confidence: number) => void;
  loading?: boolean;
}

export default function RevisionItem({ revision, onComplete, loading }: RevisionItemProps) {
  const [confidence, setConfidence] = useState(3);
  const up = revision.userProblem;
  const bp = up?.problem;
  const title = bp?.title || up?.customTitle || 'Unknown Problem';
  const difficulty = bp?.difficulty || up?.customDifficulty;
  const topic = bp?.topic || up?.customTopic;

  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-surface-light p-4 dark:border-gray-700 dark:bg-surface-dark">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {title}
          </span>
          {difficulty && <Badge variant={difficultyVariant(difficulty)}>{difficulty}</Badge>}
          {topic && <Badge variant="topic">{topic}</Badge>}
          {!bp && <Badge>Custom</Badge>}
        </div>
        <div className="mt-1 flex items-center gap-3">
          <RevisionBadge nextDueAt={revision.nextDueAt} />
          {up?.detailedNotes && (
            <span className="text-xs text-gray-400 italic line-clamp-1">
              {up.detailedNotes}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <ConfidencePicker value={confidence} onChange={setConfidence} />
        <Button
          size="sm"
          onClick={() => onComplete(revision.id, confidence)}
          disabled={loading}
        >
          Mark Revised
        </Button>
      </div>
    </div>
  );
}
