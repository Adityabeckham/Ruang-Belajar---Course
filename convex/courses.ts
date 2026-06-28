import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { requireAdmin, isAdmin } from "./lib/authz";

const levelValidator = v.union(
  v.literal("beginner"),
  v.literal("intermediate"),
  v.literal("advanced"),
);

// ── Queries ───────────────────────────────────────────────────────────

// Katalog publik: hanya course published, terurut.
export const listPublished = query({
  args: {},
  handler: async (ctx) => {
    const courses = await ctx.db
      .query("courses")
      .withIndex("by_published", (q) => q.eq("published", true))
      .collect();
    return courses.sort((a, b) => a.order - b.order);
  },
});

// Semua course (admin) untuk halaman kelola.
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const courses = await ctx.db.query("courses").collect();
    return courses.sort((a, b) => a.order - b.order);
  },
});

// Detail course + outline (modules → lessons). Course unpublished hanya untuk admin.
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const course = await ctx.db
      .query("courses")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (!course) return null;
    if (!course.published && !(await isAdmin(ctx))) return null;

    const modules = (
      await ctx.db
        .query("modules")
        .withIndex("by_course", (q) => q.eq("courseId", course._id))
        .collect()
    ).sort((a, b) => a.order - b.order);

    const outline = await Promise.all(
      modules.map(async (m) => {
        const lessons = (
          await ctx.db
            .query("lessons")
            .withIndex("by_module", (q) => q.eq("moduleId", m._id))
            .collect()
        ).sort((a, b) => a.order - b.order);
        return { ...m, lessons };
      }),
    );

    return { ...course, modules: outline };
  },
});

export const getById = query({
  args: { id: v.id("courses") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    return await ctx.db.get(id);
  },
});

// ── Mutations (admin-only) ────────────────────────────────────────────

export const create = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    description: v.string(),
    coverImage: v.optional(v.string()),
    level: levelValidator,
    tags: v.optional(v.array(v.string())),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);

    const existing = await ctx.db
      .query("courses")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (existing) throw new Error(`Slug "${args.slug}" sudah dipakai`);

    const count = (await ctx.db.query("courses").collect()).length;
    return await ctx.db.insert("courses", {
      title: args.title,
      slug: args.slug,
      description: args.description,
      coverImage: args.coverImage,
      level: args.level,
      tags: args.tags ?? [],
      published: false,
      order: args.order ?? count,
      createdBy: admin._id,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("courses"),
    title: v.optional(v.string()),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    level: v.optional(levelValidator),
    tags: v.optional(v.array(v.string())),
    order: v.optional(v.number()),
  },
  handler: async (ctx, { id, ...patch }) => {
    await requireAdmin(ctx);
    const course = await ctx.db.get(id);
    if (!course) throw new Error("Course tidak ditemukan");

    // Cek unik slug bila diubah.
    if (patch.slug && patch.slug !== course.slug) {
      const dup = await ctx.db
        .query("courses")
        .withIndex("by_slug", (q) => q.eq("slug", patch.slug!))
        .unique();
      if (dup) throw new Error(`Slug "${patch.slug}" sudah dipakai`);
    }

    // Buang key undefined supaya tak menimpa dengan undefined.
    const clean = Object.fromEntries(
      Object.entries(patch).filter(([, val]) => val !== undefined),
    );
    await ctx.db.patch(id, clean);
    return id;
  },
});

export const setPublished = mutation({
  args: { id: v.id("courses"), published: v.boolean() },
  handler: async (ctx, { id, published }) => {
    await requireAdmin(ctx);
    await ctx.db.patch(id, { published });
    return id;
  },
});

// Hapus course + seluruh turunannya (cascade) supaya tak ada orphan.
export const remove = mutation({
  args: { id: v.id("courses") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    await cascadeDeleteCourse(ctx, id);
    return { deleted: id };
  },
});

// Dipakai courses.remove. Menyentuh tabel lintas-domain demi integritas data.
async function cascadeDeleteCourse(ctx: MutationCtx, courseId: Id<"courses">) {
  const lessons = await ctx.db
    .query("lessons")
    .withIndex("by_course", (q) => q.eq("courseId", courseId))
    .collect();
  for (const lesson of lessons) {
    const exercises = await ctx.db
      .query("exercises")
      .withIndex("by_lesson", (q) => q.eq("lessonId", lesson._id))
      .collect();
    for (const ex of exercises) await ctx.db.delete(ex._id);
    await ctx.db.delete(lesson._id);
  }

  const modules = await ctx.db
    .query("modules")
    .withIndex("by_course", (q) => q.eq("courseId", courseId))
    .collect();
  for (const m of modules) await ctx.db.delete(m._id);

  // Progress & enrollment lintas-user: index butuh userId, jadi pakai filter penuh
  // (skala MVP kecil; bisa dioptimasi bila data membesar).
  const allProgress = await ctx.db
    .query("lessonProgress")
    .filter((q) => q.eq(q.field("courseId"), courseId))
    .collect();
  for (const p of allProgress) await ctx.db.delete(p._id);

  const enrollments = await ctx.db
    .query("enrollments")
    .filter((q) => q.eq(q.field("courseId"), courseId))
    .collect();
  for (const e of enrollments) await ctx.db.delete(e._id);

  await ctx.db.delete(courseId);
}
