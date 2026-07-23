import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { Authenticated, Unauthenticated, AuthLoading, useQuery } from 'convex/react';
import { auth } from '@/lib/firebase';
import { api } from '../../convex/_generated/api';
import logoImg from '@/assets/images/ruang-belajar-logo.png';

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/courses', label: 'Katalog Course' },
];

function ProfileChip() {
  const profile = useQuery(api.profiles.getCurrentProfile);
  const gami = useQuery(api.gamification.getMyGamification);
  const isAdmin = profile?.role === 'admin';

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {gami && (
        <span className="bg-memphisMustard text-ink font-bold text-xs px-2.5 py-1 rounded-full memphis-border hidden sm:inline-block">
          Lv {gami.level} · {gami.totalXp} XP
        </span>
      )}
      {isAdmin && (
        <Link to="/admin" className="bg-memphisViolet text-white font-bold text-xs px-2.5 py-1 rounded-full memphis-border hover:opacity-90">
          Admin
        </Link>
      )}
      <Link to="/profile" className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full memphis-border hover:bg-cream transition-colors">
        <div className="w-6 h-6 rounded-full bg-memphisTeal text-white font-bold flex items-center justify-center text-xs overflow-hidden">
          {profile?.avatarUrl ? (
            <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            profile?.displayName?.charAt(0)?.toUpperCase() ?? 'U'
          )}
        </div>
        <span className="font-body font-bold text-xs sm:text-sm text-ink max-w-[100px] truncate sm:max-w-none">
          {profile?.displayName ?? 'Profil'}
        </span>
      </Link>
      <button
        onClick={() => void signOut(auth)}
        className="bg-memphisCoral text-white font-body font-bold text-xs px-3 py-1.5 rounded-full memphis-border memphis-shadow-sm hover:bg-red-600 transition-all"
      >
        Keluar
      </button>
    </div>
  );
}

export default function Nav() {
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b-2 border-ink/10 bg-cream/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl overflow-hidden border-2 border-ink">
              <img src={logoImg} alt="Logo" className="object-cover w-full h-full" />
            </div>
            <span className="font-display font-extrabold text-lg sm:text-2xl tracking-tight text-ink">
              Ruang Belajar
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {links.map((l) => {
              const active = pathname.startsWith(l.to);
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`font-body font-bold text-sm lg:text-base transition-colors ${
                    active ? 'text-memphisCoral underline underline-offset-4 decoration-2' : 'text-ink hover:text-memphisCoral'
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </div>

          {/* Auth Section */}
          <div className="flex items-center gap-2">
            <AuthLoading>
              <span className="text-xs font-bold text-ink/50 animate-pulse">Loading…</span>
            </AuthLoading>

            <Unauthenticated>
              <Link
                to="/login"
                className="bg-memphisTeal text-white font-body font-bold text-xs sm:text-sm px-4 py-2 rounded-full memphis-border memphis-shadow-sm hover:bg-teal-600 transition-all"
              >
                Masuk
              </Link>
            </Unauthenticated>

            <Authenticated>
              <ProfileChip />
            </Authenticated>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-xl memphis-border bg-white hover:bg-cream transition-colors ml-1"
              aria-label="Toggle Navigation"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t-2 border-ink/10 bg-cream/98 px-4 pb-4 pt-2 space-y-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-2.5 rounded-xl font-body font-bold text-ink hover:bg-memphisMustard/30 transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
