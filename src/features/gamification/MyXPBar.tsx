import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Loading } from '@/components/ui';

interface Props {
  /** Tampilkan streak hari di bawah XP bar. Default: true */
  showStreak?: boolean;
}

/** Memphis-styled XP/Level/Streak bar untuk user yang login. */
export default function MyXPBar({ showStreak = true }: Props) {
  const g = useQuery(api.gamification.getMyGamification);

  if (g === undefined) return <Loading minHeight={60} />;
  if (g === null) return null;

  const percent = g.xpForNextLevel > 0
    ? Math.min(100, Math.round((g.xpIntoLevel / g.xpForNextLevel) * 100))
    : 100;

  const streakEmoji = g.dailyStreak >= 30 ? '🔥🔥🔥'
    : g.dailyStreak >= 14 ? '🔥🔥'
    : g.dailyStreak >= 3  ? '🔥'
    : '❄️';

  return (
    <div className="space-y-4">
      {/* XP + Level Row */}
      <div className="flex items-center gap-4">
        {/* Level Badge */}
        <div className="w-16 h-16 shrink-0 rounded-2xl bg-memphisMustard text-ink flex flex-col items-center justify-center memphis-border memphis-shadow-sm">
          <span className="font-display font-extrabold text-xl leading-none">{g.level}</span>
          <span className="text-xs font-bold uppercase tracking-wider">Lv</span>
        </div>

        {/* Progress Bar */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex justify-between items-baseline">
            <span className="font-display font-bold text-base sm:text-lg text-ink">Level {g.level}</span>
            <span className="font-body text-xs sm:text-sm text-ink/60">
              {g.xpIntoLevel.toLocaleString()} / {g.xpForNextLevel.toLocaleString()} XP
            </span>
          </div>

          {/* Memphis Progress Track */}
          <div className="relative w-full h-5 bg-ink/10 rounded-full border-2 border-ink overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-memphisCoral rounded-full transition-all duration-700"
              style={{ width: `${percent}%` }}
            />
            {/* Striped overlay */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(45deg, transparent, transparent 6px, rgba(255,255,255,0.15) 6px, rgba(255,255,255,0.15) 12px)',
              }}
            />
          </div>

          <div className="flex justify-between">
            <span className="text-xs text-ink/50">
              {g.totalXp.toLocaleString()} XP total
            </span>
            <span className="text-xs font-bold text-memphisCoral">{percent}%</span>
          </div>
        </div>
      </div>

      {/* Daily Streak */}
      {showStreak && (
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 bg-memphisMustard/20 border-2 border-memphisMustard/40 rounded-2xl px-4 py-2.5 flex-1">
            <span className="text-2xl leading-none">{streakEmoji}</span>
            <div>
              <div className="font-display font-extrabold text-xl text-ink leading-none">
                {g.dailyStreak}
                <span className="font-body font-normal text-sm text-ink/60 ml-1">hari</span>
              </div>
              <div className="text-xs text-ink/60 font-body">Daily Learning Streak</div>
            </div>
          </div>

          {/* Total XP Summary */}
          <div className="flex items-center gap-3 bg-memphisTeal/10 border-2 border-memphisTeal/30 rounded-2xl px-4 py-2.5 flex-1">
            <span className="text-2xl leading-none">⚡</span>
            <div>
              <div className="font-display font-extrabold text-xl text-ink leading-none">
                {g.totalXp.toLocaleString()}
                <span className="font-body font-normal text-sm text-ink/60 ml-1">XP</span>
              </div>
              <div className="text-xs text-ink/60 font-body">Total XP Diraih</div>
            </div>
          </div>

          {/* Streak Tip */}
          {g.dailyStreak === 0 && (
            <p className="w-full text-xs text-ink/50 text-center mt-1">
              💡 Selesaikan minimal 1 lesson hari ini untuk memulai streak!
            </p>
          )}
        </div>
      )}
    </div>
  );
}
