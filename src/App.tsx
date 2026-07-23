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
        <div style={{ padding: 24, textAlign: 'center', background: '#f5efe2', minHeight: '100vh', fontFamily: 'sans-serif' }}>
          <h2 style={{ fontSize: 24, fontWeight: 'bold', color: '#17140d' }}>Ruang Belajar LMS</h2>
          <p style={{ color: '#666', marginTop: 12 }}>Aplikasi sedang dimuat atau memulihkan sesi...</p>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: 16, padding: '10px 20px', borderRadius: 20, background: '#12b3a4', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Muat Ulang Halaman
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
