import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import 'highlight.js/styles/github.css';

export interface MarkdownProps {
  /** API BEKU (plan §3): satu-satunya prop. Markdown mentah → render aman. */
  source: string;
  className?: string;
}

// Sanitasi (PRD §10) wajib karena komponen ini juga merender konten user
// (komentar). Default schema rehype-sanitize + izinkan `className` di semua
// elemen supaya kelas highlight.js (`hljs-*`, `language-*`) tidak ikut dibuang.
// `className` aman dari sisi XSS (tak bisa mengeksekusi skrip).
const schema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    '*': [...(defaultSchema.attributes?.['*'] ?? []), 'className'],
  },
};

/**
 * `<Markdown source/>` — render materi/soal/komentar (Task 0.6, Seam Markdown).
 * Pipeline sinkron: remark-gfm + highlight (rehype-highlight) + sanitize.
 * Highlighter adalah detail internal; API `source` dibekukan & tak berubah.
 */
export default function Markdown({ source, className }: MarkdownProps) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          // urutan penting: highlight dulu (menambah class), lalu sanitize.
          [rehypeHighlight, { detect: true, ignoreMissing: true }],
          [rehypeSanitize, schema],
        ]}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
