import { useState, useEffect } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { useConvexAuth } from 'convex/react';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { auth, googleProvider, githubProvider } from '@/lib/firebase';
import { Loading, message } from '@/components/ui';
import logoImg from '../assets/images/ruang-belajar-logo.png';

type LocationState = { from?: { pathname?: string } } | null;

/** Halaman login: Google / GitHub via Firebase Auth (PRD §9 route `/login`). */
export default function LoginPage() {
  const { isLoading: convexLoading, isAuthenticated: convexAuth } = useConvexAuth();
  const { isLoading: firebaseLoading, isAuthenticated: firebaseAuth } = useFirebaseAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [busy, setBusy] = useState<'google' | 'github' | null>(null);

  const isAuthenticated = convexAuth || firebaseAuth;
  const isLoading = convexLoading && firebaseLoading;

  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as LocationState)?.from?.pathname ?? '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, location, navigate]);

  if (isLoading) return <Loading tip="Memeriksa sesi…" />;

  if (isAuthenticated) {
    const from = (location.state as LocationState)?.from?.pathname ?? '/dashboard';
    return <Navigate to={from} replace />;
  }

  const handle = async (provider: 'google' | 'github') => {
    setBusy(provider);
    try {
      await signInWithPopup(auth, provider === 'google' ? googleProvider : githubProvider);
      const from = (location.state as LocationState)?.from?.pathname ?? '/dashboard';
      navigate(from, { replace: true });
    } catch {
      message.error('Gagal masuk. Coba lagi.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div
      className="lp-root min-h-screen w-full flex items-center justify-center px-4 py-10 relative overflow-hidden"
      style={{ background: '#f5efe2', fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ── Memphis Confetti Background ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <svg className="absolute top-10 left-6 w-12 h-12 anim-drift" viewBox="0 0 100 100">
          <polygon points="50,10 90,90 10,90" fill="#ff5b57" stroke="#17140d" strokeWidth="8" strokeLinejoin="round" />
        </svg>
        <svg className="absolute top-16 right-12 w-16 h-16 anim-bob" viewBox="0 0 100 100">
          <path d="M 10 90 A 80 80 0 0 1 90 10 L 90 90 Z" fill="#12b3a4" stroke="#17140d" strokeWidth="7" strokeLinejoin="round" />
        </svg>
        <svg className="absolute top-1/2 left-4 w-10 h-10 anim-spin" viewBox="0 0 100 100">
          <path d="M 35 10 H 65 V 35 H 90 V 65 H 65 V 90 H 35 V 65 H 10 V 35 H 35 Z" fill="#6b5be6" stroke="#17140d" strokeWidth="7" strokeLinejoin="round" />
        </svg>
        <svg className="absolute top-1/3 right-6 w-14 h-14 anim-drift" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="38" fill="none" stroke="#ffc531" strokeWidth="12" strokeDasharray="10 15" />
          <circle cx="50" cy="50" r="38" fill="none" stroke="#17140d" strokeWidth="5" />
        </svg>
        <svg className="absolute bottom-24 left-1/4 w-12 h-12 anim-drift" viewBox="0 0 100 100">
          <path d="M 10 50 A 40 40 0 0 1 90 50 Z" fill="#ffc531" stroke="#17140d" strokeWidth="7" />
        </svg>
        <svg className="absolute bottom-12 right-16 w-16 h-16 anim-spin" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="#ff5b57" stroke="#17140d" strokeWidth="6" />
          <line x1="20" y1="30" x2="80" y2="30" stroke="#17140d" strokeWidth="5" />
          <line x1="10" y1="50" x2="90" y2="50" stroke="#17140d" strokeWidth="5" />
          <line x1="20" y1="70" x2="80" y2="70" stroke="#17140d" strokeWidth="5" />
        </svg>
        <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 w-24 h-12 anim-sway opacity-30" viewBox="0 0 120 60">
          <path d="M 10 30 Q 30 5, 50 30 T 90 30 T 110 30" fill="none" stroke="#17140d" strokeWidth="8" strokeLinecap="round" />
        </svg>
      </div>

      {/* ── Login Card ── */}
      <div className="relative z-10 w-full max-w-md">

        {/* Bottom badge */}
        <div className="mb-5 flex justify-center">
          <div className="inline-flex items-center gap-2 bg-memphisViolet text-white text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full memphis-border memphis-shadow-sm">
            <span className="w-2 h-2 rounded-full bg-memphisMustard animate-pulse" />
            <span>Komunitas 100% Gratis</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl memphis-border memphis-shadow-static p-7 sm:p-10">

          {/* Header */}
          <div className="flex flex-col items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl overflow-hidden memphis-border memphis-shadow-sm ">
              <img src={logoImg} alt="Logo Ruang Belajar" className="object-cover w-full h-full" />
            </div>
            <div className="text-center">
              <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-ink leading-tight">
                Masuk ke{' '}
                <span className="marker-highlight marker-mustard text-ink">Ruang Belajar</span>
              </h1>
              <p className="font-body text-ink/60 text-sm sm:text-base mt-1.5">
                Pakai akun Google atau GitHub kamu untuk bergabung.
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-[2px] bg-ink/10 rounded" />
            <span className="font-body text-xs font-bold text-ink/40 uppercase tracking-wider">Login via</span>
            <div className="flex-1 h-[2px] bg-ink/10 rounded" />
          </div>

          {/* Auth Buttons */}
          <div className="flex flex-col gap-3">
            {/* Google */}
            <button
              onClick={() => handle('google')}
              disabled={busy !== null}
              className="w-full flex items-center justify-center gap-3 bg-white text-ink font-body font-bold text-sm sm:text-base py-3.5 rounded-2xl memphis-border memphis-shadow-sm hover:bg-cream transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {busy === 'google' ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              {busy === 'google' ? 'Memproses…' : 'Lanjut dengan Google'}
            </button>

            {/* GitHub */}
            <button
              onClick={() => handle('github')}
              disabled={busy !== null}
              className="w-full flex items-center justify-center gap-3 bg-ink text-white font-body font-bold text-sm sm:text-base py-3.5 rounded-2xl memphis-border memphis-shadow-sm hover:bg-ink/85 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {busy === 'github' ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              )}
              {busy === 'github' ? 'Memproses…' : 'Lanjut dengan GitHub'}
            </button>
          </div>

          {/* Footer note */}
          <p className="font-body text-center text-xs text-ink/40 mt-7 leading-relaxed">
            Dengan masuk, kamu menyetujui{' '}
            <span className="text-ink/60 font-semibold">Syarat & Ketentuan</span>
            {' '}dan{' '}
            <span className="text-ink/60 font-semibold">Kebijakan Privasi</span>{' '}
            Ruang Belajar.
          </p>
        </div>

        {/* Back to home */}
        <div className="mb-1 text-center mt-6">
          <Link to="/" className="inline-flex items-center gap-2 font-body font-medium text-ink/60 hover:text-ink transition-colors text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali ke Beranda
          </Link>
        </div>

      </div>
    </div>
  );
}
