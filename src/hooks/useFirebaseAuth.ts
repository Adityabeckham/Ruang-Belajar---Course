import { useState, useEffect, useMemo, useCallback } from "react";
import { auth } from "../lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";

export function useFirebaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchAccessToken = useCallback(
    async ({ forceRefreshToken }: { forceRefreshToken: boolean }) => {
      if (!user) return null;
      try {
        return await user.getIdToken(forceRefreshToken);
      } catch (error) {
        console.error("Error fetching Firebase token:", error);
        return null;
      }
    },
    [user]
  );

  return useMemo(
    () => ({
      isLoading,
      isAuthenticated: user !== null,
      fetchAccessToken,
    }),
    [isLoading, user, fetchAccessToken]
  );
}
