import HarnessShell from './HarnessShell';
import { Section } from '@/components/ui';
import Markdown from '@/components/Markdown';

const sample = `# Judul Materi

Paragraf dengan **bold**, *italic*, dan \`inline code\`.

- Item satu
- Item dua

\`\`\`js
function halo(nama) {
  return \`Halo, \${nama}!\`;
}
\`\`\`

> Kutipan untuk penekanan.

| Tag | Fungsi |
|-----|--------|
| h1  | Heading utama |
| img | Gambar |

[Tautan aman](https://example.com) — skrip & atribut berbahaya di-sanitize.`;

/** /_harness/markdown — uji komponen <Markdown source/> (Task 0.6). */
export default function MarkdownHarness() {
  return (
    <HarnessShell title="markdown">
      <Section title="Render Markdown">
        <Markdown source={sample} />
      </Section>
    </HarnessShell>
  );
}
