import { useEffect, useRef } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { notification } from '@/components/ui';

/**
 * Pantau level user; saat naik, tampilkan notifikasi (Task C3 — level-up feedback).
 * Tak merender apa-apa; dipasang di Layout.
 */
export default function LevelUpWatcher() {
  const g = useQuery(api.gamification.getMyGamification);
  const prev = useRef<number | null>(null);

  useEffect(() => {
    if (g == null) return;
    if (prev.current !== null && g.level > prev.current) {
      notification.success({
        message: `Naik ke Level ${g.level}! 🎉`,
        description: 'Terus kumpulkan XP untuk membuka level berikutnya.',
        placement: 'topRight',
      });
    }
    prev.current = g.level;
  }, [g]);

  return null;
}
