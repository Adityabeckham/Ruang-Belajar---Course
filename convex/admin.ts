import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./lib/authz";

// Daftar semua user + profil/role (admin) — untuk halaman kelola user (C5).
export const listUsers = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const profiles = await ctx.db.query("profiles").collect();
    const rows = await Promise.all(
      profiles.map(async (p) => {
        const user = await ctx.db.get(p.userId);
        return {
          userId: p.userId,
          displayName: p.displayName,
          email: (user?.email as string | undefined) ?? null,
          avatarUrl: p.avatarUrl ?? null,
          role: p.role,
          totalXp: p.totalXp,
          level: p.level,
        };
      }),
    );
    return rows.sort((a, b) => a.displayName.localeCompare(b.displayName));
  },
});

// Ubah role user (admin ↔ student). Admin tak boleh menurunkan dirinya sendiri
// (cegah lockout tak sengaja).
export const setUserRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(v.literal("admin"), v.literal("student")),
  },
  handler: async (ctx, { userId, role }) => {
    const me = await requireAdmin(ctx);
    if (me._id === userId && role !== "admin") {
      throw new Error("Tidak bisa menurunkan role diri sendiri");
    }
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (!profile) throw new Error("Profil user tidak ditemukan");
    await ctx.db.patch(profile._id, { role });
    return profile._id;
  },
});
