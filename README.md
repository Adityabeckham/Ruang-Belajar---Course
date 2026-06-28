# Ruang Belajar LMS

LMS untuk komunitas belajar programming. Stack: **React 19 + Vite + Tailwind 4 + Ant Design + Convex**.

Dokumen produk & rencana: [docs/PRD.md](docs/PRD.md) · [docs/IMPLEMENTATION-PLAN.md](docs/IMPLEMENTATION-PLAN.md).

---

## Prasyarat

- **Node ≥ 20.19** (wajib — Convex CLI & toolchain pakai fitur Node 20+).
  Cek dengan `node -v`. Kalau pakai nvm: `nvm use 20` (atau lebih baru).
- Akun [Convex](https://convex.dev) untuk deployment dev.

> **Autentikasi: Firebase Auth.** Login pakai Firebase (Google + GitHub), token-nya
> diverifikasi Convex lewat `ConvexProviderWithAuth` + `convex/auth.config.ts`
> (issuer `securetoken.google.com/<project-id>`).

## Setup pertama kali

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

### Setup OAuth provider (di Firebase Console)

- **Authentication → Sign-in method** → aktifkan **Google** dan **GitHub**.
- **GitHub**: daftarkan OAuth App di https://github.com/settings/developers,
  isi Client ID/Secret ke Firebase, callback `https://<project-id>.firebaseapp.com/__/auth/handler`.
- Tambahkan domain dev (`localhost`) ke **Authorized domains** Firebase.

---

## Skrip

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Vite dev server (frontend) |
| `npx convex dev` | Convex (DB + functions + codegen) — terminal terpisah |
| `npm run build` | `tsc -b && vite build` |
| `npm run lint` | ESLint |
| `npx convex run seed:run` | Isi data uji lintas-stream |

## Halaman uji mandiri (harness)

Tanpa perlu login / data lengkap — uji komponen per-stream:

- `/_harness/exercises` · `/_harness/discussion` · `/_harness/gamification`
- `/_harness/markdown` · `/_harness/ui-kit`

---

## Status Fase 0

Fondasi bersama (lihat plan §4) **code-complete**. Auth login (Firebase),
role tersimpan, dan seed perlu deployment Convex + Firebase project untuk
diverifikasi end-to-end (jalankan langkah setup di atas).
