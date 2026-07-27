import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Loading } from '@/components/ui';

const RANK_STYLES: Record<number, { bg: string; text: string; badge: string; shadow: string }> = {
  1: { bg: 'bg-yellow-50', text: 'text-yellow-700', badge: '🥇', shadow: 'shadow-yellow-200' },
  2: { bg: 'bg-gray-50',   text: 'text-gray-600',   badge: '🥈', shadow: 'shadow-gray-200' },
  3: { bg: 'bg-orange-50', text: 'text-orange-700', badge: '🥉', shadow: 'shadow-orange-200' },
};

type Member = {
  rank: number;
  displayName: string;
  avatarUrl: string | null;
  totalXp: number;
  level: number;
};

/** Memphis-styled community leaderboard — Top 10 member by XP. */
export default function LeaderboardWidget({ currentUserName }: { currentUserName?: string }) {
  const data = useQuery(api.gamification.getLeaderboard);

  if (data === undefined) return <Loading minHeight={120} />;
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-10 text-ink/50">
        <div className="text-4xl mb-2">🏁</div>
        <p className="font-body text-sm">Belum ada member di papan peringkat.</p>
        <p className="text-xs mt-1">Selesaikan lesson pertama untuk masuk!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {data.map((member: Member) => {
        const style = RANK_STYLES[member.rank] ?? { bg: 'bg-white', text: 'text-ink/70', badge: `#${member.rank}`, shadow: '' };
        const isMe = currentUserName && member.displayName === currentUserName;
        const initial = member.displayName?.charAt(0)?.toUpperCase() ?? '?';

        return (
          <div
            key={member.rank}
            className={`flex items-center gap-3 p-3 sm:p-4 rounded-2xl border-2 transition-all ${
              isMe
                ? 'border-memphisTeal bg-memphisTeal/10 memphis-shadow-sm'
                : `border-ink/10 ${style.bg} hover:border-ink/20`
            }`}
          >
            {/* Rank */}
            <div className={`shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-display font-extrabold text-lg sm:text-xl ${
              member.rank <= 3 ? '' : 'bg-ink/5 text-ink/50'
            }`}>
              {member.rank <= 3 ? style.badge : `#${member.rank}`}
            </div>

            {/* Avatar */}
            <div className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-ink/20 bg-memphisMustard flex items-center justify-center font-bold text-sm text-ink">
              {member.avatarUrl ? (
                <img src={member.avatarUrl} alt={member.displayName} className="w-full h-full object-cover" />
              ) : (
                initial
              )}
            </div>

            {/* Name & Level */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-display font-bold text-sm sm:text-base text-ink truncate">
                  {member.displayName}
                </span>
                {isMe && (
                  <span className="text-xs font-bold bg-memphisTeal text-white px-2 py-0.5 rounded-full">
                    Kamu
                  </span>
                )}
              </div>
              <span className="text-xs text-ink/50 font-body">Level {member.level}</span>
            </div>

            {/* XP */}
            <div className="shrink-0 text-right">
              <div className="font-display font-extrabold text-base sm:text-lg text-ink">
                {member.totalXp.toLocaleString()}
              </div>
              <div className="text-xs text-ink/50">XP</div>
            </div>
          </div>
        );
      })}

      <p className="text-center text-xs text-ink/40 pt-2">
        Top 10 member komunitas berdasarkan total XP
      </p>
    </div>
  );
}
