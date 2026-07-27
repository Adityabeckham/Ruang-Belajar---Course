import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Loading } from '@/components/ui';

type Badge = {
  key: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  awardedAt: number | null;
};

/** Memphis-styled Badge Shelf — earned badges glow, locked ones greyed out. */
export default function BadgeShelf() {
  const badges = useQuery(api.gamification.getMyBadges);

  if (badges === undefined) return <Loading minHeight={80} />;

  if (badges.length === 0) {
    return (
      <div className="text-center py-8 text-ink/50">
        <div className="text-4xl mb-2">🏅</div>
        <p className="font-body text-sm">Belum ada badge tersedia.</p>
      </div>
    );
  }

  const earned = badges.filter((b) => b.earned);
  const locked = badges.filter((b) => !b.earned);

  return (
    <div className="space-y-4">
      {/* Summary count */}
      <div className="flex items-center gap-2 text-sm">
        <span className="bg-memphisMustard text-ink font-bold px-3 py-1 rounded-full border border-ink/20 text-xs">
          {earned.length} / {badges.length} badge diraih
        </span>
        {earned.length === badges.length && badges.length > 0 && (
          <span className="text-xs text-emerald-600 font-bold">🎉 Semua badge terbuka!</span>
        )}
      </div>

      {/* Badge Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {/* Earned badges first */}
        {earned.map((b) => (
          <BadgeTile key={b.key} badge={b} />
        ))}
        {/* Locked badges */}
        {locked.map((b) => (
          <BadgeTile key={b.key} badge={b} />
        ))}
      </div>
    </div>
  );
}

function BadgeTile({ badge }: { badge: Badge }) {
  const awardedDate = badge.awardedAt
    ? new Date(badge.awardedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  return (
    <div
      title={badge.earned ? `${badge.title}: ${badge.description}${awardedDate ? `\nDiraih: ${awardedDate}` : ''}` : `🔒 ${badge.description}`}
      className={`
        relative flex flex-col items-center text-center gap-2 p-4 rounded-2xl border-2 transition-all cursor-default
        ${badge.earned
          ? 'border-memphisMustard bg-memphisMustard/10 hover:bg-memphisMustard/20'
          : 'border-ink/10 bg-ink/5 opacity-50 grayscale'
        }
      `}
      style={badge.earned ? { boxShadow: '4px 4px 0 rgba(255,195,0,0.3)' } : {}}
    >
      {/* Earned glow ring */}
      {badge.earned && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      {/* Icon */}
      <div className="text-4xl leading-none">
        {badge.earned ? badge.icon : '🔒'}
      </div>

      {/* Title */}
      <div className="font-display font-bold text-xs text-ink leading-tight">
        {badge.title}
      </div>

      {/* Date */}
      {badge.earned && awardedDate && (
        <div className="text-xs text-ink/50 font-body leading-none">
          {awardedDate}
        </div>
      )}
    </div>
  );
}
