import { useEffect } from 'react';
import { useConvexAuth, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

/**
 * Saat user terautentikasi (login baru atau restore sesi), sinkronkan:
 *  1) users.storeUser  — upsert row `users` dari identitas Firebase (milik main)
 *  2) profiles.ensureProfile — bikin profile + role default student (Task 0.4)
 * Keduanya idempoten. Komponen ini tak merender apa-apa.
 */
export default function AuthSync() {
  const { isAuthenticated } = useConvexAuth();
  const storeUser = useMutation(api.users.storeUser);
  const ensureProfile = useMutation(api.profiles.ensureProfile);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    (async () => {
      try {
        await storeUser();
        if (!cancelled) await ensureProfile();
      } catch {
        // diabaikan: akan dicoba lagi pada render/login berikutnya
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, storeUser, ensureProfile]);

  return null;
}
