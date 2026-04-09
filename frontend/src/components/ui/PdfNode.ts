import { Node, mergeAttributes } from '@tiptap/react';

/**
 * Custom TipTap node for PDF attachments.
 * Renders as a styled block with the PDF icon and filename.
 * Preserves `data-url` and `data-filename` attributes through TipTap's schema.
 */
const PdfAttachment = Node.create({
  name: 'pdfAttachment',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      url: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('data-url'),
        renderHTML: (attributes: Record<string, string>) => ({ 'data-url': attributes.url }),
      },
      filename: {
        default: 'PDF Document',
        parseHTML: (element: HTMLElement) => element.getAttribute('data-filename'),
        renderHTML: (attributes: Record<string, string>) => ({ 'data-filename': attributes.filename }),
      },
    };
  },

  parseHTML() {
    return [
      { tag: 'div[data-type="pdf-attachment"]' },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const filename = HTMLAttributes['data-filename'] || 'PDF Document';
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'pdf-attachment',
        class: 'pdf-attachment-block',
      }),
      ['span', { class: 'pdf-icon' }, '\uD83D\uDCC4'],
      ['span', { class: 'pdf-name' }, filename],
    ];
  },
});

export default PdfAttachment;
