import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

/**
 * Seam 1 — `awardXp()`: satu-satunya cara menambah XP (PRD §3, plan §3).
 * Dev A & B MEMANGGIL; Dev C MEMILIKI logikanya.
 *
 * FASE 0: versi STUB no-op. Implementasi asli (tulis `xpEvents` ledger +
 * idempotensi via `refId` + recompute level di `profiles` + cek badge)
 * dikerjakan di Task C1.
 */
export async function awardXp(
  _ctx: MutationCtx,
  _args: {
    userId: Id<"users">;
    amount: number;
    reason: string; // "lesson_complete" | "quiz_pass" | "submission_passed" | ...
    refId?: string; // untuk idempotensi (cek event dgn refId sama tak dobel)
  },
): Promise<void> {
  // no-op. Sengaja belum menulis apa-apa di Fase 0.
}
