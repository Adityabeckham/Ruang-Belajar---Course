import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ConvexReactClient, ConvexProviderWithAuth } from 'convex/react';
import { useFirebaseAuth } from './hooks/useFirebaseAuth';
import './index.css';
import App from './App.tsx';

// Strict Security Standard: Zero Hardcoded Production URLs in Source Code.
// Resolved dynamically from environment variables at build/runtime.
const convexUrl = import.meta.env.VITE_CONVEX_URL as string;

if (!convexUrl) {
  console.error('[Ruang Belajar LMS Security Error] VITE_CONVEX_URL environment variable is missing.');
}

const convex = new ConvexReactClient(convexUrl);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConvexProviderWithAuth client={convex} useAuth={useFirebaseAuth}>
      <App />
    </ConvexProviderWithAuth>
  </StrictMode>,
);
