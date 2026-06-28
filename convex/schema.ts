import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// Tulang punggung LMS (PRD §5). XP disimpan sebagai ledger append-only (`xpEvents`),
// total selalu dihitung ulang & jadi audit trail untuk trigger badge.
// Level = turunan dari total XP (PRD §8).
export default defineSchema({
  ...authTables, // users, authAccounts, authSessions, ... dari Convex Auth

  // Profil + role + rollup gamifikasi (denormalized, recomputable dari xpEvents)
  profiles: defineTable({
    userId: v.id("users"),
    role: v.union(v.literal("admin"), v.literal("student")),
    displayName: v.string(),
    avatarUrl: v.optional(v.string()),
    totalXp: v.number(),
    level: v.number(),
  }).index("by_user", ["userId"]),

  courses: defineTable({
    title: v.string(),
    slug: v.string(),
    description: v.string(),
    coverImage: v.optional(v.string()),
    level: v.union(
      v.literal("beginner"),
      v.literal("intermediate"),
      v.literal("advanced"),
    ),
    tags: v.array(v.string()), // ["html","css","js"]
    published: v.boolean(),
    order: v.number(),
    createdBy: v.id("users"),
  })
    .index("by_slug", ["slug"])
    .index("by_published", ["published"]),

  modules: defineTable({
    courseId: v.id("courses"),
    title: v.string(),
    order: v.number(),
  }).index("by_course", ["courseId"]),

  lessons: defineTable({
    moduleId: v.id("modules"),
    courseId: v.id("courses"), // denormalized → rollup progres cepat
    title: v.string(),
    slug: v.string(),
    contentMd: v.string(), // materi dalam Markdown
    order: v.number(),
    xpReward: v.number(), // XP saat lesson selesai
  })
    .index("by_module", ["moduleId"])
    .index("by_course", ["courseId"]),

  enrollments: defineTable({
    userId: v.id("users"),
    courseId: v.id("courses"),
    enrolledAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_course", ["userId", "courseId"]),

  // Unit atomik progres → di-rollup jadi % per module & per course
  lessonProgress: defineTable({
    userId: v.id("users"),
    lessonId: v.id("lessons"),
    courseId: v.id("courses"),
    completedAt: v.number(),
  })
    .index("by_user_lesson", ["userId", "lessonId"])
    .index("by_user_course", ["userId", "courseId"]),

  // Satu tabel definisi latihan, polymorphic by `type`
  exercises: defineTable({
    lessonId: v.id("lessons"),
    courseId: v.id("courses"),
    title: v.string(),
    type: v.union(
      v.literal("quiz"),
      v.literal("code"),
      v.literal("link"),
      v.literal("text"),
    ),
    promptMd: v.string(), // instruksi soal (Markdown)
    xpReward: v.number(),
    // khusus quiz: kunci jawaban disimpan SERVER-SIDE, tak pernah dikirim ke client
    quiz: v.optional(
      v.object({
        questions: v.array(
          v.object({
            id: v.string(),
            questionMd: v.string(),
            options: v.array(v.string()),
            correctIndex: v.number(), // ⚠️ jangan pernah leak ke client
          }),
        ),
        passScore: v.number(), // mis. 80 (%)
      }),
    ),
    // khusus code: starter files
    starter: v.optional(
      v.object({
        html: v.string(),
        css: v.string(),
        js: v.string(),
      }),
    ),
  }).index("by_lesson", ["lessonId"]),

  // SATU model submission untuk keempat tipe latihan
  submissions: defineTable({
    userId: v.id("users"),
    exerciseId: v.id("exercises"),
    type: v.union(
      v.literal("quiz"),
      v.literal("code"),
      v.literal("link"),
      v.literal("text"),
    ),
    // payload bervariasi per tipe:
    quizAnswers: v.optional(v.array(v.number())), // index pilihan
    code: v.optional(
      v.object({ html: v.string(), css: v.string(), js: v.string() }),
    ),
    link: v.optional(v.string()),
    text: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("reviewed"),
      v.literal("passed"),
      v.literal("failed"),
    ),
    score: v.optional(v.number()),
    feedbackMd: v.optional(v.string()),
    reviewedBy: v.optional(v.id("users")),
    submittedAt: v.number(),
    reviewedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_exercise", ["exerciseId"])
    .index("by_status", ["status"]), // → review queue admin

  // Diskusi per-lesson (threaded)
  comments: defineTable({
    lessonId: v.id("lessons"),
    userId: v.id("users"),
    bodyMd: v.string(),
    parentId: v.optional(v.id("comments")), // balasan bertingkat
    createdAt: v.number(),
  })
    .index("by_lesson", ["lessonId"])
    .index("by_parent", ["parentId"]),

  // XP sebagai ledger append-only
  xpEvents: defineTable({
    userId: v.id("users"),
    amount: v.number(),
    reason: v.string(), // "lesson_complete" | "quiz_pass" | "submission_reviewed" ...
    refId: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  badges: defineTable({
    key: v.string(), // "html_master" | "first_submission" ...
    title: v.string(),
    description: v.string(),
    icon: v.string(),
    criteria: v.string(), // deskripsi human-readable; logic award ada di code
  }).index("by_key", ["key"]),

  userBadges: defineTable({
    userId: v.id("users"),
    badgeId: v.id("badges"),
    awardedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_badge", ["userId", "badgeId"]),
});
