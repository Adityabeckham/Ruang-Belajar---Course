# Implementation Plan — Ruang Belajar LMS (3 Dev, Paralel)

> Rencana kerja agar **3 developer bisa jalan bersamaan dengan minim konflik**.
> Baca bareng [PRD.md](./PRD.md) (schema, fitur, keamanan ada di sana).
>
> Inti strategi: **bekukan kontrak di Fase 0**, lalu pecah jadi **3 stream per-domain**
> dengan **kepemilikan file eksklusif**, disambung lewat sedikit **seam** yang disepakati.
> Tiap stream kerja lawan **stub** dulu — tidak saling nunggu.
>
> Status: Draft v1 · 2026-06-20

---

## 0. Peran Tim

| Dev | Stream | Domain |
|---|---|---|
| **Dev A** | **Content & Learning** | Course/Module/Lesson, authoring Markdown, katalog, lesson viewer, progress tracking |
| **Dev B** | **Exercises & Review** | 4 tipe latihan, submission, auto-grade kuis, review queue admin |
| **Dev C** | **Platform & Engagement** (+ *Lead/Integrator*) | Auth, app shell, schema owner, gamifikasi (XP/level/badge), diskusi, dashboard/profil |

> **Dev C = Lead/Integrator**: pemilik tunggal `convex/schema.ts` + `src/app/*` (shell/router).
> Bukan berarti C kerja paling banyak — C front-loaded di Fase 0, lalu beban setara.

---

## 1. Prinsip Paralelisasi (aturan anti-konflik)

1. **Satu domain = satu pemilik = file/folder terpisah.** Backend Convex dipecah per-domain
   (`courses.ts`, `exercises.ts`, `gamification.ts`, ...) supaya tak ada file backend yang
   diedit dua orang. Frontend dipecah per `features/<domain>` & `pages/<domain>`.
2. **Schema bukan "freeze", tapi single-owner + additive.** Perubahan pasti muncul di tengah
   jalan. Aturannya: **butuh ubah schema → minta ke Dev C, jangan edit `schema.ts` di branch sendiri.**
   Perubahan diusahakan additive (field `optional` / tabel baru) supaya low-conflict.
3. **Seam antar-stream disepakati di Fase 0** (lihat §3). Stream saling pakai lewat seam ini,
   bukan lewat internal masing-masing.
4. **Stub-first.** Fase 0 menyediakan versi placeholder dari tiap seam, jadi tiap stream bisa
   dikembangkan & dijalankan sendiri sebelum stream lain selesai.
5. **Codegen tidak masuk git** (lihat §4 — task Fase 0 wajib).
6. **PR kecil & sering** (<~400 baris). Merge `develop` ke branch sendiri tiap hari biar drift kecil.

---

## 2. Kepemilikan File (Ownership Matrix) — *acuan utama biar tak tabrakan*

```
convex/
  schema.ts            ← Dev C (single-owner, additive)        ⚠️ shared
  auth.ts  http.ts     ← Fase 0 → Dev C
  profiles.ts          ← Dev C
  gamification.ts      ← Dev C   (awardXp, level, badge engine)
  comments.ts          ← Dev C
  admin.ts             ← Dev C   (role management)
  courses.ts modules.ts lessons.ts enrollments.ts progress.ts  ← Dev A
  exercises.ts submissions.ts quiz.ts                          ← Dev B
  lib/lessonMarkdown.ts ← Dev A     lib/quizMarkdown.ts ← Dev B
  seed.ts              ← Fase 0 (kontribusi semua stream)       ⚠️ shared
  _generated/          ← GITIGNORED (lihat §4)

src/
  app/                 ← Fase 0 → Dev C                          ⚠️ shared
    App.jsx  Layout.jsx  Nav.jsx  ProtectedRoute.jsx  providers.jsx
    routes.js          ← registry: impor 3 file route stream (di-wire sekali di Fase 0)
  components/          ← Fase 0 → Dev C (API stabil, PR additive)  ⚠️ shared
    Markdown.jsx  ui/{Button,Card,Input,Spinner,ProgressBar,Modal}.jsx
  lib/                 ← Fase 0 (helper umum)
  routes/
    contentRoutes.jsx   ← Dev A     exerciseRoutes.jsx ← Dev B     platformRoutes.jsx ← Dev C
  pages/
    learn/LessonView.jsx ← Fase 0 skeleton (slot) → Dev A isi area konten
    catalog/ course/ admin/content/        ← Dev A
    admin/submissions/                      ← Dev B
    dashboard/ profile/ admin/users/        ← Dev C
  features/
    progress/           ← Dev A
    exercises/          ← Dev B   (ExercisePanel + renderer per-tipe + harness)
    gamification/       ← Dev C   (XPBar, LevelUp, BadgeShelf + harness)
    discussion/         ← Dev C   (Discussion + harness)
```

Folder bertanda ⚠️ shared = sentuh hati-hati, lewat PR yang di-review pemiliknya.
Sisanya **eksklusif** → bebas push tanpa takut konflik.

---

## 3. Kontrak Antar-Stream (the seams)

Hanya **3 seam** yang menyatukan ketiga stream. Disepakati & dibuat stub-nya di Fase 0.

### Seam 1 — `awardXp()` (server helper, milik Dev C)
Satu-satunya cara nambah XP. Dev A & B **memanggil**, Dev C **memiliki** logikanya.
```ts
// convex/gamification.ts  (Fase 0: versi stub no-op; C isi logika asli nanti)
export async function awardXp(ctx, { userId, amount, reason, refId }) { /* ledger + level + badge */ }
```
- Dev A panggil di `markLessonComplete` → `awardXp(ctx,{...,reason:"lesson_complete"})`.
- Dev B panggil saat kuis lulus / submission di-pass.
- Idempoten: cek event dgn `refId` sama tak dobel.

### Seam 2 — Komponen Slot di Lesson Viewer
`LessonView` (skeleton dibuat di Fase 0) memasang 2 slot. A mengimpor dari path tetap;
B & C mengisi file di folder miliknya — **path impor tak berubah**, jadi tak ada churn.
```jsx
// src/pages/learn/LessonView.jsx (Dev A isi area konten/markdown)
<ExercisePanel lessonId={lessonId} />     // dari features/exercises  (Dev B)
<Discussion   lessonId={lessonId} />      // dari features/discussion (Dev C)
```
- Kontrak props: keduanya terima `lessonId` (+ `courseId` bila perlu). Wajib aman saat data kosong.

### Seam 3 — Route Registry
`src/app/routes.js` mengimpor 3 array route (di-wire **sekali** di Fase 0, lalu tak disentuh).
Tiap dev hanya mengedit file route miliknya sendiri.
```js
// src/app/routes.js  (di-set di Fase 0)
import { contentRoutes }  from "../routes/contentRoutes";   // Dev A
import { exerciseRoutes } from "../routes/exerciseRoutes";  // Dev B
import { platformRoutes } from "../routes/platformRoutes";  // Dev C
export const routes = [...platformRoutes, ...contentRoutes, ...exerciseRoutes];
```

> **Komponen `<Markdown source/>`** (milik C, dibuat Fase 0) dipakai ketiganya untuk render
> materi/soal/komentar. API-nya dibekukan awal: `<Markdown source={string} />`.

---

## 4. Fase 0 — Fondasi Bersama (harus mendarat lebih dulu)

Dikerjakan **bareng dalam 1 sesi kickoff (~1 hari)**, lalu merge ke `develop`. Boleh dibagi
micro-task (kolom owner) supaya tak ada yang nganggur. **Tidak ada stream mulai sebelum ini merge.**

| # | Task | Owner | Catatan |
|---|---|---|---|
| 0.1 | **Gitignore codegen Convex** | C | Tambah `convex/_generated/` ke `.gitignore`, lalu `git rm -r --cached convex/_generated`. **Wajib** — kalau tidak, tiap `npx convex dev` bikin konflik di semua branch. Tiap dev regen lokal. |
| 0.2 | `convex/schema.ts` lengkap | C | Salin dari PRD §5 (semua tabel). Jadi kontrak data; A & B review. |
| 0.3 | Convex Auth (`@convex-dev/auth`) Google+GitHub | C | `auth.ts` + `http.ts` + env (`AUTH_GITHUB_ID/SECRET`, `AUTH_GOOGLE_ID/SECRET`). |
| 0.4 | `profiles` on first login + role + `ProtectedRoute` | C | Buat profile saat login pertama; guard route `/admin/*`. |
| 0.5 | App shell + router + **route registry** (Seam 3) | C | `App.jsx`, `Layout`, `Nav`, `routes.js` di-wire ke 3 file route stub. |
| 0.6 | `<Markdown>` + `ui/` kit | C | API beku: `<Markdown source/>`. ui: Button/Card/Input/Spinner/ProgressBar/Modal. |
| 0.7 | **Stub seam**: `awardXp` no-op, `<ExercisePanel>`/`<Discussion>` placeholder, `LessonView` skeleton dgn slot | A+B+C | Tiap stream bikin stub-nya. Ini yang bikin stub-first jalan. |
| 0.8 | **Harness route** `/_harness/*` | A,B,C | Tiap stream punya halaman uji mandiri untuk render panel-nya lawan seed — **tak nunggu LessonView A**. |
| 0.9 | `convex/seed.ts` mencakup **semua stream** | semua | 1 course + 2 module + 3 lesson, **1 exercise tiap tipe** (quiz/link/text/code), 1 admin + 1 student, beberapa badge. Tanpa ini, kerja paralel macet (tak ada data uji). |
| 0.10 | `develop` branch + dokumen kontrak ini disepakati | C | Branch integrasi dari `main`. |

**Exit criteria Fase 0:** app boot, login Google/GitHub jalan, role tersimpan, seed terisi,
3 harness route render placeholder, codegen tak lagi ter-track. → **Buka gerbang paralel.**

---

## 5. Tiga Stream Paralel (setelah Fase 0)

> Format tiap task: **kode** · *ukuran* (S/M/L) · → *depends* · ⇄ *seam*.
> Semua task dalam satu stream berurutan ringan; antar-stream **tidak saling blok** (lawan stub).

### 🟦 Stream A — Content & Learning (Dev A)
Backend: `courses/modules/lessons/enrollments/progress.ts` · Frontend: `pages/catalog|course|admin/content`, `pages/learn`, `features/progress`

| # | Task | Ukuran | Dep / Seam |
|---|---|---|---|
| A1 | CRUD Course→Module→Lesson (mutations + query) | L | — |
| A2 | Admin authoring: editor Markdown + **upload `.md`** (Convex storage) + parser frontmatter (`lib/lessonMarkdown.ts`) | L | A1 |
| A3 | Katalog course + halaman detail course (outline, tombol enroll) | M | A1 |
| A4 | **Lesson viewer**: render `contentMd` via `<Markdown>`, pasang slot `<ExercisePanel>`+`<Discussion>` | M | ⇄ Seam 2 (stub dulu) |
| A5 | Progress: `markLessonComplete` → tulis `lessonProgress` + panggil `awardXp` · rollup % module/course · progress bar | M | ⇄ Seam 1 (stub `awardXp`) |

**Menyediakan:** `api.courses.getBySlug`, `api.lessons.getBySlug`, `api.progress.getCourseProgress`, area slot di LessonView.
**Memakai:** `awardXp()` (C), `<ExercisePanel>` (B), `<Discussion>` (C), `<Markdown>` (C).

### 🟩 Stream B — Exercises & Review (Dev B)
Backend: `exercises/submissions/quiz.ts`, `lib/quizMarkdown.ts` · Frontend: `features/exercises`, `pages/admin/submissions`

| # | Task | Ukuran | Dep / Seam |
|---|---|---|---|
| B1 | CRUD exercise + admin authoring; **parser ` ```quiz `** (PRD §6.2) → struktur; strip `correctIndex` saat dibaca client | L | — |
| B2 | `<ExercisePanel lessonId>` — render UI per tipe: form kuis, input link, editor teks/markdown | L | ⇄ Seam 2 |
| B3 | Submission mutations + **auto-grade kuis server-side** → `awardXp` saat lulus | M | ⇄ Seam 1 (stub) |
| B4 | **Review queue admin**: list `submissions by_status=pending`, set score + `feedbackMd`, ubah status → `awardXp` saat pass | M | ⇄ Seam 1 |
| B5 | *(Fase 5)* Code editor in-browser (CodeMirror) + preview `<iframe sandbox>` + tipe submission `code` | L | PRD §10 keamanan |

**Menyediakan:** `<ExercisePanel lessonId/>`, `api.exercises.listByLesson`.
**Memakai:** `awardXp()` (C), konteks `lessonId/courseId` (route A), `<Markdown>` (C). Uji via `/_harness/exercises`.

### 🟪 Stream C — Platform & Engagement (Dev C)
Backend: `gamification/comments/admin.ts` (+ auth/profiles dari Fase 0) · Frontend: `features/gamification|discussion`, `pages/dashboard|profile|admin/users`

| # | Task | Ukuran | Dep / Seam |
|---|---|---|---|
| C1 | **`awardXp()` asli**: tulis `xpEvents` (ledger) + idempotensi + recompute level di `profiles` | M | ⇄ Seam 1 — **kerjakan DULUAN** biar A & B bisa integrasi |
| C2 | Badge engine: cek kriteria sesudah `awardXp` · seed `badges` + `userBadges` | M | C1 |
| C3 | UI gamifikasi interaktif: `XPBar`, animasi naik level, `BadgeShelf` | M | C1, C2 |
| C4 | `<Discussion lessonId>`: komentar threaded (Markdown + **sanitize**), edit/hapus milik sendiri + moderasi admin | L | ⇄ Seam 2 |
| C5 | Dashboard (lanjut belajar + XP/level/badge) · Profil · Admin kelola user & role | M | baca query A/B (read-only) |

**Menyediakan:** `awardXp()`, `<Discussion lessonId/>`, `<XPBar/>`, query gamifikasi.
**Memakai:** progress/exercise data (read) untuk dashboard. Uji via `/_harness/gamification` & `/_harness/discussion`.

---

## 6. Titik Sinkronisasi & Integrasi

```
[Fase 0 kickoff] ──merge develop──┐
                                  ▼
   ┌─────────── Blok Paralel 1 ───────────┐
   │ A: A1–A4   B: B1–B3   C: C1–C4        │  ← semua lawan stub/seed
   └──────────────────┬───────────────────┘
                      ▼
        ★ Integration Checkpoint 1  (ganti stub → seam asli)
        E2E: enroll → buka lesson → tandai selesai (XP naik) →
             kerjakan kuis (auto-grade, XP) → komentar muncul
                      │
   ┌─────────── Blok Paralel 2 ───────────┐
   │ A: A5      B: B4      C: C5           │
   └──────────────────┬───────────────────┘
                      ▼
        ★ Integration Checkpoint 2  (MVP smoke test penuh)
                      │
                      ▼
        Fase 5 (pasca-MVP): B5 code editor · (opsional) streak/leaderboard
```

**Checkpoint 1 — apa yang dites:** A swap stub `<ExercisePanel>`/`<Discussion>` ke komponen asli
B/C; A & B ganti stub `awardXp` ke milik C. Jalankan alur E2E di atas pakai seed.
**Checkpoint 2 — MVP done:** semua route jalan, review queue berfungsi, dashboard menampilkan
XP/level/badge nyata.

---

## 7. Strategi Branch & PR

- `main` (stabil) → `develop` (integrasi). Semua PR masuk `develop`; `develop`→`main` mingguan.
- Branch fitur: `feat/a/<task>`, `feat/b/<task>`, `feat/c/<task>` (mis. `feat/b/quiz-autograde`).
- PR kecil (<~400 baris), satu task per PR.
- **PR yang menyentuh file ⚠️ shared** (`schema.ts`, `app/*`, `components/*`, `seed.ts`) **wajib
  di-review pemiliknya (Dev C)**. PR di folder eksklusif cukup review ringan antar-dev.
- Tarik `develop` ke branch sendiri tiap hari (kurangi drift). Codegen di-regen lokal, tak di-commit.

---

## 8. Definition of Done

**Per task:** lint lulus · query/mutation aman otorisasi di server (cek role, bukan argumen client)
· jalan di harness/route terkait · tak ada kunci jawaban kuis bocor ke client.

**MVP (akhir Checkpoint 2):**
- [ ] Login Google/GitHub, role admin & student.
- [ ] Admin upload course & soal Markdown; publish.
- [ ] Siswa enroll, belajar, progress per-module/course ke-track.
- [ ] 3 tipe latihan (kuis auto-grade, link, teks) + review queue admin.
- [ ] Diskusi per-lesson.
- [ ] XP, level, badge tampil interaktif di dashboard/profil.

---

## 9. Risiko Konflik & Mitigasi (ringkas)

| Risiko | Mitigasi |
|---|---|
| `convex/_generated/` regen → konflik tiap branch | Gitignore + `git rm --cached` di Fase 0 (task 0.1) |
| 3 orang edit `schema.ts` | Single-owner (C), perubahan additive, minta lewat owner |
| Edit `App.jsx`/router barengan | Route registry: tiap stream punya file route sendiri (Seam 3) |
| B/C nunggu lesson viewer A | Slot path tetap + harness route mandiri (task 0.7–0.8) |
| Logika XP tersebar | Semua lewat `awardXp()` milik C; A/B cuma panggil |
| Tak ada data uji bersama | Seed lintas-stream di Fase 0 (task 0.9) |
```
