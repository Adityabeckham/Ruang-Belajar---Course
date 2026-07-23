import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ConvexReactClient, ConvexProviderWithAuth } from 'convex/react';
import { useFirebaseAuth } from './hooks/useFirebaseAuth';
import './index.css';
import App from './App.tsx';

// Strict Senior Software Engineer Standard:
// Always resolve Convex backend URL dynamically from environment variables (Zero hardcoded URLs)
const convexUrl = import.meta.env.VITE_CONVEX_URL as string;

if (!convexUrl) {
  console.error('[Ruang Belajar LMS] Missing VITE_CONVEX_URL environment variable.');
}

const convex = new ConvexReactClient(convexUrl);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConvexProviderWithAuth client={convex} useAuth={useFirebaseAuth}>
      <App />
    </ConvexProviderWithAuth>
  </StrictMode>,
);
