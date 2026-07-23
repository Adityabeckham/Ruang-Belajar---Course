import { internalMutation, mutation } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

/**
 * Bootstrap admin: promosikan user (by email) jadi admin.
 */
export const promoteToAdmin = internalMutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), email))
      .first();
    if (!user) throw new Error(`User dgn email ${email} tidak ditemukan (login dulu)`);

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();
    if (!profile) throw new Error("Profile belum ada (login dulu untuk membuatnya)");

    await ctx.db.patch(profile._id, { role: "admin" });
    return { ok: true, userId: user._id, email };
  },
});

/**
 * Public/Internal Seed Mutation: Populates the 3 main courses matching the Landing Page
 * (Frontend Web, UI/UX Design, Backend Dev) with modules, lessons, exercises, and badges.
 */
export const seedAllCourses = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("courses").collect();
    if (existing.length >= 3) {
      return { skipped: true, reason: "Sudah ter-seed 3 course" };
    }

    const now = Date.now();

    // Find or create admin user for createdBy field
    let adminUser = (await ctx.db.query("users").first())?._id;
    if (!adminUser) {
      adminUser = await ctx.db.insert("users", {
        name: "Admin Ruang Belajar",
        email: "admin@ruangbelajar.space",
        tokenIdentifier: "seed|admin",
      });
    }

    // ── Course 1: Frontend Web ──────────────────────────────────────
    const c1 = await ctx.db.insert("courses", {
      title: "Frontend Web (HTML, CSS, JS, React)",
      slug: "frontend-web",
      description: "Belajar membuat website interaktif dari nol. Pembahasan mendalam layouting hingga React framework modern.",
      level: "beginner",
      tags: ["web", "html", "css", "javascript", "react"],
      published: true,
      order: 0,
      createdBy: adminUser,
    });

    const m1_1 = await ctx.db.insert("modules", {
      courseId: c1,
      title: "Modul 1: Dasardan Struktur Web",
      order: 0,
    });
    const m1_2 = await ctx.db.insert("modules", {
      courseId: c1,
      title: "Modul 2: React Component & State",
      order: 1,
    });

    const l1_1 = await ctx.db.insert("lessons", {
      moduleId: m1_1,
      courseId: c1,
      title: "Pengenalan HTML5 & CSS Flexbox",
      slug: "pengenalan-html5-css",
      contentMd: "# HTML5 & Styling Flexbox\n\nHTML5 memberikan elemen semantik seperti `<header>`, `<main>`, `<section>`, dan `<footer>`.\n\n```css\n.container {\n  display: flex;\n  justify-[#12b3a4]: center;\n}\n```",
      order: 0,
      xpReward: 25,
    });

    const l1_2 = await ctx.db.insert("lessons", {
      moduleId: m1_2,
      courseId: c1,
      title: "Komponen & State React",
      slug: "komponen-state-react",
      contentMd: "# React Component & State\n\nDalam React, kita menggunakan `useState` untuk mengelola state komponen.\n\n```jsx\nconst [count, setCount] = useState(0);\n```",
      order: 0,
      xpReward: 35,
    });

    // ── Course 2: UI/UX Design ──────────────────────────────────────
    const c2 = await ctx.db.insert("courses", {
      title: "UI/UX Design & Prototyping Figma",
      slug: "uiux-design",
      description: "Kuasai riset pengguna, wireframing, pembuatan visual UI, hingga prototyping interaktif dengan Figma untuk mobile & web.",
      level: "intermediate",
      tags: ["design", "figma", "ui", "ux"],
      published: true,
      order: 1,
      createdBy: adminUser,
    });

    const m2_1 = await ctx.db.insert("modules", {
      courseId: c2,
      title: "Modul 1: Prinsip Visual & Layouting",
      order: 0,
    });

    const l2_1 = await ctx.db.insert("lessons", {
      moduleId: m2_1,
      courseId: c2,
      title: "Prinsip Typography & Memphis Design",
      slug: "prinsip-typography-memphis",
      contentMd: "# Typography & Memphis Aesthetics\n\nPrinsip dasar warna kontras tinggi, hard-offset shadow, dan hirarki tipografi modern.",
      order: 0,
      xpReward: 30,
    });

    // ── Course 3: Backend Development ───────────────────────────────
    const c3 = await ctx.db.insert("courses", {
      title: "Backend Development (Node.js & Express)",
      slug: "backend-dev",
      description: "Belajar mendesain RESTful API, mengelola database SQL/NoSQL, dan menerapkan autentikasi serta keamanan server modern.",
      level: "advanced",
      tags: ["backend", "nodejs", "express", "database"],
      published: true,
      order: 2,
      createdBy: adminUser,
    });

    const m3_1 = await ctx.db.insert("modules", {
      courseId: c3,
      title: "Modul 1: REST API & Security",
      order: 0,
    });

    const l3_1 = await ctx.db.insert("lessons", {
      moduleId: m3_1,
      courseId: c3,
      title: "Membangun REST API dengan Express",
      slug: "membangun-rest-api-express",
      contentMd: "# REST API dengan Express.js\n\nMembuat endpoint HTTP, validasi request, dan JWT Auth.",
      order: 0,
      xpReward: 40,
    });

    // ── Exercises ──
    await ctx.db.insert("exercises", {
      lessonId: l1_1,
      courseId: c1,
      title: "Kuis HTML5 & Flexbox",
      type: "quiz",
      promptMd: "Pilihlah jawaban yang tepat.",
      xpReward: 50,
      quiz: {
        passScore: 80,
        questions: [
          {
            id: "q1",
            questionMd: "Elemen manakah yang termasuk HTML5 semantik?",
            options: ["<main>", "<div>", "<span>"],
            correctIndex: 0,
          },
        ],
      },
    });

    // ── Badges ──
    const badges = [
      {
        key: "first_lesson",
        title: "Langkah Pertama",
        description: "Menyelesaikan lesson pertama.",
        icon: "🥇",
        criteria: "Selesaikan 1 lesson.",
      },
      {
        key: "web_dev_hero",
        title: "Web Dev Hero",
        description: "Menuntaskan course Frontend Web.",
        icon: "⚡",
        criteria: "Selesaikan course Frontend Web.",
      },
      {
        key: "design_pro",
        title: "Design Maestro",
        description: "Menuntaskan course UI/UX Design.",
        icon: "🎨",
        criteria: "Selesaikan course UI/UX Design.",
      },
    ];

    for (const b of badges) {
      const existBadge = await ctx.db
        .query("badges")
        .withIndex("by_key", (q) => q.eq("key", b.key))
        .unique();
      if (!existBadge) {
        await ctx.db.insert("badges", b);
      }
    }

    return {
      success: true,
      coursesCreated: [c1, c2, c3],
    };
  },
});

export const run = seedAllCourses;
