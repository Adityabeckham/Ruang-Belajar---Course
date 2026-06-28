import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireUser, getCurrentUser } from "./lib/authz";
import { awardXp } from "./gamification";

// Submission kuis → auto-grade SERVER-SIDE (PRD §7.1). Bandingkan jawaban dgn
// correctIndex (yang tak pernah dikirim ke client). XP saat lulus (idempoten).
export const submitQuiz = mutation({
  args: { exerciseId: v.id("exercises"), answers: v.array(v.number()) },
  handler: async (ctx, { exerciseId, answers }) => {
    const user = await requireUser(ctx);
    const ex = await ctx.db.get(exerciseId);
    if (!ex || ex.type !== "quiz" || !ex.quiz) {
      throw new Error("Latihan bukan kuis");
    }

    const questions = ex.quiz.questions;
    let correct = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correctIndex) correct++;
    });
    const score =
      questions.length === 0 ? 0 : Math.round((correct / questions.length) * 100);
    const passed = score >= ex.quiz.passScore;

    await ctx.db.insert("submissions", {
      userId: user._id,
      exerciseId,
      type: "quiz",
      quizAnswers: answers,
      status: passed ? "passed" : "failed",
      score,
      submittedAt: Date.now(),
    });

    if (passed) {
      // Idempoten via refId → lulus kuis sama tak menambah XP dobel.
      await awardXp(ctx, {
        userId: user._id,
        amount: ex.xpReward,
        reason: "quiz_pass",
        refId: `quiz_pass:${exerciseId}`,
      });
    }

    return { score, passed, total: questions.length, correct };
  },
});

// Submit link → menunggu review admin (B4).
export const submitLink = mutation({
  args: { exerciseId: v.id("exercises"), url: v.string() },
  handler: async (ctx, { exerciseId, url }) => {
    const user = await requireUser(ctx);
    const ex = await ctx.db.get(exerciseId);
    if (!ex || ex.type !== "link") throw new Error("Latihan bukan tipe link");
    if (!url.trim()) throw new Error("URL kosong");

    return await ctx.db.insert("submissions", {
      userId: user._id,
      exerciseId,
      type: "link",
      link: url.trim(),
      status: "pending",
      submittedAt: Date.now(),
    });
  },
});

// Submit jawaban teks → menunggu review admin (B4).
export const submitText = mutation({
  args: { exerciseId: v.id("exercises"), text: v.string() },
  handler: async (ctx, { exerciseId, text }) => {
    const user = await requireUser(ctx);
    const ex = await ctx.db.get(exerciseId);
    if (!ex || ex.type !== "text") throw new Error("Latihan bukan tipe teks");
    if (!text.trim()) throw new Error("Jawaban kosong");

    return await ctx.db.insert("submissions", {
      userId: user._id,
      exerciseId,
      type: "text",
      text: text.trim(),
      status: "pending",
      submittedAt: Date.now(),
    });
  },
});

// Submission terbaru milik user login untuk sebuah exercise (status di panel).
export const mySubmission = query({
  args: { exerciseId: v.id("exercises") },
  handler: async (ctx, { exerciseId }) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;
    const subs = await ctx.db
      .query("submissions")
      .withIndex("by_exercise", (q) => q.eq("exerciseId", exerciseId))
      .collect();
    const mine = subs
      .filter((s) => s.userId === user._id)
      .sort((a, b) => b.submittedAt - a.submittedAt);
    const latest = mine[0];
    if (!latest) return null;
    return {
      status: latest.status,
      score: latest.score ?? null,
      feedbackMd: latest.feedbackMd ?? null,
      submittedAt: latest.submittedAt,
    };
  },
});
