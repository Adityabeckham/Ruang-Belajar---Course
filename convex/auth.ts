/**
 * Convex Auth Configuration — Ruang Belajar LMS
 *
 * Configures OAuth providers (GitHub + Google) for the LMS.
 * This is the server-side auth configuration that Convex Auth uses
 * to handle authentication flows.
 *
 * Environment variables required (set via `npx convex env set`):
 *  - AUTH_GITHUB_ID       — GitHub OAuth App Client ID
 *  - AUTH_GITHUB_SECRET   — GitHub OAuth App Client Secret
 *  - AUTH_GOOGLE_ID       — Google OAuth Client ID
 *  - AUTH_GOOGLE_SECRET   — Google OAuth Client Secret
 *
 * @see https://labs.convex.dev/auth/config/oauth
 * @module
 */

import GitHub from "@auth/core/providers/github";
import Google from "@auth/core/providers/google";
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [GitHub, Google],
});
