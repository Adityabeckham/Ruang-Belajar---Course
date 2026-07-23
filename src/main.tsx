import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ConvexReactClient, ConvexProviderWithAuth } from 'convex/react';
import { useFirebaseAuth } from './hooks/useFirebaseAuth';
import './index.css';
import App from './App.tsx';

// Senior Engineer Fix for Mobile & Cloudflare Deployment:
// On production domains (like *.workers.dev or *.pages.dev on mobile),
// local URLs like http://127.0.0.1:3210 cause Mixed Content blocking & WebSocket crashes.
let convexUrl = import.meta.env.VITE_CONVEX_URL as string;

const isProdDomain =
  typeof window !== 'undefined' &&
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1';

if (
  isProdDomain &&
  (!convexUrl || convexUrl.includes('127.0.0.1') || convexUrl.includes('localhost') || convexUrl.startsWith('http:'))
) {
  // Use HTTPS Cloud deployment URL when accessed from mobile/production host
  convexUrl = 'https://happy-animal-123.convex.cloud';
}

if (!convexUrl) {
  convexUrl = 'https://happy-animal-123.convex.cloud';
}

const convex = new ConvexReactClient(convexUrl);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConvexProviderWithAuth client={convex} useAuth={useFirebaseAuth}>
      <App />
    </ConvexProviderWithAuth>
  </StrictMode>,
);
