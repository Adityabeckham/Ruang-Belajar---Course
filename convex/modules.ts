import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { requireAdmin } from "./lib/authz";

// ── Queries ───────────────────────────────────────────────────────────

export const listByCourse = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, { courseId }) => {
    const modules = await ctx.db
      .query("modules")
      .withIndex("by_course", (q) => q.eq("courseId", courseId))
      .collect();
    return modules.sort((a, b) => a.order - b.order);
  },
});

// ── Mutations (admin-only) ────────────────────────────────────────────

export const create = mutation({
  args: {
    courseId: v.id("courses"),
    title: v.string(),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const course = await ctx.db.get(args.courseId);
    if (!course) throw new Error("Course tidak ditemukan");

    const siblings = await ctx.db
      .query("modules")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();
    return await ctx.db.insert("modules", {
      courseId: args.courseId,
      title: args.title,
      order: args.order ?? siblings.length,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("modules"),
    title: v.optional(v.string()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, { id, ...patch }) => {
    await requireAdmin(ctx);
    const clean = Object.fromEntries(
      Object.entries(patch).filter(([, val]) => val !== undefined),
    );
    await ctx.db.patch(id, clean);
    return id;
  },
});

// Hapus module + lessons di dalamnya (beserta exercises) demi integritas.
export const remove = mutation({
  args: { id: v.id("modules") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    await cascadeDeleteModule(ctx, id);
    return { deleted: id };
  },
});

export async function cascadeDeleteModule(
  ctx: MutationCtx,
  moduleId: Id<"modules">,
) {
  const lessons = await ctx.db
    .query("lessons")
    .withIndex("by_module", (q) => q.eq("moduleId", moduleId))
    .collect();
  for (const lesson of lessons) {
    const exercises = await ctx.db
      .query("exercises")
      .withIndex("by_lesson", (q) => q.eq("lessonId", lesson._id))
      .collect();
    for (const ex of exercises) await ctx.db.delete(ex._id);

    const lessonProg = await ctx.db
      .query("lessonProgress")
      .filter((q) => q.eq(q.field("lessonId"), lesson._id))
      .collect();
    for (const p of lessonProg) await ctx.db.delete(p._id);

    await ctx.db.delete(lesson._id);
  }
  await ctx.db.delete(moduleId);
}
