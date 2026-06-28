import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { XPBar, Loading } from '@/components/ui';

/** XPBar untuk user login (Task C3) — data dari getMyGamification (C1). */
export default function MyXPBar() {
  const g = useQuery(api.gamification.getMyGamification);
  if (g === undefined) return <Loading minHeight={60} />;
  if (g === null) return null;
  return <XPBar value={g.xpIntoLevel} max={g.xpForNextLevel} level={g.level} />;
}
