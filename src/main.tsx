import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ConvexReactClient, ConvexProviderWithAuth } from 'convex/react';
import { useFirebaseAuth } from './hooks/useFirebaseAuth';
import './index.css';
import App from './App.tsx';

let rawConvexUrl = (import.meta.env.VITE_CONVEX_URL as string) || '';

// Prevent Mixed Content crash on deployed HTTPS sites (like Cloudflare / Mobile phones)
// when local http://127.0.0.1:3210 is baked into the build.
if (
  typeof window !== 'undefined' &&
  window.location.protocol === 'https:' &&
  (!rawConvexUrl || rawConvexUrl.startsWith('http://127.0.0.1') || rawConvexUrl.startsWith('http://localhost'))
) {
  rawConvexUrl = 'https://happy-animal-123.convex.cloud';
}

const convex = new ConvexReactClient(rawConvexUrl || 'https://happy-animal-123.convex.cloud');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConvexProviderWithAuth client={convex} useAuth={useFirebaseAuth}>
      <App />
    </ConvexProviderWithAuth>
  </StrictMode>,
);
