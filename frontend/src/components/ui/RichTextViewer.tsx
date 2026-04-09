import { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '../../utils/cn';
import NotesFileViewer, { getFileTypeFromUrl } from './NotesFileViewer';

interface RichTextViewerProps {
  html: string;
  className?: string;
}

interface ViewerState {
  open: boolean;
  url: string;
  fileType: 'image' | 'pdf';
  title?: string;
}

/**
 * Renders saved rich text HTML content with proper prose styling.
 * Supports clickable images (opens full-screen viewer) and embedded PDFs.
 * Falls back gracefully for plain text (no HTML tags) by wrapping in <p>.
 */
export default function RichTextViewer({ html, className }: RichTextViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewer, setViewer] = useState<ViewerState>({ open: false, url: '', fileType: 'image' });

  const handleClick = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;

    // Handle image clicks — open in full-screen viewer
    if (target.tagName === 'IMG') {
      const img = target as HTMLImageElement;
      e.preventDefault();
      e.stopPropagation();
      setViewer({ open: true, url: img.src, fileType: 'image', title: img.alt || 'Image' });
      return;
    }

    // Handle PDF link clicks — open in viewer instead of navigating
    const link = target.closest('a[href]') as HTMLAnchorElement | null;
    if (link) {
      const href = link.href;
      const fileType = getFileTypeFromUrl(href);
      if (fileType === 'pdf') {
        e.preventDefault();
        e.stopPropagation();
        setViewer({ open: true, url: href, fileType: 'pdf', title: link.textContent || 'PDF Document' });
        return;
      }
    }

    // Handle PDF attachment blocks (custom TipTap node)
    const pdfBlock = target.closest('[data-type="pdf-attachment"]') as HTMLElement | null;
    if (pdfBlock) {
      const url = pdfBlock.getAttribute('data-url');
      const filename = pdfBlock.getAttribute('data-filename');
      if (url) {
        e.preventDefault();
        e.stopPropagation();
        setViewer({ open: true, url, fileType: 'pdf', title: filename || 'PDF Document' });
      }
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener('click', handleClick);
    return () => container.removeEventListener('click', handleClick);
  }, [handleClick]);

  if (!html) return null;

  // If the content is plain text (no HTML), wrap it
  const isHtml = html.includes('<');
  const content = isHtml ? html : `<p>${html}</p>`;

  return (
    <>
      <div
        ref={containerRef}
        className={cn(
          'prose prose-sm dark:prose-invert max-w-none',
          // Override prose defaults for compact display
          '[&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_pre]:my-2 [&_blockquote]:my-2',
          // Images: clickable with hover effect
          '[&_img]:rounded-lg [&_img]:max-h-64 [&_img]:object-contain [&_img]:cursor-pointer [&_img]:transition-opacity [&_img]:hover:opacity-80',
          '[&_code]:text-xs [&_code]:bg-gray-100 [&_code]:dark:bg-gray-800 [&_code]:px-1 [&_code]:rounded',
          '[&_pre]:bg-gray-50 [&_pre]:dark:bg-gray-900 [&_pre]:rounded-lg [&_pre]:p-3',
          '[&_a]:text-primary [&_a]:underline',
          // PDF attachment block styling
          '[&_[data-type=pdf-attachment]]:my-2 [&_[data-type=pdf-attachment]]:rounded-lg [&_[data-type=pdf-attachment]]:border [&_[data-type=pdf-attachment]]:border-gray-200 [&_[data-type=pdf-attachment]]:dark:border-gray-700 [&_[data-type=pdf-attachment]]:bg-gray-50 [&_[data-type=pdf-attachment]]:dark:bg-gray-800/50 [&_[data-type=pdf-attachment]]:px-3 [&_[data-type=pdf-attachment]]:py-2 [&_[data-type=pdf-attachment]]:cursor-pointer [&_[data-type=pdf-attachment]]:hover:bg-gray-100 [&_[data-type=pdf-attachment]]:dark:hover:bg-gray-800 [&_[data-type=pdf-attachment]]:transition-colors [&_[data-type=pdf-attachment]]:flex [&_[data-type=pdf-attachment]]:items-center [&_[data-type=pdf-attachment]]:gap-2',
          className
        )}
        dangerouslySetInnerHTML={{ __html: content }}
      />

      {/* Full-screen file viewer */}
      <NotesFileViewer
        open={viewer.open}
        onClose={() => setViewer((v) => ({ ...v, open: false }))}
        url={viewer.url}
        fileType={viewer.fileType}
        title={viewer.title}
      />
    </>
  );
}
