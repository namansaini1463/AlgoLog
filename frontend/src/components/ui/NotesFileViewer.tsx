import { useState, useEffect } from 'react';
import { cn } from '../../utils/cn';

interface NotesFileViewerProps {
  open: boolean;
  onClose: () => void;
  url: string;
  fileType: 'image' | 'pdf';
  title?: string;
}

/** Full-screen modal viewer for images and PDFs in notes */
export default function NotesFileViewer({ open, onClose, url, fileType, title }: NotesFileViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [pdfError, setPdfError] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  // Fetch PDF as blob so the browser's native viewer can display it
  // (Cloudinary raw URLs serve with Content-Disposition: attachment, which forces download)
  useEffect(() => {
    if (!open || fileType !== 'pdf' || !url) return;

    let revoked = false;
    setPdfLoading(true);
    setPdfError(false);
    setPdfBlobUrl(null);

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        if (revoked) return;
        const blobUrl = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
        setPdfBlobUrl(blobUrl);
      })
      .catch(() => {
        if (!revoked) setPdfError(true);
      })
      .finally(() => {
        if (!revoked) setPdfLoading(false);
      });

    return () => {
      revoked = true;
      setPdfBlobUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    };
  }, [open, url, fileType]);

  if (!open) return null;

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.5));
  const handleResetZoom = () => setZoom(1);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black/90">
      {/* Top bar */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-3 bg-black/60">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <span className="text-xs sm:text-sm font-medium text-white truncate max-w-[150px] sm:max-w-xs">
            {title || (fileType === 'pdf' ? 'PDF Document' : 'Image')}
          </span>
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs text-white uppercase shrink-0">
            {fileType}
          </span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          {fileType === 'image' && (
            <>
              <button onClick={handleZoomOut} className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white" title="Zoom out">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                </svg>
              </button>
              <button onClick={handleResetZoom} className="rounded-lg px-2 py-1 text-xs text-white/70 hover:bg-white/10 hover:text-white">
                {Math.round(zoom * 100)}%
              </button>
              <button onClick={handleZoomIn} className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white" title="Zoom in">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </button>
            </>
          )}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white"
            title="Open in new tab"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white"
            title="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-2 sm:p-4">
        {fileType === 'pdf' ? (
          pdfLoading ? (
            <div className="flex flex-col items-center gap-4 text-white">
              <svg className="h-8 w-8 animate-spin text-white/70" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-sm text-white/70">Loading PDF...</p>
            </div>
          ) : pdfError || !pdfBlobUrl ? (
            <div className="flex flex-col items-center gap-4 text-white">
              <p className="text-sm text-white/70">Could not load PDF preview.</p>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark transition-colors"
              >
                Download PDF
              </a>
            </div>
          ) : (
            <iframe
              src={pdfBlobUrl}
              title={title || 'PDF Document'}
              className="h-full w-full max-w-4xl rounded-lg bg-white"
              style={{ minHeight: '80vh' }}
            />
          )
        ) : (
          <div className="overflow-auto max-h-full max-w-full">
            <img
              src={url}
              alt={title || 'Notes image'}
              className={cn('rounded-lg transition-transform duration-200 select-none')}
              style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
              draggable={false}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/** Detect file type from URL */
export function getFileTypeFromUrl(url: string): 'image' | 'pdf' {
  const lower = url.toLowerCase();
  if (lower.includes('.pdf') || lower.includes('/raw/') || lower.includes('resource_type=raw')) {
    return 'pdf';
  }
  return 'image';
}
