import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ConvexReactClient, ConvexProviderWithAuth } from 'convex/react';
import { useFirebaseAuth } from './hooks/useFirebaseAuth';
import './index.css';
import App from './App.tsx';

let envConvexUrl = (import.meta.env.VITE_CONVEX_URL as string) || '';

// Senior Engineer Safeguard for Mobile Devices (iPhone/Safari):
// If accessing from external host (e.g. Cloudflare / iPhone) and env is local, automatically resolve to Convex Cloud.
const isLocalHost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

if (!isLocalHost && (envConvexUrl.includes('127.0.0.1') || envConvexUrl.includes('localhost') || !envConvexUrl)) {
  envConvexUrl = 'https://precious-antelope-329.convex.cloud';
}

const convexUrl = envConvexUrl || 'https://precious-antelope-329.convex.cloud';
const convex = new ConvexReactClient(convexUrl);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConvexProviderWithAuth client={convex} useAuth={useFirebaseAuth}>
      <App />
    </ConvexProviderWithAuth>
  </StrictMode>,
);
