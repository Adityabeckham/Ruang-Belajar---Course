import { useState, useEffect, useCallback } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { html as htmlLang } from '@codemirror/lang-html';
import { css as cssLang } from '@codemirror/lang-css';
import { javascript as jsLang } from '@codemirror/lang-javascript';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import { message } from '@/components/ui';
import { RotateCcw, Play, Send, Code2, Palette, Zap } from 'lucide-react';

type Code = { html: string; css: string; js: string };

export interface CodeEditorProps {
  exerciseId: string;
  starter?: Code;
  disabled?: boolean;
}

const EMPTY: Code = { html: '', css: '', js: '' };

/** Bangun dokumen preview. Dijalankan di <iframe sandbox="allow-scripts"> TANPA
 * allow-same-origin (PRD §10) → skrip siswa tak bisa menyentuh parent/cookie/Convex. */
function buildSrcDoc({ html, css, js }: Code): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { margin: 0; padding: 12px; font-family: system-ui, sans-serif; }
    ${css}
  </style>
</head>
<body>${html}<script>${js}<\/script></body>
</html>`;
}

const LANG_CONFIG = {
  html: { label: 'HTML', ext: [htmlLang()], icon: Code2, color: '#e44d26', bg: 'bg-orange-100' },
  css:  { label: 'CSS',  ext: [cssLang()],  icon: Palette, color: '#264de4', bg: 'bg-blue-100' },
  js:   { label: 'JS',   ext: [jsLang()],   icon: Zap,    color: '#f7df1e', bg: 'bg-yellow-100' },
} as const;

type Lang = keyof typeof LANG_CONFIG;

/**
 * Code editor in-browser (Task B5): CodeMirror HTML/CSS/JS + live preview
 * di iframe sandbox (debounced 400ms). Submit tipe `code` → review admin (B4).
 *
 * Upgrade: Memphis premium UI, reset button, live indicator, line count, responsive.
 */
export default function CodeEditor({ exerciseId, starter, disabled }: CodeEditorProps) {
  const [code, setCode] = useState<Code>(starter ?? EMPTY);
  const [srcDoc, setSrcDoc] = useState('');
  const [activeTab, setActiveTab] = useState<Lang>('html');
  const [busy, setBusy] = useState(false);
  const [liveStatus, setLiveStatus] = useState<'idle' | 'updating' | 'ready'>('idle');
  const submit = useMutation(api.submissions.submitCode);

  // Debounce preview — tidak re-render iframe tiap ketik.
  useEffect(() => {
    setLiveStatus('updating');
    const t = setTimeout(() => {
      setSrcDoc(buildSrcDoc(code));
      setLiveStatus('ready');
    }, 400);
    return () => clearTimeout(t);
  }, [code]);

  const handleReset = useCallback(() => {
    setCode(starter ?? EMPTY);
    message.info('Kode direset ke starter template');
  }, [starter]);

  const handleRunPreview = useCallback(() => {
    setSrcDoc(buildSrcDoc(code));
    setLiveStatus('ready');
    message.success('Preview diperbarui! ▶');
  }, [code]);

  const handleSubmit = async () => {
    setBusy(true);
    try {
      await submit({ exerciseId: exerciseId as Id<'exercises'>, code });
      message.success('🚀 Kode terkirim — menunggu review mentor!');
    } catch (e) {
      message.error(e instanceof Error ? e.message : 'Gagal mengirim kode');
    } finally {
      setBusy(false);
    }
  };

  const lineCount = code[activeTab].split('\n').length;

  return (
    <div className="flex flex-col gap-0 rounded-2xl memphis-border memphis-shadow-lg overflow-hidden">

      {/* ── Editor Toolbar ── */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-ink text-white gap-3 flex-wrap">
        <div className="flex items-center gap-1">
          {(Object.keys(LANG_CONFIG) as Lang[]).map((lang) => {
            const cfg = LANG_CONFIG[lang];
            const Icon = cfg.icon;
            const isActive = activeTab === lang;
            return (
              <button
                key={lang}
                onClick={() => setActiveTab(lang)}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all
                  ${isActive
                    ? 'text-ink bg-memphisMustard memphis-border'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                  }
                `}
              >
                <Icon className="w-3.5 h-3.5" />
                {cfg.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          {/* Live Status Indicator */}
          <span className="flex items-center gap-1.5 text-xs text-white/60">
            <span className={`w-2 h-2 rounded-full ${
              liveStatus === 'updating' ? 'bg-yellow-400 animate-pulse' :
              liveStatus === 'ready'    ? 'bg-emerald-400' :
              'bg-white/30'
            }`} />
            {liveStatus === 'updating' ? 'Rendering...' : 'Live Preview'}
          </span>

          {/* Line count */}
          <span className="text-xs text-white/40 hidden sm:inline">
            {lineCount} baris
          </span>
        </div>
      </div>

      {/* ── Main Split: Editor + Preview ── */}
      <div className="flex flex-col lg:flex-row" style={{ minHeight: 380 }}>

        {/* Left: CodeMirror Editor */}
        <div className="flex-1 min-w-0 flex flex-col border-r-0 lg:border-r-2 border-ink/20">
          <div className="flex-1 overflow-hidden" style={{ fontSize: 13 }}>
            {(Object.keys(LANG_CONFIG) as Lang[]).map((lang) => (
              <div
                key={lang}
                className={activeTab === lang ? 'block h-full' : 'hidden'}
              >
                <CodeMirror
                  value={code[lang]}
                  height="360px"
                  extensions={[...LANG_CONFIG[lang].ext]}
                  onChange={(v) => setCode((c) => ({ ...c, [lang]: v }))}
                  basicSetup={{
                    lineNumbers: true,
                    highlightActiveLine: true,
                    foldGutter: true,
                    autocompletion: true,
                  }}
                  theme="dark"
                  style={{ height: '100%' }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right: Live Preview iframe */}
        <div className="flex-1 min-w-0 flex flex-col bg-white">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-ink/10 bg-cream/50">
            <span className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-400 border border-ink/20" />
              <span className="w-3 h-3 rounded-full bg-yellow-400 border border-ink/20" />
              <span className="w-3 h-3 rounded-full bg-emerald-400 border border-ink/20" />
            </span>
            <span className="text-xs font-bold text-ink/50 font-mono">preview.html</span>
            <button
              onClick={handleRunPreview}
              className="ml-auto flex items-center gap-1 text-xs text-memphisTeal font-bold hover:text-teal-700 transition-colors"
              title="Run Preview (Ctrl+Enter)"
            >
              <Play className="w-3 h-3" />
              Run
            </button>
          </div>
          <iframe
            title="Live HTML/CSS/JS Preview"
            srcDoc={srcDoc}
            sandbox="allow-scripts"
            className="flex-1 w-full bg-white"
            style={{ minHeight: 320, border: 'none' }}
          />
        </div>
      </div>

      {/* ── Action Bar ── */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 bg-cream/80 border-t-2 border-ink/10 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            disabled={disabled}
            className="flex items-center gap-1.5 text-xs font-bold text-ink/60 hover:text-ink transition-colors disabled:opacity-40 disabled:cursor-not-allowed px-3 py-2 rounded-xl hover:bg-ink/10"
            title="Reset ke starter template"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
          <span className="text-xs text-ink/40 hidden sm:block">
            Ctrl+Enter untuk refresh preview
          </span>
        </div>

        <button
          onClick={handleSubmit}
          disabled={disabled || busy}
          className="flex items-center gap-2 bg-memphisTeal text-white font-body font-bold text-sm px-5 py-2.5 rounded-xl memphis-border memphis-shadow-sm hover:bg-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {busy ? (
            <>
              <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              Mengirim...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Kirim Kode untuk Review
            </>
          )}
        </button>
      </div>

    </div>
  );
}
