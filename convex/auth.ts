import GitHub from "@auth/core/providers/github";
import Google from "@auth/core/providers/google";
import { convexAuth } from "@convex-dev/auth/server";
import { ensureProfileForUser } from "./profiles";
import type { MutationCtx } from "./_generated/server";

// Convex Auth native — Google + GitHub OAuth (PRD §2, keputusan terkunci).
// Env yang dibutuhkan di deployment (set via `npx convex env set ...`):
//   AUTH_GITHUB_ID / AUTH_GITHUB_SECRET
//   AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET
//   SITE_URL  (origin frontend, mis. http://localhost:5173)
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [GitHub, Google],
  callbacks: {
    // Dipanggil setiap user dibuat/diupdate (termasuk login pertama).
    // Bikin `profiles` row dengan role default "student" bila belum ada (Task 0.4).
    async afterUserCreatedOrUpdated(ctx, { userId }) {
      // ctx di callback bertipe generik (AnyDataModel); cast ke MutationCtx ber-skema.
      await ensureProfileForUser(ctx as unknown as MutationCtx, userId);
    },
  },
});
