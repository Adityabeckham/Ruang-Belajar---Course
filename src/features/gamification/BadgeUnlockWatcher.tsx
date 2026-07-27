import { useEffect, useRef, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';

type BadgeInfo = {
  key: string;
  title: string;
  icon: string;
  description: string;
  earned: boolean;
  awardedAt: number | null;
};

/**
 * Watches for newly-earned badges and shows a Memphis-styled toast popup.
 * Renders nothing visible — side-effect only component, mounted in Layout.
 */
export default function BadgeUnlockWatcher() {
  const badges = useQuery(api.gamification.getMyBadges);
  const prev = useRef<Set<string>>(new Set());
  const [toasts, setToasts] = useState<BadgeInfo[]>([]);

  useEffect(() => {
    if (!badges) return;
    const earnedNow = badges.filter((b) => b.earned);
    const newlyEarned = earnedNow.filter((b) => !prev.current.has(b.key));

    if (newlyEarned.length > 0 && prev.current.size > 0) {
      // Only show toast if we had a previous snapshot (not on initial load)
      setToasts((t) => [...t, ...newlyEarned]);
    }

    prev.current = new Set(earnedNow.map((b) => b.key));
  }, [badges]);

  const dismiss = (key: string) => setToasts((t) => t.filter((b) => b.key !== key));

  return (
    <>
      {toasts.map((badge) => (
        <BadgeToast key={badge.key} badge={badge} onDismiss={() => dismiss(badge.key)} />
      ))}
    </>
  );
}

function BadgeToast({ badge, onDismiss }: { badge: BadgeInfo; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 5000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div
      className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 duration-300"
      style={{ animation: 'slideUp 0.4s ease-out' }}
    >
      <div
        className="flex items-center gap-4 bg-memphisMustard border-3 border-ink rounded-2xl memphis-shadow-lg px-5 py-4 max-w-xs sm:max-w-sm"
        style={{ border: '3px solid #17140d', boxShadow: '6px 6px 0 #17140d' }}
      >
        {/* Icon */}
        <div className="w-14 h-14 shrink-0 bg-white rounded-2xl flex items-center justify-center text-3xl"
          style={{ border: '2px solid #17140d' }}>
          {badge.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold text-ink/70 uppercase tracking-wider mb-0.5">
            🏆 Badge Baru Terbuka!
          </div>
          <div className="font-display font-extrabold text-base text-ink leading-tight">
            {badge.title}
          </div>
          <div className="text-xs text-ink/70 font-body mt-0.5 leading-snug">
            {badge.description}
          </div>
        </div>

        {/* Close */}
        <button
          onClick={onDismiss}
          className="shrink-0 w-6 h-6 rounded-full bg-ink/10 hover:bg-ink/20 flex items-center justify-center text-ink/60 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
