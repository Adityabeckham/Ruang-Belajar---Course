import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { parseQuizMarkdown } from "./lib/quizMarkdown";
import { requireAdmin } from "./lib/authz";

// Get exercises for a specific lesson
export const listByLesson = query({
  args: { lessonId: v.id("lessons") },
  handler: async (ctx, args) => {
    // Definisi latihan boleh dibaca publik — kunci jawaban (correctIndex)
    // sudah di-strip di bawah. Penilaian tetap server-side (B3).
    const exercises = await ctx.db
      .query("exercises")
      .withIndex("by_lesson", (q) => q.eq("lessonId", args.lessonId))
      .collect();

    // Strip correctIndex from quiz questions before returning to client (SECURITY)
    return exercises.map((ex) => {
      if (ex.type === "quiz" && ex.quiz) {
        return {
          ...ex,
          quiz: {
            ...ex.quiz,
            questions: ex.quiz.questions.map((q) => {
              const { correctIndex, ...safeQuestion } = q;
              return safeQuestion; // Do not leak correctIndex to the client
            }),
          },
        };
      }
      return ex;
    });
  },
});

// Admin: Create a new exercise
export const create = mutation({
  args: {
    lessonId: v.id("lessons"),
    courseId: v.id("courses"),
    title: v.string(),
    type: v.union(v.literal("quiz"), v.literal("code"), v.literal("link"), v.literal("text")),
    promptMd: v.string(),
    xpReward: v.number(),
    passScore: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    let quizData = undefined;
    
    // Parse quiz if type is quiz
    if (args.type === "quiz") {
      const parsedQuiz = parseQuizMarkdown(args.promptMd);
      quizData = {
        questions: parsedQuiz.questions,
        passScore: args.passScore || 80,
      };
    }

    const exerciseId = await ctx.db.insert("exercises", {
      lessonId: args.lessonId,
      courseId: args.courseId,
      title: args.title,
      type: args.type,
      promptMd: args.promptMd,
      xpReward: args.xpReward,
      quiz: quizData,
    });

    return exerciseId;
  },
});

// Admin: Update an exercise
export const update = mutation({
  args: {
    id: v.id("exercises"),
    title: v.optional(v.string()),
    promptMd: v.optional(v.string()),
    xpReward: v.optional(v.number()),
    passScore: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Exercise not found");

    const updates: any = {};
    if (args.title !== undefined) updates.title = args.title;
    if (args.xpReward !== undefined) updates.xpReward = args.xpReward;
    
    if (args.promptMd !== undefined) {
      updates.promptMd = args.promptMd;
      if (existing.type === "quiz") {
        const parsedQuiz = parseQuizMarkdown(args.promptMd);
        updates.quiz = {
          questions: parsedQuiz.questions,
          passScore: args.passScore ?? existing.quiz?.passScore ?? 80,
        };
      }
    } else if (args.passScore !== undefined && existing.type === "quiz") {
       updates.quiz = {
         ...existing.quiz,
         passScore: args.passScore
       };
    }

    await ctx.db.patch(args.id, updates);
  },
});

// Admin: Delete an exercise
export const remove = mutation({
  args: { id: v.id("exercises") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    await ctx.db.delete(args.id);
  },
});
