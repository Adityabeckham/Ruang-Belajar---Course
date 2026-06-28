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
    return {
      totalXp,
      level,
      xpIntoLevel: totalXp - base, // value untuk XPBar
      xpForNextLevel: next - base, // max untuk XPBar
    };
  },
});
