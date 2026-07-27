import { query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { getCurrentUser } from "./lib/authz";

// ── Kurva Level (PRD §8) ──────────────────────────────────────────────
// XP kumulatif untuk MENCAPAI suatu level. Nilai sesuai PRD:
//   L1=0, L2=100, L3=300, L4=600, L5=1000, ...  → levelXp(L) = 50*(L-1)*L
export function levelXp(level: number): number {
  return 50 * (level - 1) * level;
}

// Level dari total XP = level tertinggi yang ambangnya <= totalXp.
export function levelFromXp(totalXp: number): number {
  let level = 1;
  while (levelXp(level + 1) <= totalXp) level++;
  return level;
}

// ── Seam 1: awardXp() ─────────────────────────────────────────────────
/**
 * Satu-satunya cara menambah XP (PRD §3). Dipanggil A (lesson complete) & B
 * (quiz/submission pass). Implementasi asli (Task C1):
 *  - tulis `xpEvents` (ledger append-only, source of truth)
 *  - idempoten: `refId` sama untuk user sama tak menambah dobel
 *  - recompute `profiles.totalXp` & `profiles.level` dari ledger
 * Badge engine (cek kriteria sesudah award) = Task C2.
 */
export async function awardXp(
  ctx: MutationCtx,
  args: {
    userId: Id<"users">;
    amount: number;
    reason: string; // "lesson_complete" | "quiz_pass" | "submission_passed" | ...
    refId?: string;
  },
): Promise<void> {
  const { userId, amount, reason, refId } = args;

  // Idempotensi: kalau refId pernah dicatat untuk user ini, jangan dobel.
  if (refId) {
    const dup = await ctx.db
      .query("xpEvents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("refId"), refId))
      .first();
    if (dup) return;
  }

  await ctx.db.insert("xpEvents", {
    userId,
    amount,
    reason,
    refId,
    createdAt: Date.now(),
  });

  // Recompute dari ledger (selalu konsisten & auditable).
  const events = await ctx.db
    .query("xpEvents")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();
  const totalXp = events.reduce((sum, e) => sum + e.amount, 0);
  const level = levelFromXp(totalXp);

  const profile = await ctx.db
    .query("profiles")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .unique();
  if (profile) {
    await ctx.db.patch(profile._id, { totalXp, level });
  }

  // Seam: cek & award badge sesudah XP berubah (Task C2).
  await checkAndAwardBadges(ctx, userId);
}

// ── Badge engine (Task C2) ────────────────────────────────────────────
// Kriteria per-key (logic di code, deskripsi human-readable di tabel badges).
async function criteriaMet(
  ctx: MutationCtx,
  userId: Id<"users">,
  key: string,
): Promise<boolean> {
  switch (key) {
    case "first_lesson": {
      const p = await ctx.db
        .query("lessonProgress")
        .withIndex("by_user_lesson", (q) => q.eq("userId", userId))
        .first();
      return p !== null;
    }
    case "first_submission": {
      const s = await ctx.db
        .query("submissions")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .first();
      return s !== null;
    }
    case "html_master": {
      const courses = (await ctx.db.query("courses").collect()).filter(
        (c) => c.published && c.tags.includes("html"),
      );
      for (const course of courses) {
        const lessons = await ctx.db
          .query("lessons")
          .withIndex("by_course", (q) => q.eq("courseId", course._id))
          .collect();
        if (lessons.length === 0) continue;
        const progress = await ctx.db
          .query("lessonProgress")
          .withIndex("by_user_course", (q) =>
            q.eq("userId", userId).eq("courseId", course._id),
          )
          .collect();
        const done = new Set(progress.map((p) => p.lessonId));
        if (lessons.every((l) => done.has(l._id))) return true;
      }
      return false;
    }
    default:
      return false;
  }
}

/**
 * Cek semua badge untuk user; award yang kriterianya terpenuhi & belum dimiliki.
 * Dipanggil sesudah awardXp; bisa juga dipanggil mutation lain (mis. submission).
 * Mengembalikan key badge yang baru di-award.
 */
export async function checkAndAwardBadges(
  ctx: MutationCtx,
  userId: Id<"users">,
): Promise<string[]> {
  const badges = await ctx.db.query("badges").collect();
  const awarded: string[] = [];
  for (const badge of badges) {
    const existing = await ctx.db
      .query("userBadges")
      .withIndex("by_user_badge", (q) =>
        q.eq("userId", userId).eq("badgeId", badge._id),
      )
      .unique();
    if (existing) continue;
    if (await criteriaMet(ctx, userId, badge.key)) {
      await ctx.db.insert("userBadges", {
        userId,
        badgeId: badge._id,
        awardedAt: Date.now(),
      });
      awarded.push(badge.key);
    }
  }
  return awarded;
}

// ── Query untuk UI (XPBar dll) ────────────────────────────────────────
export const getMyGamification = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();
    if (!profile) return null;

    const { totalXp, level } = profile;
    const base = levelXp(level);
    const next = levelXp(level + 1);

    // ── Daily Streak Calculation ─────────────────────────────────────
    // Ambil semua lessonProgress → hitung hari berturut-turut hingga hari ini.
    const progresses = await ctx.db
      .query("lessonProgress")
      .withIndex("by_user_lesson", (q) => q.eq("userId", user._id))
      .collect();

    // Normalisasi ke set tanggal unik "YYYY-MM-DD" (timezone UTC).
    const daySet = new Set<string>();
    for (const p of progresses) {
      const d = new Date(p.completedAt);
      daySet.add(`${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`);
    }

    // Hitung streak mundur dari hari ini.
    let streak = 0;
    const todayUTC = new Date();
    for (let i = 0; i <= 365; i++) {
      const d = new Date(todayUTC);
      d.setUTCDate(d.getUTCDate() - i);
      const key = `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`;
      if (daySet.has(key)) {
        streak++;
      } else if (i > 0) {
        // Gap hari tanpa belajar → streak berhenti (kecuali hari ini belum ada lesson)
        break;
      }
    }

    return {
      totalXp,
      level,
      xpIntoLevel: totalXp - base,   // value untuk XPBar
      xpForNextLevel: next - base,    // max untuk XPBar
      dailyStreak: streak,            // hari berturut-turut belajar
    };
  },
});

// Semua badge + status earned untuk user login (BadgeShelf, Task C3).
export const getMyBadges = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    const badges = await ctx.db.query("badges").collect();

    const earned = new Map<string, number>();
    if (user) {
      const ubs = await ctx.db
        .query("userBadges")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .collect();
      for (const ub of ubs) earned.set(ub.badgeId, ub.awardedAt);
    }

    return badges.map((b) => ({
      key: b.key,
      title: b.title,
      description: b.description,
      icon: b.icon,
      earned: earned.has(b._id),
      awardedAt: earned.get(b._id) ?? null,
    }));
  },
});

// ── Leaderboard Top 10 Member (XP tertinggi) ─────────────────────────
// Semua data yang dibutuhkan (displayName, avatarUrl, XP, level) sudah
// ada di tabel `profiles` — tidak perlu join ke `users` untuk tampilan UI.
export const getLeaderboard = query({
  args: {},
  handler: async (ctx) => {
    const profiles = await ctx.db.query("profiles").collect();
    profiles.sort((a, b) => b.totalXp - a.totalXp);

    return profiles.slice(0, 10).map((p, i) => ({
      rank: i + 1,
      displayName: p.displayName,
      avatarUrl: p.avatarUrl ?? null,
      totalXp: p.totalXp,
      level: p.level,
    }));
  },
});
