import { mutation, query } from "./_generated/server";
import type { QueryCtx, MutationCtx } from "./_generated/server";

// Resolve user Convex dari identitas Firebase (JWT → tokenIdentifier).
// Selaras dengan pola convex/users.ts (milik auth Firebase di main).
async function userFromIdentity(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  return await ctx.db
    .query("users")
    .withIndex("by_tokenIdentifier", (q) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier),
    )
    .unique();
}

// Profil user yang sedang login (null bila belum login / belum ada profil).
export const getCurrentProfile = query({
  args: {},
  handler: async (ctx) => {
    const user = await userFromIdentity(ctx);
    if (!user) return null;
    return await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();
  },
});

// Apakah user yang login adalah admin? Dipakai guard server-side & UI.
export const isCurrentUserAdmin = query({
  args: {},
  handler: async (ctx) => {
    const user = await userFromIdentity(ctx);
    if (!user) return false;
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();
    return profile?.role === "admin";
  },
});

// Bikin profile saat login pertama (role default "student") — idempoten (Task 0.4).
// Dipanggil dari frontend setelah `users.storeUser` (lihat AuthSync).
// Prasyarat: row `users` sudah ada (dibuat oleh storeUser).
export const ensureProfile = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await userFromIdentity(ctx);
    if (!user) return null;

    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();
    if (existing) return existing._id;

    return await ctx.db.insert("profiles", {
      userId: user._id,
      role: "student",
      displayName: user.name ?? user.email ?? "Pengguna Baru",
      avatarUrl: user.image,
      totalXp: 0,
      level: 1,
    });
  },
});
