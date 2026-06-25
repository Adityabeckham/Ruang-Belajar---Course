/**
 * Convex Schema — Ruang Belajar LMS
 *
 * Definisi seluruh tabel database untuk platform LMS.
 * Referensi: docs/PRD.md §5 (Model Data)
 *
 * Konvensi:
 *  - Hierarki konten: Course → Module → Lesson
 *  - Latihan & diskusi menempel di level Lesson
 *  - XP disimpan sebagai ledger append-only (`xpEvents`), bukan counter tunggal
 *  - Level = turunan dari total XP (kurva kuadratik, lihat PRD §8)
 *  - `profiles.totalXp` & `profiles.level` adalah denormalized cache yang
 *    bisa dihitung ulang dari `xpEvents` kapan saja
 *
 * Ownership (per IMPLEMENTATION-PLAN.md §2):
 *  - File ini dimiliki oleh Dev C (single-owner, additive changes only)
 *  - Perubahan schema dari Dev A/B harus diminta melalui Dev C
 *
 * @module
 */

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// ─────────────────────────────────────────────────────────────
// Auth tables placeholder
// ─────────────────────────────────────────────────────────────
//
// Convex Auth (`@convex-dev/auth`) menyediakan tabel `users`,
// `authAccounts`, `authSessions`, dll. via spread `...authTables`.
//
// Saat Task 0.3 menginstal `@convex-dev/auth`, baris berikut
// perlu di-uncomment dan import ditambahkan:
//
//   import { authTables } from "@convex-dev/auth/server";
//   ...authTables,
//
// Untuk sekarang kita definisikan tabel `users` secara manual
// agar schema valid dan bisa dipakai oleh `exercises.ts` dkk
// tanpa harus menginstal dependency auth terlebih dahulu.
// ─────────────────────────────────────────────────────────────

export default defineSchema({
  // ┌──────────────────────────────────────────────────────────
  // │ USERS (placeholder — akan diganti `...authTables` di Task 0.3)
  // └──────────────────────────────────────────────────────────
  users: defineTable({
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    image: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
  }),

  // ┌──────────────────────────────────────────────────────────
  // │ PROFILES — Profil pengguna + role + rollup gamifikasi
  // │ Denormalized XP/level di sini bisa dihitung ulang dari xpEvents
  // └──────────────────────────────────────────────────────────
  profiles: defineTable({
    userId: v.id("users"),
    role: v.union(v.literal("admin"), v.literal("student")),
    displayName: v.string(),
    avatarUrl: v.optional(v.string()),
    totalXp: v.number(), // Denormalized, recomputable dari xpEvents
    level: v.number(), // Derived dari totalXp (kurva PRD §8)
  }).index("by_user", ["userId"]),

  // ┌──────────────────────────────────────────────────────────
  // │ COURSES — Kursus tingkat atas
  // │ Hierarki: Course → Module → Lesson
  // └──────────────────────────────────────────────────────────
  courses: defineTable({
    title: v.string(),
    slug: v.string(), // URL-friendly identifier, harus unik
    description: v.string(),
    coverImage: v.optional(v.string()), // URL atau Convex storage ID
    level: v.union(
      v.literal("beginner"),
      v.literal("intermediate"),
      v.literal("advanced"),
    ),
    tags: v.array(v.string()), // e.g. ["html", "css", "js"]
    published: v.boolean(), // Hanya course published yang tampil di katalog
    order: v.number(), // Urutan tampil di katalog
    createdBy: v.id("users"),
  })
    .index("by_slug", ["slug"])
    .index("by_published", ["published"]),

  // ┌──────────────────────────────────────────────────────────
  // │ MODULES — Sub-bagian dalam Course
  // └──────────────────────────────────────────────────────────
  modules: defineTable({
    courseId: v.id("courses"),
    title: v.string(),
    order: v.number(), // Urutan tampil dalam course
  }).index("by_course", ["courseId"]),

  // ┌──────────────────────────────────────────────────────────
  // │ LESSONS — Unit belajar terkecil
  // │ courseId di-denormalize untuk mempercepat rollup progress
  // └──────────────────────────────────────────────────────────
  lessons: defineTable({
    moduleId: v.id("modules"),
    courseId: v.id("courses"), // Denormalized → rollup progres cepat
    title: v.string(),
    slug: v.string(), // URL-friendly, unik dalam scope course
    contentMd: v.string(), // Materi lesson dalam Markdown
    order: v.number(), // Urutan tampil dalam module
    xpReward: v.number(), // XP yang diberikan saat lesson selesai
  })
    .index("by_module", ["moduleId"])
    .index("by_course", ["courseId"]),

  // ┌──────────────────────────────────────────────────────────
  // │ ENROLLMENTS — Relasi siswa ↔ course
  // └──────────────────────────────────────────────────────────
  enrollments: defineTable({
    userId: v.id("users"),
    courseId: v.id("courses"),
    enrolledAt: v.number(), // Unix timestamp (ms)
  })
    .index("by_user", ["userId"])
    .index("by_user_course", ["userId", "courseId"]),

  // ┌──────────────────────────────────────────────────────────
  // │ LESSON PROGRESS — Unit atomik progress tracking
  // │ Di-rollup jadi persentase per module & per course
  // └──────────────────────────────────────────────────────────
  lessonProgress: defineTable({
    userId: v.id("users"),
    lessonId: v.id("lessons"),
    courseId: v.id("courses"), // Denormalized → query progress per course cepat
    completedAt: v.number(), // Unix timestamp (ms)
  })
    .index("by_user_lesson", ["userId", "lessonId"])
    .index("by_user_course", ["userId", "courseId"]),

  // ┌──────────────────────────────────────────────────────────
  // │ EXERCISES — Definisi latihan (polymorphic by `type`)
  // │ Empat tipe: quiz, code, link, text
  // │ ⚠️ quiz.questions[].correctIndex TIDAK BOLEH bocor ke client
  // └──────────────────────────────────────────────────────────
  exercises: defineTable({
    lessonId: v.id("lessons"),
    courseId: v.id("courses"), // Denormalized
    title: v.string(),
    type: v.union(
      v.literal("quiz"),
      v.literal("code"),
      v.literal("link"),
      v.literal("text"),
    ),
    promptMd: v.string(), // Instruksi soal dalam Markdown
    xpReward: v.number(),
    // Khusus quiz: kunci jawaban disimpan server-side
    quiz: v.optional(
      v.object({
        questions: v.array(
          v.object({
            id: v.string(),
            questionMd: v.string(),
            options: v.array(v.string()),
            correctIndex: v.number(), // ⚠️ JANGAN leak ke client
          }),
        ),
        passScore: v.number(), // Persentase minimum lulus (e.g. 80)
      }),
    ),
    // Khusus code: starter template files
    starter: v.optional(
      v.object({
        html: v.string(),
        css: v.string(),
        js: v.string(),
      }),
    ),
  }).index("by_lesson", ["lessonId"]),

  // ┌──────────────────────────────────────────────────────────
  // │ SUBMISSIONS — Jawaban siswa (satu model untuk 4 tipe)
  // │ Payload bervariasi tergantung tipe latihan
  // └──────────────────────────────────────────────────────────
  submissions: defineTable({
    userId: v.id("users"),
    exerciseId: v.id("exercises"),
    type: v.union(
      v.literal("quiz"),
      v.literal("code"),
      v.literal("link"),
      v.literal("text"),
    ),
    // Payload per tipe (hanya salah satu yang terisi):
    quizAnswers: v.optional(v.array(v.number())), // Index pilihan per soal
    code: v.optional(
      v.object({
        html: v.string(),
        css: v.string(),
        js: v.string(),
      }),
    ),
    link: v.optional(v.string()), // URL GitHub/CodePen
    text: v.optional(v.string()), // Jawaban teks/markdown
    // Status review:
    status: v.union(
      v.literal("pending"),
      v.literal("reviewed"),
      v.literal("passed"),
      v.literal("failed"),
    ),
    score: v.optional(v.number()), // Nilai 0-100
    feedbackMd: v.optional(v.string()), // Feedback dari reviewer (Markdown)
    reviewedBy: v.optional(v.id("users")), // Admin yang mereview
    submittedAt: v.number(), // Unix timestamp (ms)
    reviewedAt: v.optional(v.number()), // Unix timestamp (ms)
  })
    .index("by_user", ["userId"])
    .index("by_exercise", ["exerciseId"])
    .index("by_status", ["status"]), // → review queue admin

  // ┌──────────────────────────────────────────────────────────
  // │ COMMENTS — Diskusi per lesson (threaded, 1 level reply)
  // │ Body dalam Markdown, wajib di-sanitize saat render
  // └──────────────────────────────────────────────────────────
  comments: defineTable({
    lessonId: v.id("lessons"),
    userId: v.id("users"),
    bodyMd: v.string(), // Konten komentar dalam Markdown
    parentId: v.optional(v.id("comments")), // null = root, ada = reply
    createdAt: v.number(), // Unix timestamp (ms)
  })
    .index("by_lesson", ["lessonId"])
    .index("by_parent", ["parentId"]),

  // ┌──────────────────────────────────────────────────────────
  // │ XP EVENTS — Ledger append-only untuk audit trail XP
  // │ Total XP selalu bisa dihitung ulang dari tabel ini
  // │ Reason examples: "lesson_complete", "quiz_pass",
  // │   "submission_reviewed", "submission_passed"
  // └──────────────────────────────────────────────────────────
  xpEvents: defineTable({
    userId: v.id("users"),
    amount: v.number(), // Jumlah XP yang ditambahkan
    reason: v.string(), // Alasan pemberian XP
    refId: v.optional(v.string()), // Reference ID untuk idempotensi
    createdAt: v.number(), // Unix timestamp (ms)
  }).index("by_user", ["userId"]),

  // ┌──────────────────────────────────────────────────────────
  // │ BADGES — Definisi badge/achievement yang tersedia
  // └──────────────────────────────────────────────────────────
  badges: defineTable({
    key: v.string(), // Unique key, e.g. "html_master", "first_submission"
    title: v.string(), // Display name
    description: v.string(), // Penjelasan cara mendapatkan badge
    icon: v.string(), // Emoji atau URL ikon
    criteria: v.string(), // Deskripsi human-readable; logic award di code
  }).index("by_key", ["key"]),

  // ┌──────────────────────────────────────────────────────────
  // │ USER BADGES — Relasi badge yang sudah diraih user
  // └──────────────────────────────────────────────────────────
  userBadges: defineTable({
    userId: v.id("users"),
    badgeId: v.id("badges"),
    awardedAt: v.number(), // Unix timestamp (ms)
  })
    .index("by_user", ["userId"])
    .index("by_user_badge", ["userId", "badgeId"]),
});
