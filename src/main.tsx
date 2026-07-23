import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ConvexReactClient, ConvexProviderWithAuth } from 'convex/react';
import { useFirebaseAuth } from './hooks/useFirebaseAuth';
import './index.css';
import App from './App.tsx';

// Always resolve a valid URL format so ConvexProviderWithAuth is guaranteed to exist in the React tree
const rawUrl = (import.meta.env.VITE_CONVEX_URL as string) || '';
const convexUrl = rawUrl || 'https://ruang-belajar.convex.cloud';

const convex = new ConvexReactClient(convexUrl);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConvexProviderWithAuth client={convex} useAuth={useFirebaseAuth}>
      <App />
    </ConvexProviderWithAuth>
  </StrictMode>,
);
