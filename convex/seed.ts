import { internalMutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

/**
 * Seed lintas-stream (Task 0.9). Jalankan dengan:
 *   npx convex run seed:run
 *
 * Mengisi: 1 admin + 1 student (+ profiles), 1 course → 2 module → 3 lesson,
 * 1 exercise tiap tipe (quiz/link/text/code), beberapa badge.
 * Idempoten: jika course "dasar-html" sudah ada, tidak melakukan apa-apa.
 *
 * Catatan: user di sini di-insert langsung ke tabel `users` (placeholder) untuk
 * data uji. User asli tetap lahir dari OAuth login. Admin pertama produksi
 * dipromosikan manual (PRD §3).
 */
export const run = internalMutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("courses")
      .withIndex("by_slug", (q) => q.eq("slug", "dasar-html"))
      .unique();
    if (existing) {
      return { skipped: true, reason: "sudah ter-seed (course dasar-html ada)" };
    }

    const now = Date.now();

    // ── Users + profiles ────────────────────────────────────────────────
    const adminUser = await ctx.db.insert("users", {
      name: "Admin Seed",
      email: "admin@ruangbelajar.test",
    });
    await ctx.db.insert("profiles", {
      userId: adminUser,
      role: "admin",
      displayName: "Admin Seed",
      totalXp: 0,
      level: 1,
    });

    const studentUser = await ctx.db.insert("users", {
      name: "Siswa Seed",
      email: "siswa@ruangbelajar.test",
    });
    await ctx.db.insert("profiles", {
      userId: studentUser,
      role: "student",
      displayName: "Siswa Seed",
      totalXp: 0,
      level: 1,
    });

    // ── Course → modules → lessons ──────────────────────────────────────
    const courseId = await ctx.db.insert("courses", {
      title: "Dasar HTML",
      slug: "dasar-html",
      description: "Mengenal HTML dari nol: tag, struktur, dan elemen umum.",
      level: "beginner",
      tags: ["html"],
      published: true,
      order: 0,
      createdBy: adminUser,
    });

    const modul1 = await ctx.db.insert("modules", {
      courseId,
      title: "Pengenalan HTML",
      order: 0,
    });
    const modul2 = await ctx.db.insert("modules", {
      courseId,
      title: "Struktur Halaman",
      order: 1,
    });

    const lesson1 = await ctx.db.insert("lessons", {
      moduleId: modul1,
      courseId,
      title: "Apa itu HTML",
      slug: "apa-itu-html",
      contentMd:
        "# Apa itu HTML\n\nHTML adalah bahasa markup untuk menyusun halaman web.\n\n```html\n<h1>Halo Dunia</h1>\n```",
      order: 0,
      xpReward: 20,
    });
    const lesson2 = await ctx.db.insert("lessons", {
      moduleId: modul1,
      courseId,
      title: "Tag Dasar",
      slug: "tag-dasar",
      contentMd:
        "# Tag Dasar\n\nBeberapa tag yang sering dipakai: `<p>`, `<a>`, `<img>`.",
      order: 1,
      xpReward: 20,
    });
    const lesson3 = await ctx.db.insert("lessons", {
      moduleId: modul2,
      courseId,
      title: "Struktur Dokumen",
      slug: "struktur-dokumen",
      contentMd:
        "# Struktur Dokumen\n\nDokumen HTML diawali `<!DOCTYPE html>` lalu `<html>`, `<head>`, `<body>`.",
      order: 0,
      xpReward: 20,
    });

    // ── Exercises: satu tiap tipe ───────────────────────────────────────
    // quiz (auto-grade) — correctIndex disimpan server-side
    await ctx.db.insert("exercises", {
      lessonId: lesson1,
      courseId,
      title: "Kuis Dasar HTML",
      type: "quiz",
      promptMd: "Jawab pertanyaan berikut.",
      xpReward: 50,
      quiz: {
        passScore: 80,
        questions: [
          {
            id: "q1",
            questionMd: "Apa fungsi tag `<h1>`?",
            options: ["Membuat paragraf", "Heading utama", "Membuat link"],
            correctIndex: 1,
          },
          {
            id: "q2",
            questionMd: "Tag untuk gambar adalah?",
            options: ["<img>", "<image>", "<picture>"],
            correctIndex: 0,
          },
        ],
      },
    });
    // link — submit URL, review manual
    await ctx.db.insert("exercises", {
      lessonId: lesson2,
      courseId,
      title: "Kirim Link Latihan",
      type: "link",
      promptMd: "Buat halaman dengan beberapa tag dasar, kirim link CodePen-nya.",
      xpReward: 100,
    });
    // text — jawaban teks/markdown, review manual
    await ctx.db.insert("exercises", {
      lessonId: lesson2,
      courseId,
      title: "Jelaskan dengan Kata-katamu",
      type: "text",
      promptMd: "Jelaskan perbedaan tag `<a>` dan `<img>`.",
      xpReward: 100,
    });
    // code — editor in-browser (Fase 5), dgn starter
    await ctx.db.insert("exercises", {
      lessonId: lesson3,
      courseId,
      title: "Susun Struktur Dasar",
      type: "code",
      promptMd: "Lengkapi struktur dokumen HTML pada starter di bawah.",
      xpReward: 100,
      starter: {
        html: "<!DOCTYPE html>\n<html>\n  <head></head>\n  <body></body>\n</html>",
        css: "",
        js: "",
      },
    });

    // ── Badges ──────────────────────────────────────────────────────────
    const badges: Array<{
      key: string;
      title: string;
      description: string;
      icon: string;
      criteria: string;
    }> = [
      {
        key: "first_lesson",
        title: "Langkah Pertama",
        description: "Menyelesaikan lesson pertama.",
        icon: "🥇",
        criteria: "Selesaikan 1 lesson.",
      },
      {
        key: "first_submission",
        title: "Setoran Perdana",
        description: "Mengirim submission pertama.",
        icon: "📤",
        criteria: "Kirim 1 submission.",
      },
      {
        key: "html_master",
        title: "HTML Master",
        description: "Menuntaskan seluruh course HTML.",
        icon: "🏆",
        criteria: "Selesaikan course Dasar HTML.",
      },
    ];
    const badgeIds: Id<"badges">[] = [];
    for (const b of badges) {
      badgeIds.push(await ctx.db.insert("badges", b));
    }

    return {
      skipped: false,
      seededAt: now,
      users: { adminUser, studentUser },
      courseId,
      modules: [modul1, modul2],
      lessons: [lesson1, lesson2, lesson3],
      badges: badgeIds,
    };
  },
});
