import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import type { QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { requireUser, getCurrentUser } from "./lib/authz";

// Lampirkan info penulis (nama/avatar/role) + flag `mine` ke sebuah komentar.
async function enrich(
  ctx: QueryCtx,
  comment: Doc<"comments">,
  meId: Id<"users"> | null,
) {
  const user = await ctx.db.get(comment.userId);
  const profile = user
    ? await ctx.db
        .query("profiles")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .unique()
    : null;
  return {
    _id: comment._id,
    bodyMd: comment.bodyMd,
    parentId: comment.parentId ?? null,
    createdAt: comment.createdAt,
    mine: meId !== null && comment.userId === meId,
    author: {
      displayName: profile?.displayName ?? user?.name ?? "Pengguna",
      avatarUrl: profile?.avatarUrl,
      isAdmin: profile?.role === "admin",
    },
  };
}

// Komentar per-lesson, tersusun thread (root + replies 1 level). Read publik.
export const listByLesson = query({
  args: { lessonId: v.id("lessons") },
  handler: async (ctx, { lessonId }) => {
    const me = await getCurrentUser(ctx);
    const myProfile = me
      ? await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", me._id))
          .unique()
      : null;
    const canModerate = myProfile?.role === "admin";

    const all = await ctx.db
      .query("comments")
      .withIndex("by_lesson", (q) => q.eq("lessonId", lessonId))
      .collect();
    all.sort((a, b) => a.createdAt - b.createdAt);

    const enriched = await Promise.all(
      all.map((c) => enrich(ctx, c, me?._id ?? null)),
    );

    const repliesByParent = new Map<string, typeof enriched>();
    for (const c of enriched) {
      if (c.parentId) {
        const arr = repliesByParent.get(c.parentId) ?? [];
        arr.push(c);
        repliesByParent.set(c.parentId, arr);
      }
    }

    const roots = enriched
      .filter((c) => !c.parentId)
      .map((r) => ({
        ...r,
        canModerate,
        replies: (repliesByParent.get(r._id) ?? []).map((rep) => ({
          ...rep,
          canModerate,
        })),
      }));

    return { canModerate, comments: roots };
  },
});

// Tambah komentar (atau balasan). 1-level: balasan ke balasan dinaikkan ke root.
export const add = mutation({
  args: {
    lessonId: v.id("lessons"),
    bodyMd: v.string(),
    parentId: v.optional(v.id("comments")),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const body = args.bodyMd.trim();
    if (!body) throw new Error("Komentar tidak boleh kosong");

    let parentId = args.parentId;
    if (parentId) {
      const parent = await ctx.db.get(parentId);
      if (!parent) throw new Error("Komentar induk tidak ditemukan");
      if (parent.parentId) parentId = parent.parentId; // flatten ke 1 level
    }

    return await ctx.db.insert("comments", {
      lessonId: args.lessonId,
      userId: user._id,
      bodyMd: body,
      parentId,
      createdAt: Date.now(),
    });
  },
});

// Edit komentar — hanya penulis.
export const edit = mutation({
  args: { commentId: v.id("comments"), bodyMd: v.string() },
  handler: async (ctx, { commentId, bodyMd }) => {
    const user = await requireUser(ctx);
    const comment = await ctx.db.get(commentId);
    if (!comment) throw new Error("Komentar tidak ditemukan");
    if (comment.userId !== user._id) {
      throw new Error("Hanya penulis yang bisa mengedit");
    }
    const body = bodyMd.trim();
    if (!body) throw new Error("Komentar tidak boleh kosong");
    await ctx.db.patch(commentId, { bodyMd: body });
    return commentId;
  },
});

// Hapus komentar — penulis sendiri atau admin (moderasi). Cascade balasan bila root.
export const remove = mutation({
  args: { commentId: v.id("comments") },
  handler: async (ctx, { commentId }) => {
    const user = await requireUser(ctx);
    const comment = await ctx.db.get(commentId);
    if (!comment) return { deleted: false };

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();
    const admin = profile?.role === "admin";
    if (comment.userId !== user._id && !admin) {
      throw new Error("Tidak berhak menghapus komentar ini");
    }

    const replies = await ctx.db
      .query("comments")
      .withIndex("by_parent", (q) => q.eq("parentId", commentId))
      .collect();
    for (const r of replies) await ctx.db.delete(r._id);
    await ctx.db.delete(commentId);
    return { deleted: true };
  },
});
