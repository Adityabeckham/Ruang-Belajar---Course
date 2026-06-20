# PRD & Implementation Plan — Ruang Belajar LMS

> LMS untuk komunitas belajar programming (HTML, CSS, JS, dst). Dokumen ini berisi
> Product Requirements (apa & kenapa) dan Implementation Plan bertahap (bagaimana & urutan).
>
> Status: **Draft v1** · Tanggal: 2026-06-20 · Stack terkunci: React 19 + Vite + Tailwind 4 + Convex.

---

## 1. Ringkasan & Tujuan

**Visi.** Tempat anggota komunitas belajar programming secara terstruktur: baca materi,
kerjakan latihan, bertanya lewat diskusi, dan melihat progres mereka naik lewat sistem
gamifikasi (XP, level, badge) yang interaktif.

**Tujuan produk (MVP).**
1. Siswa bisa daftar/login, telusuri course, belajar per-lesson, dan progresnya ke-track otomatis.
2. Admin bisa upload course & soal dalam bentuk **Markdown**, lalu mereview tugas siswa.
3. Setiap lesson punya ruang diskusi/komentar untuk tanya-jawab.
4. Progres ditampilkan dengan tema gamifikasi: **XP & Level** dan **Badge/Achievement**.

**Non-goals (MVP).** Pembayaran/subscription, sertifikat, mobile app native, live class/video
conferencing, leaderboard & streak (sengaja ditunda — lihat §12 Open Questions).

---

## 2. Keputusan yang Sudah Dikunci

| Area | Keputusan |
|---|---|
| **Autentikasi** | Google + GitHub OAuth via **Convex Auth native** (`@convex-dev/auth`) — terverifikasi mendukung kedua provider. Tanpa Clerk/pihak ketiga. |
| **Peran (role)** | **2 role: Admin & Siswa (student).** Admin mengelola konten *dan* mereview tugas. |
| **Jenis latihan** | Keempatnya didukung: **kuis pilihan ganda (auto-grade), code editor in-browser, submit link (GitHub/CodePen), jawaban teks/markdown.** Dibangun bertahap (lihat §11). |
| **Gamifikasi** | **XP & Level + Badge/Achievement.** Streak harian & Leaderboard ditunda. |
| **Format konten** | Admin upload materi & soal dalam **Markdown** (paste editor + upload file `.md`). |

---

## 3. Persona & Peran

### Siswa (student) — peran default semua user baru
- Login, lengkapi profil.
- Telusuri katalog course, enroll, belajar per-lesson.
- Kerjakan latihan (kuis/code/link/teks), lihat hasil & feedback.
- Ikut diskusi/komentar di lesson.
- Lihat dashboard progres: XP, level, badge, course yang sedang berjalan.

### Admin
- Semua kemampuan siswa, plus:
- CRUD course → module → lesson, upload materi & soal Markdown.
- Kelola review queue: nilai & beri feedback ke submission yang `pending`.
- Kelola user & promosikan/turunkan role (admin ↔ student).
- (MVP) Admin pertama di-seed manual; selanjutnya admin bisa angkat admin lain.

---

## 4. Arsitektur & Pustaka

```
React 19 (Vite)  ──►  Convex (DB + functions + auth + file storage)
       │
       ├─ react-router-dom      → routing/page map (§9)
       ├─ @convex-dev/auth       → Google + GitHub OAuth
       ├─ react-markdown + remark-gfm + Shiki (rehype)
       │                         → render materi & komentar + syntax highlight
       └─ CodeMirror 6 + <iframe sandbox>   (Fase 5)
                                 → code editor in-browser + live preview
```

**Catatan TypeScript.** Backend Convex (`schema.ts` + functions) sebaiknya pakai **TypeScript**
untuk type-safety query/mutation. Frontend boleh tetap `.jsx`. `convex/message.js` lama bisa
dibuang setelah schema masuk.

---

## 5. Model Data (Convex Schema) — *tulang punggung sistem*

> Ini spine dari LMS. File: `convex/schema.ts`. XP disimpan sebagai **ledger append-only**
> (`xpEvents`), bukan counter tunggal — total selalu bisa dihitung ulang & jadi audit trail
> untuk trigger badge. Level = turunan dari total XP (lihat §8).

```ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

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
    level: v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced")),
    tags: v.array(v.string()),              // ["html","css","js"]
    published: v.boolean(),
    order: v.number(),
    createdBy: v.id("users"),
  }).index("by_slug", ["slug"]).index("by_published", ["published"]),

  modules: defineTable({
    courseId: v.id("courses"),
    title: v.string(),
    order: v.number(),
  }).index("by_course", ["courseId"]),

  lessons: defineTable({
    moduleId: v.id("modules"),
    courseId: v.id("courses"),              // denormalized → rollup progres cepat
    title: v.string(),
    slug: v.string(),
    contentMd: v.string(),                  // materi dalam Markdown
    order: v.number(),
    xpReward: v.number(),                   // XP saat lesson selesai
  }).index("by_module", ["moduleId"]).index("by_course", ["courseId"]),

  enrollments: defineTable({
    userId: v.id("users"),
    courseId: v.id("courses"),
    enrolledAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_user_course", ["userId", "courseId"]),

  // Unit atomik progres → di-rollup jadi % per module & per course
  lessonProgress: defineTable({
    userId: v.id("users"),
    lessonId: v.id("lessons"),
    courseId: v.id("courses"),
    completedAt: v.number(),
  }).index("by_user_lesson", ["userId", "lessonId"])
    .index("by_user_course", ["userId", "courseId"]),

  // Satu tabel definisi latihan, polymorphic by `type`
  exercises: defineTable({
    lessonId: v.id("lessons"),
    courseId: v.id("courses"),
    title: v.string(),
    type: v.union(
      v.literal("quiz"), v.literal("code"),
      v.literal("link"), v.literal("text"),
    ),
    promptMd: v.string(),                   // instruksi soal (Markdown)
    xpReward: v.number(),
    // khusus quiz: kunci jawaban disimpan SERVER-SIDE, tak pernah dikirim ke client
    quiz: v.optional(v.object({
      questions: v.array(v.object({
        id: v.string(),
        questionMd: v.string(),
        options: v.array(v.string()),
        correctIndex: v.number(),           // ⚠️ jangan pernah leak ke client
      })),
      passScore: v.number(),                // mis. 80 (%)
    })),
    // khusus code: starter files
    starter: v.optional(v.object({
      html: v.string(), css: v.string(), js: v.string(),
    })),
  }).index("by_lesson", ["lessonId"]),

  // SATU model submission untuk keempat tipe latihan
  submissions: defineTable({
    userId: v.id("users"),
    exerciseId: v.id("exercises"),
    type: v.union(
      v.literal("quiz"), v.literal("code"),
      v.literal("link"), v.literal("text"),
    ),
    // payload bervariasi per tipe:
    quizAnswers: v.optional(v.array(v.number())),                       // index pilihan
    code: v.optional(v.object({ html: v.string(), css: v.string(), js: v.string() })),
    link: v.optional(v.string()),
    text: v.optional(v.string()),
    status: v.union(
      v.literal("pending"), v.literal("reviewed"),
      v.literal("passed"), v.literal("failed"),
    ),
    score: v.optional(v.number()),
    feedbackMd: v.optional(v.string()),
    reviewedBy: v.optional(v.id("users")),
    submittedAt: v.number(),
    reviewedAt: v.optional(v.number()),
  }).index("by_user", ["userId"])
    .index("by_exercise", ["exerciseId"])
    .index("by_status", ["status"]),       // → review queue admin

  // Diskusi per-lesson (threaded)
  comments: defineTable({
    lessonId: v.id("lessons"),
    userId: v.id("users"),
    bodyMd: v.string(),
    parentId: v.optional(v.id("comments")), // balasan bertingkat
    createdAt: v.number(),
  }).index("by_lesson", ["lessonId"]).index("by_parent", ["parentId"]),

  // XP sebagai ledger append-only
  xpEvents: defineTable({
    userId: v.id("users"),
    amount: v.number(),
    reason: v.string(),        // "lesson_complete" | "quiz_pass" | "submission_reviewed" ...
    refId: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  badges: defineTable({
    key: v.string(),           // "html_master" | "first_submission" ...
    title: v.string(),
    description: v.string(),
    icon: v.string(),
    criteria: v.string(),      // deskripsi human-readable; logic award ada di code
  }).index("by_key", ["key"]),

  userBadges: defineTable({
    userId: v.id("users"),
    badgeId: v.id("badges"),
    awardedAt: v.number(),
  }).index("by_user", ["userId"]).index("by_user_badge", ["userId", "badgeId"]),
});
```

**Hierarki konten:** `Course → Module → Lesson`. Latihan & diskusi menempel di level **Lesson**.

---

## 6. Konten dalam Markdown & Konvensi Soal

### 6.1 Materi (lesson)
Admin menulis materi sebagai Markdown biasa (heading, list, code block, gambar). Disimpan di
`lessons.contentMd`. Render pakai react-markdown + remark-gfm + Shiki untuk highlight code block.

### 6.2 Konvensi kunci jawaban kuis ⚠️ (keputusan penting)
**Masalah:** Markdown polos tidak membawa "kunci jawaban", padahal auto-grade butuh jawaban
benar yang terstruktur. Kalau dibiarkan ambigu, fitur auto-grade tak bisa dibangun.

**Default yang diusulkan (bisa direvisi — lihat §12):** kuis ditulis Markdown dengan
**frontmatter + fenced block ` ```quiz `** (YAML). Saat upload, parser mengubahnya jadi objek
`quiz` terstruktur; `correctIndex` disimpan server-side & **di-strip sebelum data sampai ke client.**

````markdown
---
type: quiz
title: Kuis Dasar HTML
passScore: 80
xpReward: 50
---

```quiz
- q: Apa fungsi tag `<h1>`?
  options: ["Membuat paragraf", "Heading utama", "Membuat link"]
  answer: 1
- q: Tag untuk gambar adalah?
  options: ["<img>", "<image>", "<picture>"]
  answer: 0
```
````

Alternatif yang dipertimbangkan: **Quiz-builder UI** (form input soal) — lebih ramah non-teknis
tapi keluar dari "upload md". Default di atas mempertahankan alur Markdown.

---

## 7. Fitur Fungsional

### 7.1 Latihan & Review (satu model, empat tipe)
- **Kuis (auto-grade):** dinilai otomatis di server (bandingkan `quizAnswers` vs `correctIndex`),
  `status` langsung `passed`/`failed`, XP otomatis bila lulus.
- **Submit link (GitHub/CodePen):** siswa kirim URL → `status: pending` → admin review manual.
- **Jawaban teks/markdown:** siswa tulis/upload → `pending` → admin review manual.
- **Code in-browser (Fase 5):** siswa tulis HTML/CSS/JS → preview → submit; review manual (opsional auto-check).
- **Review queue admin:** query `submissions by_status = pending`. Admin set `score`, `feedbackMd`,
  ubah status → `reviewed/passed/failed`. Saat di-pass, emit `xpEvent`.

### 7.2 Diskusi / Komentar
- Per-lesson, threaded (1 level balasan). Body Markdown (subset renderer yang sama).
- Author bisa hapus/edit komentar sendiri; admin bisa moderasi semua.

### 7.3 Progress Tracking
- Tandai lesson selesai → tulis `lessonProgress` → emit `xpEvent("lesson_complete")`.
- **Rollup:** % module = lesson selesai / total lesson di module; % course = agregat semua module.
- Ditampilkan sebagai progress bar interaktif di course detail & dashboard.

### 7.4 Gamifikasi
- **XP:** akumulasi dari `xpEvents` (lesson complete, quiz pass, submission reviewed/passed).
- **Level:** turunan dari total XP (kurva §8). Naik level memicu animasi/feedback interaktif.
- **Badge:** award-engine cek kriteria tiap ada `xpEvent`/progress baru (mis. "selesai modul HTML",
  "submission pertama", "5 lesson dalam sehari"). Disimpan di `userBadges`.

---

## 8. Kurva XP & Level (default, mudah di-tweak)

- XP reward default: lesson `+20`, quiz lulus `+50`, tugas (link/teks/code) di-pass `+100`.
- Level dari total XP — kurva kuadratik ringan:

```
levelXp(L) = 100 * L * (L + 1) / 2     // XP kumulatif untuk capai level L
// L1=0, L2=100, L3=300, L4=600, L5=1000, ...
level(totalXp) = max L dimana levelXp(L) <= totalXp
```

Disimpan sebagai konstanta di `convex/gamification.ts` agar gampang dikalibrasi.

---

## 9. Peta Halaman / Routing

| Route | Akses | Isi |
|---|---|---|
| `/` | publik | Landing + CTA login |
| `/login` | publik | Tombol Google / GitHub |
| `/courses` | siswa | Katalog course (filter tag/level) |
| `/courses/:slug` | siswa | Detail course, outline module/lesson, tombol enroll, progress bar |
| `/learn/:courseSlug/:lessonSlug` | siswa (enrolled) | Materi Markdown + latihan + diskusi + tombol "Tandai selesai" |
| `/dashboard` | siswa | Lanjut belajar, XP/level, badge shelf, course berjalan |
| `/profile` | siswa | Profil, avatar, statistik |
| `/admin` | admin | Ringkasan: course count, review pending, user count |
| `/admin/courses` | admin | CRUD course/module/lesson, upload `.md` |
| `/admin/courses/:id/edit` | admin | Editor course (materi & soal Markdown) |
| `/admin/submissions` | admin | Review queue (pending → reviewed) |
| `/admin/users` | admin | Kelola user & role |

Proteksi route via guard berbasis `profiles.role` (siswa tak bisa akses `/admin/*`).

---

## 10. Keamanan & Non-Fungsional (cross-cutting)

- **Kunci jawaban kuis tak pernah dikirim ke client.** Query yang melayani siswa harus
  meng-omit `quiz.questions[].correctIndex`. Penilaian hanya di mutation server-side.
- **Otorisasi di server.** Setiap mutation cek identitas (`ctx.auth`) & role dari `profiles`,
  bukan dari argumen client. Route guard frontend hanya UX, bukan security boundary.
- **Code execution = `<iframe sandbox="allow-scripts">`** (Fase 5), **tanpa** `allow-same-origin`
  agar kode siswa tak bisa menyentuh parent/cookie/Convex session. Preview via `srcdoc`, debounced.
- **Sanitasi Markdown.** Render komentar (user-generated) dengan rehype-sanitize untuk cegah XSS.
- **Idempotensi XP.** `lessonProgress` & quiz pass unik per (user, lesson/exercise) supaya XP tak dobel.

---

## 11. Rencana Implementasi (Bertahap)

> Phasing jujur sesuai biaya. **Kuis + link + teks berbagi satu model submission** → murah, dibangun
> bareng. **Code editor in-browser** adalah sub-proyek tersendiri (CodeMirror + iframe sandbox) → fase
> terakhir. XP pakai ledger sejak awal; event dipancarkan saat fitur-fiturnya mendarat.

### Fase 0 — Fondasi
- Pasang `react-router-dom`, app shell + layout + theme Tailwind.
- Convex Auth (`@convex-dev/auth`) Google + GitHub; halaman `/login`.
- `convex/schema.ts` (semua tabel §5). Buang `message.js`.
- Bikin `profiles` saat first login; **seed admin pertama** manual.
- Komponen `<Markdown>` (react-markdown + remark-gfm + Shiki + sanitize).
- ✅ *Selesai bila:* user bisa login Google/GitHub, role tersimpan, route guard jalan.

### Fase 1 — Konten & Belajar (inti LMS)
- Admin CRUD course/module/lesson + upload Markdown (paste & file `.md`).
- Katalog course, detail course, enrollment.
- Lesson viewer (render Markdown + highlight), tombol "Tandai selesai".
- `lessonProgress` + rollup % module/course; emit `xpEvent("lesson_complete")`.
- Dashboard siswa: lanjut belajar + progress bar.
- ✅ *Selesai bila:* admin publish course, siswa belajar & progres ter-track.

### Fase 2 — Latihan (3 tipe murah) + Review
- Model `exercises` + `submissions`.
- Kuis auto-grade (konvensi md §6.2), submit-link, jawaban teks/markdown.
- Review queue admin: nilai + `feedbackMd`, ubah status; emit XP saat pass.
- ✅ *Selesai bila:* siswa submit 3 tipe, admin review, XP masuk.

### Fase 3 — Diskusi
- Komentar per-lesson (threaded, Markdown, sanitized), edit/hapus milik sendiri + moderasi admin.
- ✅ *Selesai bila:* tanya-jawab jalan di tiap lesson.

### Fase 4 — Gamifikasi penuh
- Kurva level (§8), badge + `userBadges`, award-engine.
- UI interaktif: XP bar, animasi naik level, badge shelf di profil/dashboard.
- ✅ *Selesai bila:* XP→level→badge tampil & terasa "hidup".

### Fase 5 — Code editor in-browser (sub-proyek)
- CodeMirror 6 (HTML/CSS/JS), live preview `<iframe sandbox>`.
- Tipe submission `code`, opsional auto-check sederhana.
- ✅ *Selesai bila:* siswa ngoding di browser, preview, submit, di-review.

---

## 12. Open Questions (perlu keputusan, tapi tak memblok mulai)

1. **Format kunci jawaban kuis** — pakai konvensi Markdown ` ```quiz ` (default §6.2) atau
   bikin **Quiz-builder UI**? Default jalan dulu; bisa diganti tanpa ubah schema.
2. **Streak & Leaderboard** — ditunda dari MVP. Aktifkan nanti? (schema `xpEvents` sudah siap mendukung.)
3. **Penyimpanan gambar materi** — pakai Convex file storage atau URL eksternal? (Default: Convex storage.)
4. **Bahasa UI** — Indonesia saja, atau perlu i18n? (Default: Indonesia.)

---

## 13. Langkah Berikutnya

Begitu plan ini di-approve, mulai **Fase 0**: pasang routing + Convex Auth + tulis `schema.ts`,
lalu seed admin pertama. Saya bisa langsung kerjakan per-fase dan track progresnya.
