import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireUser, getCurrentUser, requireAdmin } from "./lib/authz";
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

// Submit kode (HTML/CSS/JS) → menunggu review admin (B4). Eksekusi/preview
// hanya di client dalam <iframe sandbox> (PRD §10); server cuma menyimpan.
export const submitCode = mutation({
  args: {
    exerciseId: v.id("exercises"),
    code: v.object({ html: v.string(), css: v.string(), js: v.string() }),
  },
  handler: async (ctx, { exerciseId, code }) => {
    const user = await requireUser(ctx);
    const ex = await ctx.db.get(exerciseId);
    if (!ex || ex.type !== "code") throw new Error("Latihan bukan tipe code");

    return await ctx.db.insert("submissions", {
      userId: user._id,
      exerciseId,
      type: "code",
      code,
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

// ── Review queue admin (Task B4) ──────────────────────────────────────

// Submission yang menunggu review (link/teks pending), di-enrich exercise + user.
export const listPending = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const pending = await ctx.db
      .query("submissions")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
    pending.sort((a, b) => a.submittedAt - b.submittedAt);

    return await Promise.all(
      pending.map(async (s) => {
        const ex = await ctx.db.get(s.exerciseId);
        const user = await ctx.db.get(s.userId);
        const profile = user
          ? await ctx.db
              .query("profiles")
              .withIndex("by_user", (q) => q.eq("userId", user._id))
              .unique()
          : null;
        return {
          _id: s._id,
          type: s.type,
          link: s.link ?? null,
          text: s.text ?? null,
          submittedAt: s.submittedAt,
          exerciseTitle: ex?.title ?? "(latihan terhapus)",
          exerciseXp: ex?.xpReward ?? 0,
          studentName: profile?.displayName ?? user?.name ?? "Pengguna",
        };
      }),
    );
  },
});

// Review submission: set status + skor + feedback. XP saat di-pass (idempoten).
export const review = mutation({
  args: {
    submissionId: v.id("submissions"),
    status: v.union(
      v.literal("passed"),
      v.literal("failed"),
      v.literal("reviewed"),
    ),
    score: v.optional(v.number()),
    feedbackMd: v.optional(v.string()),
  },
  handler: async (ctx, { submissionId, status, score, feedbackMd }) => {
    const admin = await requireAdmin(ctx);
    const sub = await ctx.db.get(submissionId);
    if (!sub) throw new Error("Submission tidak ditemukan");

    await ctx.db.patch(submissionId, {
      status,
      score,
      feedbackMd,
      reviewedBy: admin._id,
      reviewedAt: Date.now(),
    });

    if (status === "passed") {
      const ex = await ctx.db.get(sub.exerciseId);
      await awardXp(ctx, {
        userId: sub.userId,
        amount: ex?.xpReward ?? 0,
        reason: "submission_passed",
        refId: `submission_passed:${submissionId}`,
      });
    }

    return { ok: true };
  },
});
