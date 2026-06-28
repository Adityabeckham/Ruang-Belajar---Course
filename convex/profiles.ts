import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";

// Helper dipakai oleh auth callback: bikin profile saat login pertama.
// Idempoten — aman dipanggil tiap login (afterUserCreatedOrUpdated).
// Role default "student" (PRD §3); admin pertama dipromosikan manual / lewat seed.
export async function ensureProfileForUser(
  ctx: MutationCtx,
  userId: Id<"users">,
) {
  const existing = await ctx.db
    .query("profiles")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .unique();
  if (existing) return existing._id;

  const user = await ctx.db.get(userId);
  const displayName =
    (user?.name as string | undefined) ??
    (user?.email as string | undefined) ??
    "Pengguna Baru";
  const avatarUrl = user?.image as string | undefined;

  return await ctx.db.insert("profiles", {
    userId,
    role: "student",
    displayName,
    avatarUrl,
    totalXp: 0,
    level: 1,
  });
}

// Profil user yang sedang login (null bila belum login / belum ada profil).
export const getCurrentProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
  },
});

// Apakah user yang login adalah admin? Dipakai guard server-side & UI.
export const isCurrentUserAdmin = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    return profile?.role === "admin";
  },
});
