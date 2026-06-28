import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireUser, getCurrentUser } from "./lib/authz";
import { awardXp } from "./gamification";

// Tandai lesson selesai → tulis lessonProgress + emit XP (Seam 1). Idempoten:
// unik per (user, lesson) supaya XP tak dobel (PRD §10).
export const markLessonComplete = mutation({
  args: { lessonId: v.id("lessons") },
  handler: async (ctx, { lessonId }) => {
    const user = await requireUser(ctx);

    const lesson = await ctx.db.get(lessonId);
    if (!lesson) throw new Error("Lesson tidak ditemukan");

    // Harus enrolled di course lesson ini.
    const enrollment = await ctx.db
      .query("enrollments")
      .withIndex("by_user_course", (q) =>
        q.eq("userId", user._id).eq("courseId", lesson.courseId),
      )
      .unique();
    if (!enrollment) throw new Error("Belum enroll di course ini");

    const existing = await ctx.db
      .query("lessonProgress")
      .withIndex("by_user_lesson", (q) =>
        q.eq("userId", user._id).eq("lessonId", lessonId),
      )
      .unique();
    if (existing) return { alreadyComplete: true, xpAwarded: 0 };

    await ctx.db.insert("lessonProgress", {
      userId: user._id,
      lessonId,
      courseId: lesson.courseId,
      completedAt: Date.now(),
    });

    // Seam 1 — tambah XP (stub no-op sampai C1 mengimplementasi ledger).
    await awardXp(ctx, {
      userId: user._id,
      amount: lesson.xpReward,
      reason: "lesson_complete",
      refId: `lesson_complete:${lessonId}`,
    });

    return { alreadyComplete: false, xpAwarded: lesson.xpReward };
  },
});

// Apakah lesson sudah diselesaikan user login? (false bila belum login)
export const isLessonComplete = query({
  args: { lessonId: v.id("lessons") },
  handler: async (ctx, { lessonId }) => {
    const user = await getCurrentUser(ctx);
    if (!user) return false;
    const p = await ctx.db
      .query("lessonProgress")
      .withIndex("by_user_lesson", (q) =>
        q.eq("userId", user._id).eq("lessonId", lessonId),
      )
      .unique();
    return p !== null;
  },
});

// Rollup progres course: total lesson, jumlah selesai, persen, id lesson selesai.
export const getCourseProgress = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, { courseId }) => {
    const lessons = await ctx.db
      .query("lessons")
      .withIndex("by_course", (q) => q.eq("courseId", courseId))
      .collect();
    const total = lessons.length;

    const user = await getCurrentUser(ctx);
    if (!user) {
      return { total, completed: 0, percent: 0, completedLessonIds: [] };
    }

    const progress = await ctx.db
      .query("lessonProgress")
      .withIndex("by_user_course", (q) =>
        q.eq("userId", user._id).eq("courseId", courseId),
      )
      .collect();
    const completedIds = progress.map((p) => p.lessonId);
    const completedSet = new Set(completedIds);
    const completed = lessons.filter((l) => completedSet.has(l._id)).length;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    return { total, completed, percent, completedLessonIds: completedIds };
  },
});
