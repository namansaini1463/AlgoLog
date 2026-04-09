import { useState, useRef, useEffect } from 'react';
import { cn } from '../../utils/cn';

interface TagPickerProps {
  label?: string;
  availableTags: string[];
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  allowCustom?: boolean;
  placeholder?: string;
}

export default function TagPicker({
  label,
  availableTags,
  selectedTags,
  onChange,
  allowCustom = false,
  placeholder = 'Search or add tags...',
}: TagPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = availableTags.filter(
    (tag) =>
      tag.toLowerCase().includes(query.toLowerCase()) &&
      !selectedTags.includes(tag)
  );

  const customSelected = selectedTags.filter((tag) => !availableTags.includes(tag));
  const existingSelected = selectedTags.filter((tag) => availableTags.includes(tag));

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onChange(selectedTags.filter((t) => t !== tag));
    } else {
      onChange([...selectedTags, tag]);
      setQuery('');
    }
  };

  const removeTag = (tag: string) => {
    onChange(selectedTags.filter((t) => t !== tag));
  };

  const addCustomTag = () => {
    const trimmed = query.trim();
    if (trimmed && !selectedTags.map((t) => t.toLowerCase()).includes(trimmed.toLowerCase())) {
      onChange([...selectedTags, trimmed]);
      setQuery('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // If there's a matching available tag, select it; otherwise add custom
      if (filtered.length > 0) {
        toggleTag(filtered[0]);
      } else if (allowCustom && query.trim()) {
        addCustomTag();
      }
    }
    if (e.key === 'Backspace' && !query && selectedTags.length > 0) {
      removeTag(selectedTags[selectedTags.length - 1]);
    }
    if (e.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  const showCustomOption =
    allowCustom &&
    query.trim() &&
    !availableTags.some((t) => t.toLowerCase() === query.trim().toLowerCase()) &&
    !selectedTags.some((t) => t.toLowerCase() === query.trim().toLowerCase());

  return (
    <div className="space-y-1.5" ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}

      {/* Input area with selected chips */}
      <div
        className={cn(
          'flex min-h-[42px] flex-wrap items-center gap-1.5 rounded-lg border bg-white px-2.5 py-1.5 transition-colors cursor-text',
          'dark:bg-gray-800 dark:text-gray-100',
          open
            ? 'border-primary ring-2 ring-primary/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        )}
        onClick={() => {
          setOpen(true);
          inputRef.current?.focus();
        }}
      >
        {/* Selected tag chips */}
        {existingSelected.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
          >
            {tag}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(tag);
              }}
              className="ml-0.5 text-primary/60 hover:text-primary transition-colors"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        ))}
        {customSelected.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 rounded-md bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
          >
            {tag}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(tag);
              }}
              className="ml-0.5 text-purple-400 hover:text-purple-600 dark:hover:text-purple-200 transition-colors"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        ))}

        {/* Search input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={selectedTags.length === 0 ? placeholder : ''}
          className="min-w-[120px] flex-1 bg-transparent py-0.5 text-sm outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
      </div>

      {/* Dropdown */}
      {open && (
        <div className="relative z-50">
          <div className="absolute left-0 right-0 mt-1 max-h-60 overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
            {/* Already selected (shown at top as checked) */}
            {selectedTags.length > 0 && (filtered.length > 0 || showCustomOption) && (
              <div className="border-b border-gray-100 px-2 py-1.5 dark:border-gray-700">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  Selected
                </p>
              </div>
            )}
            {selectedTags.length > 0 && (filtered.length > 0 || showCustomOption) &&
              selectedTags
                .filter((tag) => !query || tag.toLowerCase().includes(query.toLowerCase()))
                .map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <span className="flex h-4 w-4 items-center justify-center rounded border border-primary bg-primary text-white">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span className="text-gray-900 dark:text-gray-100">{tag}</span>
                    {!availableTags.includes(tag) && (
                      <span className="ml-auto rounded bg-purple-100 px-1.5 py-0.5 text-[10px] font-medium text-purple-600 dark:bg-purple-900/30 dark:text-purple-300">
                        custom
                      </span>
                    )}
                  </button>
                ))}

            {/* Available (unselected) */}
            {filtered.length > 0 && (
              <>
                <div className="border-b border-gray-100 px-2 py-1.5 dark:border-gray-700">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    {query ? 'Matching tags' : 'Available tags'}
                  </p>
                </div>
                {filtered.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <span className="flex h-4 w-4 items-center justify-center rounded border border-gray-300 dark:border-gray-600" />
                    <span className="text-gray-700 dark:text-gray-300">{tag}</span>
                  </button>
                ))}
              </>
            )}

            {/* Custom tag option */}
            {showCustomOption && (
              <button
                type="button"
                onClick={addCustomTag}
                className="flex w-full items-center gap-2 border-t border-gray-100 px-3 py-2 text-left text-sm hover:bg-purple-50 dark:border-gray-700 dark:hover:bg-purple-900/20"
              >
                <span className="flex h-4 w-4 items-center justify-center rounded bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </span>
                <span className="text-purple-700 dark:text-purple-300">
                  Create "<span className="font-medium">{query.trim()}</span>"
                </span>
              </button>
            )}

            {/* Empty state */}
            {filtered.length === 0 && !showCustomOption && selectedTags.length === 0 && (
              <div className="px-3 py-4 text-center text-sm text-gray-400">
                No tags available
              </div>
            )}
            {filtered.length === 0 && !showCustomOption && selectedTags.length > 0 && !query && (
              <div className="px-3 py-4 text-center text-sm text-gray-400">
                All tags selected
              </div>
            )}
            {filtered.length === 0 && !showCustomOption && query && (
              <div className="px-3 py-4 text-center text-sm text-gray-400">
                No matching tags{allowCustom ? '' : ' found'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
