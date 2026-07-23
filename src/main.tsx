import { StrictMode, Component, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { ConvexReactClient, ConvexProviderWithAuth } from 'convex/react';
import { useFirebaseAuth } from './hooks/useFirebaseAuth';
import './index.css';
import App from './App.tsx';

let rawConvexUrl = (import.meta.env.VITE_CONVEX_URL as string) || '';

const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

// Only use local URL when accessing on local machine.
// On mobile HP / Cloudflare domain, fallback safely.
if (!isLocalhost && (rawConvexUrl.includes('127.0.0.1') || rawConvexUrl.includes('localhost'))) {
  rawConvexUrl = '';
}

let convexClient: ConvexReactClient | null = null;
if (rawConvexUrl) {
  try {
    convexClient = new ConvexReactClient(rawConvexUrl);
  } catch (err) {
    console.warn('[Ruang Belajar] Convex client init omitted:', err);
  }
}

interface ProviderProps {
  children: ReactNode;
}

interface ProviderState {
  hasError: boolean;
}

class SafeAuthProvider extends Component<ProviderProps, ProviderState> {
  constructor(props: ProviderProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ProviderState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.warn('[Ruang Belajar] SafeAuthProvider fallback active:', error.message);
  }

  render() {
    if (this.state.hasError || !convexClient) {
      return <>{this.props.children}</>;
    }
    return (
      <ConvexProviderWithAuth client={convexClient} useAuth={useFirebaseAuth}>
        {this.props.children}
      </ConvexProviderWithAuth>
    );
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SafeAuthProvider>
      <App />
    </SafeAuthProvider>
  </StrictMode>,
);
