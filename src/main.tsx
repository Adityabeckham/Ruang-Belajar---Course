import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ConvexReactClient, ConvexProviderWithAuth } from 'convex/react';
import { useFirebaseAuth } from './hooks/useFirebaseAuth';
import './index.css';
import App from './App.tsx';

// Real Convex Cloud Production Deployment URL
const rawUrl = (import.meta.env.VITE_CONVEX_URL as string) || '';
const isLocal = rawUrl.includes('127.0.0.1') || rawUrl.includes('localhost');

// Use real cloud deployment on production / mobile devices
const convexUrl = (!isLocal && rawUrl) ? rawUrl : 'https://blissful-porcupine-255.convex.cloud';

const convex = new ConvexReactClient(convexUrl);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConvexProviderWithAuth client={convex} useAuth={useFirebaseAuth}>
      <App />
    </ConvexProviderWithAuth>
  </StrictMode>,
);
