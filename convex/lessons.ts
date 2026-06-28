import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { requireAdmin, isAdmin } from "./lib/authz";
import { parseLessonMarkdown, slugify } from "./lib/lessonMarkdown";

const DEFAULT_LESSON_XP = 20; // PRD §8

// ── Queries ───────────────────────────────────────────────────────────

export const listByModule = query({
  args: { moduleId: v.id("modules") },
  handler: async (ctx, { moduleId }) => {
    const lessons = await ctx.db
      .query("lessons")
      .withIndex("by_module", (q) => q.eq("moduleId", moduleId))
      .collect();
    return lessons.sort((a, b) => a.order - b.order);
  },
});

export const listByCourse = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, { courseId }) => {
    const lessons = await ctx.db
      .query("lessons")
      .withIndex("by_course", (q) => q.eq("courseId", courseId))
      .collect();
    return lessons.sort((a, b) => a.order - b.order);
  },
});

// Resolusi lesson dari (courseSlug, lessonSlug) untuk route /learn/:courseSlug/:lessonSlug.
// lessons tak punya index slug → cari via by_course lalu filter slug (jumlah lesson/course kecil).
export const getBySlug = query({
  args: { courseSlug: v.string(), lessonSlug: v.string() },
  handler: async (ctx, { courseSlug, lessonSlug }) => {
    const course = await ctx.db
      .query("courses")
      .withIndex("by_slug", (q) => q.eq("slug", courseSlug))
      .unique();
    if (!course) return null;
    if (!course.published && !(await isAdmin(ctx))) return null;

    const lessons = await ctx.db
      .query("lessons")
      .withIndex("by_course", (q) => q.eq("courseId", course._id))
      .collect();
    const lesson = lessons.find((l) => l.slug === lessonSlug);
    if (!lesson) return null;

    return { ...lesson, course };
  },
});

// ── Mutations (admin-only) ────────────────────────────────────────────

export const create = mutation({
  args: {
    moduleId: v.id("modules"),
    title: v.string(),
    slug: v.string(),
    contentMd: v.optional(v.string()),
    order: v.optional(v.number()),
    xpReward: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    // courseId diturunkan dari module (jangan percaya argumen client).
    const module = await ctx.db.get(args.moduleId);
    if (!module) throw new Error("Module tidak ditemukan");
    const courseId = module.courseId;

    // Slug unik dalam scope course.
    const inCourse = await ctx.db
      .query("lessons")
      .withIndex("by_course", (q) => q.eq("courseId", courseId))
      .collect();
    if (inCourse.some((l) => l.slug === args.slug)) {
      throw new Error(`Slug "${args.slug}" sudah dipakai di course ini`);
    }

    const siblings = await ctx.db
      .query("lessons")
      .withIndex("by_module", (q) => q.eq("moduleId", args.moduleId))
      .collect();

    return await ctx.db.insert("lessons", {
      moduleId: args.moduleId,
      courseId,
      title: args.title,
      slug: args.slug,
      contentMd: args.contentMd ?? "",
      order: args.order ?? siblings.length,
      xpReward: args.xpReward ?? DEFAULT_LESSON_XP,
    });
  },
});

// Authoring: bikin lesson dari Markdown mentah (frontmatter + body) — Task A2.
// title/slug/xpReward dari frontmatter (slug fallback = slugify(title)).
export const createFromMarkdown = mutation({
  args: {
    moduleId: v.id("modules"),
    raw: v.string(),
    // Override opsional bila frontmatter tak lengkap (dari form editor).
    title: v.optional(v.string()),
    slug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const module = await ctx.db.get(args.moduleId);
    if (!module) throw new Error("Module tidak ditemukan");
    const courseId = module.courseId;

    const { data, contentMd } = parseLessonMarkdown(args.raw);
    const title = args.title ?? data.title;
    if (!title) throw new Error("Judul wajib (lewat frontmatter `title:` atau form)");
    const slug =
      args.slug ?? (typeof data.slug === "string" ? data.slug : slugify(title));
    if (!slug) throw new Error("Slug tidak valid");

    const inCourse = await ctx.db
      .query("lessons")
      .withIndex("by_course", (q) => q.eq("courseId", courseId))
      .collect();
    if (inCourse.some((l) => l.slug === slug)) {
      throw new Error(`Slug "${slug}" sudah dipakai di course ini`);
    }

    const siblings = await ctx.db
      .query("lessons")
      .withIndex("by_module", (q) => q.eq("moduleId", args.moduleId))
      .collect();

    return await ctx.db.insert("lessons", {
      moduleId: args.moduleId,
      courseId,
      title,
      slug,
      contentMd,
      order: siblings.length,
      xpReward:
        typeof data.xpReward === "number" ? data.xpReward : DEFAULT_LESSON_XP,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("lessons"),
    title: v.optional(v.string()),
    slug: v.optional(v.string()),
    contentMd: v.optional(v.string()),
    order: v.optional(v.number()),
    xpReward: v.optional(v.number()),
  },
  handler: async (ctx, { id, ...patch }) => {
    await requireAdmin(ctx);
    const lesson = await ctx.db.get(id);
    if (!lesson) throw new Error("Lesson tidak ditemukan");

    if (patch.slug && patch.slug !== lesson.slug) {
      const inCourse = await ctx.db
        .query("lessons")
        .withIndex("by_course", (q) => q.eq("courseId", lesson.courseId))
        .collect();
      if (inCourse.some((l) => l.slug === patch.slug && l._id !== id)) {
        throw new Error(`Slug "${patch.slug}" sudah dipakai di course ini`);
      }
    }

    const clean = Object.fromEntries(
      Object.entries(patch).filter(([, val]) => val !== undefined),
    );
    await ctx.db.patch(id, clean);
    return id;
  },
});

// Hapus lesson + exercises + lessonProgress terkait.
export const remove = mutation({
  args: { id: v.id("lessons") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    await cascadeDeleteLesson(ctx, id);
    return { deleted: id };
  },
});

export async function cascadeDeleteLesson(
  ctx: MutationCtx,
  lessonId: Id<"lessons">,
) {
  const exercises = await ctx.db
    .query("exercises")
    .withIndex("by_lesson", (q) => q.eq("lessonId", lessonId))
    .collect();
  for (const ex of exercises) await ctx.db.delete(ex._id);

  const progress = await ctx.db
    .query("lessonProgress")
    .filter((q) => q.eq(q.field("lessonId"), lessonId))
    .collect();
  for (const p of progress) await ctx.db.delete(p._id);

  await ctx.db.delete(lessonId);
}
