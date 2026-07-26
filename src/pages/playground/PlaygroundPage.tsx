import { useState, useEffect, useCallback } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { html as htmlLang } from '@codemirror/lang-html';
import { css as cssLang } from '@codemirror/lang-css';
import { javascript as jsLang } from '@codemirror/lang-javascript';
import { Link } from 'react-router-dom';
import { RotateCcw, Play, Code2, Palette, Zap, ArrowLeft, Share2, Copy, CheckCheck } from 'lucide-react';
import { message } from '@/components/ui';

type Code = { html: string; css: string; js: string };

const STARTER: Code = {
  html: `<!-- Selamat datang di Ruang Belajar Playground! 🚀 -->
<!-- Coba tulis kode HTML kamu di sini -->

<div class="container">
  <h1>Halo, Dunia! 👋</h1>
  <p>Selamat datang di <strong>Ruang Belajar Playground</strong>.</p>
  <p>Kamu bisa menulis HTML, CSS, dan JavaScript di sini dan melihat hasilnya secara langsung!</p>
  <button onclick="handleClick()">Klik Saya! 🎉</button>
</div>`,
  css: `/* Tulis style CSS kamu di sini */

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 20px;
  font-family: 'Segoe UI', system-ui, sans-serif;
  background: #f5efe2;
  color: #17140d;
}

.container {
  max-width: 600px;
  margin: 40px auto;
  background: white;
  border: 3px solid #17140d;
  border-radius: 24px;
  padding: 40px;
  box-shadow: 6px 6px 0 #17140d;
  text-align: center;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 16px;
}

button {
  background: #12b3a4;
  color: white;
  border: 3px solid #17140d;
  border-radius: 50px;
  padding: 12px 28px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 4px 4px 0 #17140d;
  transition: transform 0.1s, box-shadow 0.1s;
}

button:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 #17140d;
}

button:active {
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0 #17140d;
}`,
  js: `// Tulis JavaScript kamu di sini!

function handleClick() {
  const emojis = ['🎉', '🚀', '✨', '🔥', '💡', '🎯', '🌟'];
  const emoji = emojis[Math.floor(Math.random() * emojis.length)];
  alert(emoji + ' Keren! Kamu berhasil membuat button interaktif!');
}

// Contoh: console.log ke DevTools browser
console.log('🎓 Ruang Belajar Playground siap digunakan!');`,
};

function buildSrcDoc({ html, css, js }: Code): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>${css}</style>
</head>
<body>${html}<script>${js}<\/script></body>
</html>`;
}

const LANG_CONFIG = {
  html: { label: 'HTML', ext: [htmlLang()], icon: Code2, color: '#e44d26' },
  css:  { label: 'CSS',  ext: [cssLang()],  icon: Palette, color: '#264de4' },
  js:   { label: 'JS',   ext: [jsLang()],   icon: Zap,    color: '#f7df1e' },
} as const;

type Lang = keyof typeof LANG_CONFIG;

/** Free Code Playground — belajar HTML/CSS/JS bebas tanpa latihan formal. */
export default function PlaygroundPage() {
  const [code, setCode] = useState<Code>(STARTER);
  const [srcDoc, setSrcDoc] = useState('');
  const [activeTab, setActiveTab] = useState<Lang>('html');
  const [liveStatus, setLiveStatus] = useState<'idle' | 'updating' | 'ready'>('idle');
  const [copied, setCopied] = useState(false);

  // Initial render
  useEffect(() => {
    setSrcDoc(buildSrcDoc(STARTER));
    setLiveStatus('ready');
  }, []);

  // Debounce preview
  useEffect(() => {
    setLiveStatus('updating');
    const t = setTimeout(() => {
      setSrcDoc(buildSrcDoc(code));
      setLiveStatus('ready');
    }, 400);
    return () => clearTimeout(t);
  }, [code]);

  // Keyboard shortcut: Ctrl+Enter = Run
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        setSrcDoc(buildSrcDoc(code));
        setLiveStatus('ready');
        message.success('▶ Preview diperbarui!');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [code]);

  const handleReset = useCallback(() => {
    setCode(STARTER);
    message.info('Kode direset ke starter template');
  }, []);

  const handleCopyCode = useCallback(() => {
    const fullCode = buildSrcDoc(code);
    navigator.clipboard.writeText(fullCode).then(() => {
      setCopied(true);
      message.success('Kode disalin ke clipboard!');
      setTimeout(() => setCopied(false), 2000);
    });
  }, [code]);

  const lineCount = code[activeTab].split('\n').length;
  const totalLines = code.html.split('\n').length + code.css.split('\n').length + code.js.split('\n').length;

  return (
    <div
      className="lp-root min-h-screen flex flex-col"
      style={{ background: '#17140d', color: '#f5efe2', fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ── Topbar ── */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-3 border-b-2 border-white/10 flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Kembali ke Dashboard</span>
          </Link>
          <div className="w-px h-5 bg-white/20 hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="text-lg">🧪</span>
            <div>
              <h1 className="font-display font-extrabold text-sm sm:text-base text-white leading-none">
                Ruang Belajar Playground
              </h1>
              <p className="text-xs text-white/40 mt-0.5 hidden sm:block">
                {totalLines} baris kode · HTML + CSS + JS
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Live Status */}
          <span className="flex items-center gap-1.5 text-xs text-white/50">
            <span className={`w-2 h-2 rounded-full ${
              liveStatus === 'updating' ? 'bg-yellow-400 animate-pulse' :
              liveStatus === 'ready'    ? 'bg-emerald-400' :
              'bg-white/30'
            }`} />
            <span className="hidden sm:inline">
              {liveStatus === 'updating' ? 'Rendering...' : 'Live'}
            </span>
          </span>

          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 text-xs font-bold text-white/70 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/10 transition-all"
          >
            {copied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Disalin!' : 'Salin Kode'}</span>
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs font-bold text-white/70 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/10 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </header>

      {/* ── Language Tabs ── */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-white/10">
        {(Object.keys(LANG_CONFIG) as Lang[]).map((lang) => {
          const cfg = LANG_CONFIG[lang];
          const Icon = cfg.icon;
          const isActive = activeTab === lang;
          const lines = code[lang].split('\n').length;
          return (
            <button
              key={lang}
              onClick={() => setActiveTab(lang)}
              className={`
                flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all
                ${isActive
                  ? 'text-ink bg-memphisMustard'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
                }
              `}
            >
              <Icon className="w-3.5 h-3.5" />
              {cfg.label}
              <span className={`text-xs font-normal ${isActive ? 'text-ink/60' : 'text-white/30'} hidden sm:inline`}>
                {lines}L
              </span>
            </button>
          );
        })}

        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-white/30 hidden md:block">
            Baris ke-{lineCount}
          </span>
          <kbd className="hidden md:inline text-xs text-white/30 bg-white/10 px-2 py-0.5 rounded font-mono">
            Ctrl+Enter
          </kbd>
          <button
            onClick={() => {
              setSrcDoc(buildSrcDoc(code));
              setLiveStatus('ready');
              message.success('▶ Preview diperbarui!');
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-memphisCoral px-3 py-1.5 rounded-lg hover:bg-red-500 transition-colors"
          >
            <Play className="w-3.5 h-3.5" />
            Run
          </button>
        </div>
      </div>

      {/* ── Main Split ── */}
      <div className="flex flex-col lg:flex-row flex-1" style={{ minHeight: 'calc(100vh - 120px)' }}>

        {/* Editor */}
        <div className="flex-1 min-w-0 overflow-hidden lg:border-r border-white/10" style={{ fontSize: 13 }}>
          {(Object.keys(LANG_CONFIG) as Lang[]).map((lang) => (
            <div
              key={lang}
              className={activeTab === lang ? 'block h-full' : 'hidden'}
            >
              <CodeMirror
                value={code[lang]}
                height="calc(100vh - 120px)"
                extensions={[...LANG_CONFIG[lang].ext]}
                onChange={(v) => setCode((c) => ({ ...c, [lang]: v }))}
                basicSetup={{
                  lineNumbers: true,
                  highlightActiveLine: true,
                  foldGutter: true,
                  autocompletion: true,
                  bracketMatching: true,
                  closeBrackets: true,
                  indentOnInput: true,
                }}
                theme="dark"
                style={{ height: '100%' }}
              />
            </div>
          ))}
        </div>

        {/* Preview Panel */}
        <div className="flex-1 min-w-0 flex flex-col bg-white">
          <div className="flex items-center gap-2 px-4 py-2 bg-white border-b border-gray-200">
            <span className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-400" />
              <span className="w-3 h-3 rounded-full bg-yellow-400" />
              <span className="w-3 h-3 rounded-full bg-emerald-400" />
            </span>
            <span className="text-xs font-bold text-gray-400 font-mono">preview.html</span>
            <div className="ml-auto flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${
                liveStatus === 'updating' ? 'bg-yellow-500 animate-pulse' : 'bg-emerald-500'
              }`} />
              <span className="text-xs text-gray-400">
                {liveStatus === 'updating' ? 'Rendering...' : 'Live'}
              </span>
            </div>
          </div>
          <iframe
            title="Live HTML/CSS/JS Preview — Ruang Belajar Playground"
            srcDoc={srcDoc}
            sandbox="allow-scripts"
            className="flex-1 w-full border-none"
            style={{ minHeight: '400px' }}
          />
        </div>
      </div>

      {/* ── Bottom Info Bar ── */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-white/10 text-xs text-white/30 flex-wrap gap-2">
        <span>🔒 Sandbox aman — kode berjalan terisolasi tanpa akses ke data akun</span>
        <span>Ruang Belajar Community · 100% Gratis</span>
      </div>
    </div>
  );
}
