import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ConvexReactClient, ConvexProviderWithAuth } from 'convex/react';
import { useFirebaseAuth } from './hooks/useFirebaseAuth';
import './index.css';
import App from './App.tsx';

// Strict environment variable resolution (Senior Engineer Best Practice)
const convexUrl = import.meta.env.VITE_CONVEX_URL;

if (!convexUrl && import.meta.env.DEV) {
  console.warn('[Ruang Belajar] VITE_CONVEX_URL is not defined in environment variables.');
}

// Fallback dummy URL only for dev/testing when environment variable is omitted
const clientUrl = convexUrl || 'https://placeholder.convex.cloud';
const convex = new ConvexReactClient(clientUrl);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConvexProviderWithAuth client={convex} useAuth={useFirebaseAuth}>
      <App />
    </ConvexProviderWithAuth>
  </StrictMode>,
);
