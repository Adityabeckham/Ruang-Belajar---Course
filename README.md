# Ruang Belajar LMS

> Platform pembelajaran online gratis untuk komunitas developer Indonesia. 🇮🇩

LMS untuk komunitas belajar programming. Stack: **React 19 + Vite + Tailwind 4 + Ant Design + Convex + Firebase Auth + Cloudflare Workers**.

Dokumen produk & rencana: [docs/PRD.md](docs/PRD.md) · [docs/IMPLEMENTATION-PLAN.md](docs/IMPLEMENTATION-PLAN.md).

**Production:** https://ruang-belajar-lms.snaw58016.workers.dev
**Convex Dashboard:** https://dashboard.convex.dev/t/aditya-beckham/ruang-belajar-lms/precious-antelope-329

---

## 🏗️ Tech Stack

| Layer | Teknologi |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS v4, Ant Design (Memphis Theme) |
| **Code Editor** | @uiw/react-codemirror (HTML/CSS/JS live playground) |
| **Backend / DB** | Convex Cloud (real-time, serverless) |
| **Auth** | Firebase Authentication (Google + GitHub OAuth) |
| **Hosting** | Cloudflare Workers (global edge CDN) |
| **Icons** | Lucide React |

---

## ⚙️ Prasyarat

- **Node ≥ 20.19** (wajib — Convex CLI & toolchain pakai fitur Node 20+).
  Cek dengan `node -v`. Kalau pakai nvm: `nvm use 20` (atau lebih baru).
- Akun [Convex](https://convex.dev) untuk deployment dev.
- Akun [Cloudflare](https://cloudflare.com) dengan Wrangler CLI.

> **Autentikasi: Firebase Auth.** Login pakai Firebase (Google + GitHub), token-nya
> diverifikasi Convex lewat `ConvexProviderWithAuth` + `convex/auth.config.ts`
> (issuer `securetoken.google.com/<project-id>`).

---

## 🚀 Setup Pertama Kali

```bash
npm install

# 1) Hubungkan ke Convex (login + buat deployment + generate convex/_generated/)
npx convex dev      # biarkan jalan di terminal terpisah

# 2) Buat Firebase project → Authentication → aktifkan provider Google & GitHub.
#    Ambil config web app, isi ke .env.local (lihat .env.example: VITE_FIREBASE_*).
#    Pastikan project-id di convex/auth.config.ts cocok dengan Firebase project-mu.

# 3) Isi data uji
npx convex run seed:run

# 4) Jalankan frontend
npm run dev
```

> **Catatan codegen.** `convex/_generated/` di-generate oleh `npx convex dev` dan
> **tidak** di-commit (gitignored). Wajib menjalankan `npx convex dev` minimal
> sekali sebelum `npm run build`/`tsc`, atau import `convex/_generated/*` gagal.

### Setup OAuth Provider (di Firebase Console)

- **Authentication → Sign-in method** → aktifkan **Google** dan **GitHub**.
- **GitHub**: daftarkan OAuth App di https://github.com/settings/developers,
  isi Client ID/Secret ke Firebase, callback `https://<project-id>.firebaseapp.com/__/auth/handler`.
- Tambahkan domain dev (`localhost`) ke **Authorized domains** Firebase.

---

## 📜 Skrip NPM

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Vite dev server (frontend saja) |
| `npx convex dev` | Convex local (DB + functions + codegen) — terminal terpisah |
| `npm run build` | TypeScript check + Vite production build |
| `npm run lint` | ESLint audit |
| `npx convex run seed:run` | Isi data uji lintas-stream |

---

## 🚢 Deploy ke Production

> ⚠️ **PENTING untuk semua engineer:** Project ini punya **DUA deployment terpisah** yang harus dilakukan bersama setiap ada perubahan.

### Arsitektur Deployment

```
┌──────────────────────────────────────────────────────────┐
│                    PRODUCTION SYSTEM                     │
│                                                          │
│  ┌─────────────────────┐    ┌──────────────────────────┐ │
│  │  CLOUDFLARE WORKERS │    │     CONVEX CLOUD         │ │
│  │  (Frontend/Assets)  │◄──►│  (Backend Functions/DB)  │ │
│  │                     │    │                          │ │
│  │  npx wrangler deploy│    │  npx convex deploy --yes │ │
│  └─────────────────────┘    └──────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

### Perintah Deploy

```bash
# Cara paling mudah — deploy keduanya sekaligus:
npm run deploy:all

# Atau satu per satu:
npm run deploy:backend   # → npx convex deploy --yes   (backend functions)
npm run deploy:frontend  # → npm run build + wrangler deploy (React app)
```

### Kapan Deploy Apa?

| Ada perubahan di... | Yang perlu di-deploy |
|---|---|
| `src/` (React components, pages, features) | `npm run deploy:frontend` |
| `convex/` (functions, schema, queries, mutations) | `npm run deploy:backend` |
| Keduanya (fitur baru full-stack) | `npm run deploy:all` ✅ |

> **Gotcha yang pernah terjadi:** Kalau hanya deploy frontend tapi lupa deploy Convex, browser akan mendapat error `Could not find public function for '...'` karena frontend memanggil fungsi baru yang belum ada di Convex production.

---

## 🌿 Git Branching Strategy

Setiap fitur baru **wajib** menggunakan branch terpisah:

```bash
# Naming convention:
git checkout -b feat/<nama-fitur>    # fitur baru
git checkout -b fix/<nama-bug>       # perbaikan bug
git checkout -b refactor/<target>    # refactor kode

# Contoh:
git checkout -b feat/interactive-code-editor
git checkout -b fix/leaderboard-server-error
```

### Pre-Push Quality Gate (WAJIB sebelum merge ke main)

Sebelum push dan minta review, pastikan semua gate ini lulus:

```bash
# 1. TypeScript & Build check — wajib 0 error
npm run build

# 2. Lint check
npm run lint

# 3. Manual test di local:
#    - Cek di desktop browser
#    - Cek di mobile (iOS Safari / Android Chrome)
#    - Verifikasi RBAC: user biasa tidak bisa akses /admin/*

# 4. Deploy preview (opsional — test di production-like environment)
npm run deploy:all
```

---

## 📁 Struktur Folder

```
src/
├── app/              # Layout, Nav, Router, Auth watcher
├── assets/           # Gambar, logo kampus partner
├── components/
│   └── ui/           # Design system: XPBar, BadgeShelf, StatCard, dll.
├── features/
│   ├── discussion/   # Komponen diskusi per lesson
│   ├── exercises/    # CodeEditor, ExercisePanel
│   └── gamification/ # MyXPBar, BadgeShelf, LeaderboardWidget, BadgeUnlockWatcher
├── lib/              # Firebase client config
├── pages/
│   ├── admin/        # Admin CMS (users, submissions)
│   ├── catalog/      # Halaman katalog course
│   ├── course/       # Detail course
│   ├── dashboard/    # Dashboard member (XP, Badge, Leaderboard)
│   ├── learn/        # LessonView + ExercisePanel + Discussion
│   ├── playground/   # 🧪 Free Code Playground (HTML/CSS/JS)
│   └── profile/      # Profil pengguna
└── routes/
    ├── platformRoutes.tsx   # Dev C: Landing, Login, Dashboard, Profile, Admin
    ├── contentRoutes.tsx    # Dev A: Catalog, Course Detail, Lesson
    └── exerciseRoutes.tsx   # Dev B: Admin Submissions Review

convex/               # Backend Convex (WAJIB deploy dengan npx convex deploy --yes)
├── schema.ts         # Definisi schema database (single-owner: Dev C)
├── gamification.ts   # XP ledger, level curve, badges, leaderboard
├── progress.ts       # Lesson completion + streak tracking
├── submissions.ts    # Submission quiz/code/link/text + review
├── courses.ts        # CRUD course
├── lessons.ts        # Lesson dengan content Markdown
└── lib/authz.ts      # Authorization helpers (requireUser, requireAdmin)
```

---

## 🎮 Fitur yang Sudah Live

| Fitur | Status | Route |
|---|---|---|
| Landing Page (Memphis Design) | ✅ Live | `/` |
| Login (Firebase Google + GitHub) | ✅ Live | `/login` |
| Dashboard Member | ✅ Live | `/dashboard` |
| XP Bar + Level + Daily Streak | ✅ Live | Dashboard |
| Badge Collection | ✅ Live | Dashboard |
| Community Leaderboard (real-time) | ✅ Live | Dashboard |
| Badge Unlock Toast (real-time) | ✅ Live | Global |
| Katalog Course | ✅ Live | `/courses` |
| Detail Course + Enroll | ✅ Live | `/courses/:slug` |
| Lesson View + Markdown | ✅ Live | `/learn/:course/:lesson` |
| Code Editor (HTML/CSS/JS + Preview) | ✅ Live | Di dalam Lesson |
| **Free Playground** 🧪 | ✅ Live | `/playground` |
| Discussion per Lesson | ✅ Live | Di dalam Lesson |
| Quiz Auto-Grade | ✅ Live | Di dalam Lesson |
| Admin: Kelola User & Role | ✅ Live | `/admin/users` |
| Admin: Review Submissions | ✅ Live | `/admin/submissions` |
| Profil Member | ✅ Live | `/profile` |

---

## 🧪 Halaman Uji Mandiri (Harness)

Tanpa perlu login / data lengkap — uji komponen per-stream:

- `/_harness/exercises` · `/_harness/discussion` · `/_harness/gamification`
- `/_harness/markdown` · `/_harness/ui-kit`

---

## 🔒 Environment Variables

Buat file `.env.local` di root project (lihat `.env.example` untuk template):

```env
# Convex
VITE_CONVEX_URL=https://precious-antelope-329.convex.cloud

# Firebase
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

> ⚠️ **JANGAN** commit file `.env.local` ke Git. File ini sudah ada di `.gitignore`.
> Semua secret harus diisi lewat **Variables & Secrets** di dashboard Cloudflare Workers untuk production.

---

*Ruang Belajar Community — Belajar Bareng, Gratis, Inklusif 🇮🇩*
