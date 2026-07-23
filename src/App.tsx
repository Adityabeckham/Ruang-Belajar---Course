import { Component, type ReactNode } from 'react';
import { ConfigProvider } from 'antd';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import useIllustrationTheme from './theme/illustrationTheme';
import { routes } from './app/routes';

const router = createBrowserRouter(routes);

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: unknown) {
    console.error('[Ruang Belajar App Error]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, textAlign: 'center', background: '#ff4444', minHeight: '100vh', fontFamily: 'sans-serif', color: 'white' }}>
          <h2 style={{ fontSize: 20, fontWeight: 'bold' }}>🚨 App Error — Ruang Belajar LMS</h2>
          <p style={{ marginTop: 12, fontSize: 14 }}>Jika melihat ini, kirim screenshot ke developer!</p>
          <pre style={{ marginTop: 16, background: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 8, textAlign: 'left', fontSize: 11, overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {this.state.error?.name}: {this.state.error?.message}{'\n'}{this.state.error?.stack?.slice(0, 500)}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: 16, padding: '10px 20px', borderRadius: 20, background: 'white', color: '#ff4444', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: 16 }}
          >
            Muat Ulang
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const configProps = useIllustrationTheme();

  return (
    <ErrorBoundary>
      <ConfigProvider {...configProps}>
        <RouterProvider router={router} />
      </ConfigProvider>
    </ErrorBoundary>
  );
}
