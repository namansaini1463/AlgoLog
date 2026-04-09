import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { useCallback, useRef, useState } from 'react';
import { uploadApi } from '../../api/upload';
import { cn } from '../../utils/cn';
import CameraCapture from './CameraCapture';
import PdfAttachment from './PdfNode';

const lowlight = createLowlight(common);

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  label?: string;
}

const COLORS = [
  { label: 'Default', value: '' },
  { label: 'Red', value: '#ef4444' },
  { label: 'Orange', value: '#f97316' },
  { label: 'Green', value: '#22c55e' },
  { label: 'Blue', value: '#3b82f6' },
  { label: 'Purple', value: '#8b5cf6' },
  { label: 'Gray', value: '#6b7280' },
];

const HIGHLIGHTS = [
  { label: 'None', value: '' },
  { label: 'Yellow', value: '#fef08a' },
  { label: 'Green', value: '#bbf7d0' },
  { label: 'Blue', value: '#bfdbfe' },
  { label: 'Pink', value: '#fbcfe8' },
  { label: 'Orange', value: '#fed7aa' },
];

function ToolbarButton({
  active,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        'rounded px-1.5 py-1 text-xs transition-colors',
        active
          ? 'bg-primary/15 text-primary'
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700'
      )}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({ value, onChange, placeholder, label }: RichTextEditorProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Image.configure({ inline: false, allowBase64: false }),
      Link.configure({ openOnClick: false }),
      PdfAttachment,
      Placeholder.configure({ placeholder: placeholder || 'Write your notes...' }),
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[120px] px-3 py-2',
      },
    },
  });

  const handleImageUpload = useCallback(async (file: File) => {
    if (!editor) return;
    setUploading(true);
    try {
      const { data } = await uploadApi.image(file);
      editor.chain().focus().setImage({ src: data.url }).run();
    } catch {
      alert('Image upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [editor]);

  const handleFileUpload = useCallback(async (file: File) => {
    if (!editor) return;
    setUploading(true);
    try {
      const { data } = await uploadApi.file(file);
      if (data.fileType === 'pdf') {
        // Insert a PDF attachment node (custom TipTap node that preserves url + filename)
        editor.chain().focus().insertContent({
          type: 'pdfAttachment',
          attrs: { url: data.url, filename: file.name },
        }).run();
      } else {
        editor.chain().focus().setImage({ src: data.url }).run();
      }
    } catch {
      alert('File upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [editor]);

  const onImageButtonClick = () => {
    imageInputRef.current?.click();
  };

  const onFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const onImageSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
      e.target.value = '';
    }
  };

  const onFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
      e.target.value = '';
    }
  };

  const onCameraCapture = (file: File) => {
    handleImageUpload(file);
  };

  const addLink = () => {
    if (!editor) return;
    const url = window.prompt('URL:');
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  };

  if (!editor) return null;

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <div className="rounded-lg border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800 overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-colors">
        {/* Toolbar */}
        <div className="flex items-center gap-0.5 border-b border-gray-200 px-2 py-1.5 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/80 overflow-x-auto scrollbar-thin">
          {/* Text formatting */}
          <ToolbarButton active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold">
            <strong>B</strong>
          </ToolbarButton>
          <ToolbarButton active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic">
            <em>I</em>
          </ToolbarButton>
          <ToolbarButton active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} title="Strikethrough">
            <s>S</s>
          </ToolbarButton>
          <ToolbarButton active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()} title="Inline code">
            <span className="font-mono">&lt;/&gt;</span>
          </ToolbarButton>

          <div className="mx-1 h-4 w-px bg-gray-300 dark:bg-gray-600" />

          {/* Headings */}
          <ToolbarButton active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Heading">
            H2
          </ToolbarButton>
          <ToolbarButton active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Subheading">
            H3
          </ToolbarButton>

          <div className="mx-1 h-4 w-px bg-gray-300 dark:bg-gray-600" />

          {/* Lists */}
          <ToolbarButton active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet list">
            &bull; List
          </ToolbarButton>
          <ToolbarButton active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numbered list">
            1. List
          </ToolbarButton>
          <ToolbarButton active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()} title="Code block">
            {"{ }"}
          </ToolbarButton>
          <ToolbarButton active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Quote">
            &ldquo;
          </ToolbarButton>

          <div className="mx-1 h-4 w-px bg-gray-300 dark:bg-gray-600" />

          {/* Text color */}
          <select
            onChange={(e) => {
              const val = e.target.value;
              if (val) {
                editor.chain().focus().setColor(val).run();
              } else {
                editor.chain().focus().unsetColor().run();
              }
            }}
            value=""
            title="Text color"
            className="h-6 rounded border-0 bg-transparent px-1 text-xs text-gray-500 focus:outline-none cursor-pointer"
          >
            <option value="" disabled>Color</option>
            {COLORS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>

          {/* Highlight */}
          <select
            onChange={(e) => {
              const val = e.target.value;
              if (val) {
                editor.chain().focus().setHighlight({ color: val }).run();
              } else {
                editor.chain().focus().unsetHighlight().run();
              }
            }}
            value=""
            title="Highlight"
            className="h-6 rounded border-0 bg-transparent px-1 text-xs text-gray-500 focus:outline-none cursor-pointer"
          >
            <option value="" disabled>Highlight</option>
            {HIGHLIGHTS.map((h) => (
              <option key={h.value} value={h.value}>{h.label}</option>
            ))}
          </select>

          <div className="mx-1 h-4 w-px bg-gray-300 dark:bg-gray-600" />

          {/* Link */}
          <ToolbarButton active={editor.isActive('link')} onClick={addLink} title="Add link">
            Link
          </ToolbarButton>

          {/* Image upload */}
          <ToolbarButton active={false} onClick={onImageButtonClick} title="Upload image">
            <svg className="h-3.5 w-3.5 inline-block mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Image
          </ToolbarButton>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={onImageSelected}
            className="hidden"
          />

          {/* PDF upload */}
          <ToolbarButton active={false} onClick={onFileButtonClick} title="Upload PDF or image file">
            <svg className="h-3.5 w-3.5 inline-block mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            PDF
          </ToolbarButton>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            onChange={onFileSelected}
            className="hidden"
          />

          {/* Camera capture */}
          <ToolbarButton active={false} onClick={() => setCameraOpen(true)} title="Capture from camera">
            <svg className="h-3.5 w-3.5 inline-block mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Camera
          </ToolbarButton>
        </div>

        {/* Upload indicator */}
        {uploading && (
          <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-primary bg-primary/5 border-b border-primary/10">
            <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Uploading...
          </div>
        )}

        {/* Editor content */}
        <EditorContent editor={editor} />
      </div>

      {/* Camera capture modal */}
      <CameraCapture
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={onCameraCapture}
      />
    </div>
  );
}
