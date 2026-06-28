import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireUser, getCurrentUser } from "./lib/authz";

// Enroll ke course (idempoten). Butuh user login (PRD §10).
export const enroll = mutation({
  args: { courseId: v.id("courses") },
  handler: async (ctx, { courseId }) => {
    const user = await requireUser(ctx);

    const course = await ctx.db.get(courseId);
    if (!course || !course.published) {
      throw new Error("Course tidak tersedia");
    }

    const existing = await ctx.db
      .query("enrollments")
      .withIndex("by_user_course", (q) =>
        q.eq("userId", user._id).eq("courseId", courseId),
      )
      .unique();
    if (existing) return existing._id;

    return await ctx.db.insert("enrollments", {
      userId: user._id,
      courseId,
      enrolledAt: Date.now(),
    });
  },
});

// Apakah user login sudah enroll di course ini? (false bila belum login)
export const isEnrolled = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, { courseId }) => {
    const user = await getCurrentUser(ctx);
    if (!user) return false;
    const existing = await ctx.db
      .query("enrollments")
      .withIndex("by_user_course", (q) =>
        q.eq("userId", user._id).eq("courseId", courseId),
      )
      .unique();
    return existing !== null;
  },
});

// Daftar course yang di-enroll user login (untuk dashboard "lanjut belajar").
export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];
    const enrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const courses = await Promise.all(
      enrollments.map(async (e) => {
        const course = await ctx.db.get(e.courseId);
        return course ? { ...course, enrolledAt: e.enrolledAt } : null;
      }),
    );
    return courses.filter((c): c is NonNullable<typeof c> => c !== null);
  },
});
