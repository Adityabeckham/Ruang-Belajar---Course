import { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { html as htmlLang } from '@codemirror/lang-html';
import { css as cssLang } from '@codemirror/lang-css';
import { javascript as jsLang } from '@codemirror/lang-javascript';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import { Tabs, Button, Flex, Typography, message } from '@/components/ui';

const { Text } = Typography;

type Code = { html: string; css: string; js: string };

export interface CodeEditorProps {
  exerciseId: string;
  starter?: Code;
  disabled?: boolean;
}

// Bangun dokumen preview. Dijalankan di <iframe sandbox="allow-scripts"> TANPA
// allow-same-origin (PRD §10) → skrip siswa tak bisa menyentuh parent/cookie/Convex.
function buildSrcDoc({ html, css, js }: Code): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>${css}</style></head>
<body>${html}<script>${js}</script></body>
</html>`;
}

const EXT = {
  html: [htmlLang()],
  css: [cssLang()],
  js: [jsLang()],
};

/**
 * Code editor in-browser (Task B5, Fase 5): CodeMirror HTML/CSS/JS + live preview
 * di iframe sandbox (debounced). Submit tipe `code` → review admin (B4).
 */
export default function CodeEditor({ exerciseId, starter, disabled }: CodeEditorProps) {
  const [code, setCode] = useState<Code>(
    starter ?? { html: '', css: '', js: '' },
  );
  const [srcDoc, setSrcDoc] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = useMutation(api.submissions.submitCode);

  // Debounce preview supaya tak re-render iframe tiap ketik.
  useEffect(() => {
    const t = setTimeout(() => setSrcDoc(buildSrcDoc(code)), 400);
    return () => clearTimeout(t);
  }, [code]);

  const editor = (lang: keyof Code) => (
    <CodeMirror
      value={code[lang]}
      height="220px"
      extensions={EXT[lang]}
      onChange={(v) => setCode((c) => ({ ...c, [lang]: v }))}
      basicSetup={{ lineNumbers: true, highlightActiveLine: true }}
    />
  );

  return (
    <Flex vertical gap={12}>
      <Flex gap={12} wrap>
        <div style={{ flex: '1 1 340px', minWidth: 0 }}>
          <Tabs
            items={[
              { key: 'html', label: 'HTML', children: editor('html') },
              { key: 'css', label: 'CSS', children: editor('css') },
              { key: 'js', label: 'JS', children: editor('js') },
            ]}
          />
        </div>
        <div style={{ flex: '1 1 340px', minWidth: 0 }}>
          <Text type="secondary">Preview</Text>
          <iframe
            title="preview"
            srcDoc={srcDoc}
            sandbox="allow-scripts"
            style={{
              width: '100%',
              height: 264,
              border: '3px solid #1F3D3A',
              borderRadius: 8,
              background: '#fff',
              marginTop: 4,
            }}
          />
        </div>
      </Flex>
      <Button
        type="primary"
        loading={busy}
        disabled={disabled}
        style={{ alignSelf: 'flex-start' }}
        onClick={async () => {
          setBusy(true);
          try {
            await submit({ exerciseId: exerciseId as Id<'exercises'>, code });
            message.success('Kode terkirim — menunggu review');
          } catch (e) {
            message.error(e instanceof Error ? e.message : 'Gagal');
          } finally {
            setBusy(false);
          }
        }}
      >
        Kirim kode
      </Button>
    </Flex>
  );
}
