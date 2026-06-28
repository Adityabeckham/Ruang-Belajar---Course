import type { QueryCtx, MutationCtx } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";

// Helper otorisasi server-side (PRD §10): identitas & role dicek di server,
// bukan dari argumen client. Dipakai lintas-stream (lib/ = helper umum).
// Pola identitas selaras convex/users.ts (Firebase JWT → tokenIdentifier).

type Ctx = QueryCtx | MutationCtx;

export async function getCurrentUser(ctx: Ctx): Promise<Doc<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  return await ctx.db
    .query("users")
    .withIndex("by_tokenIdentifier", (q) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier),
    )
    .unique();
}

export async function getCurrentProfile(
  ctx: Ctx,
): Promise<Doc<"profiles"> | null> {
  const user = await getCurrentUser(ctx);
  if (!user) return null;
  return await ctx.db
    .query("profiles")
    .withIndex("by_user", (q) => q.eq("userId", user._id))
    .unique();
}

/** Pastikan ada user login; lempar bila tidak. */
export async function requireUser(ctx: Ctx): Promise<Doc<"users">> {
  const user = await getCurrentUser(ctx);
  if (!user) throw new Error("Unauthenticated");
  return user;
}

/** Pastikan user login adalah admin; lempar bila bukan. */
export async function requireAdmin(ctx: Ctx): Promise<Doc<"users">> {
  const user = await requireUser(ctx);
  const profile = await ctx.db
    .query("profiles")
    .withIndex("by_user", (q) => q.eq("userId", user._id))
    .unique();
  if (profile?.role !== "admin") {
    throw new Error("Forbidden: butuh role admin");
  }
  return user;
}

export async function isAdmin(ctx: Ctx): Promise<boolean> {
  const profile = await getCurrentProfile(ctx);
  return profile?.role === "admin";
}
