# Ruang Belajar LMS

LMS untuk komunitas belajar programming. Stack: **React 19 + Vite + Tailwind 4 + Ant Design + Convex**.

Dokumen produk & rencana: [docs/PRD.md](docs/PRD.md) · [docs/IMPLEMENTATION-PLAN.md](docs/IMPLEMENTATION-PLAN.md).

---

## Prasyarat

- **Node ≥ 20.19** (wajib — Convex CLI & toolchain pakai fitur Node 20+).
  Cek dengan `node -v`. Kalau pakai nvm: `nvm use 20` (atau lebih baru).
- Akun [Convex](https://convex.dev) untuk deployment dev.

## Setup pertama kali

```bash
npm install

# 1) Hubungkan ke Convex (login + buat deployment + generate convex/_generated/)
npx convex dev      # biarkan jalan di terminal terpisah

# 2) Set env OAuth di deployment Convex (lihat .env.example untuk detail)
npx convex env set AUTH_GITHUB_ID <...>
npx convex env set AUTH_GITHUB_SECRET <...>
npx convex env set AUTH_GOOGLE_ID <...>
npx convex env set AUTH_GOOGLE_SECRET <...>
npx convex env set SITE_URL http://localhost:5173
# JWT keys Convex Auth:
npx @convex-dev/auth     # generate JWT_PRIVATE_KEY & JWKS otomatis

# 3) Isi data uji
npx convex run seed:run

# 4) Jalankan frontend
npm run dev
```

> **Catatan codegen.** `convex/_generated/` di-generate oleh `npx convex dev` dan
> **tidak** di-commit (gitignored). Wajib menjalankan `npx convex dev` minimal
> sekali sebelum `npm run build`/`tsc`, atau import `convex/_generated/*` gagal.

### Setup OAuth (ringkas)

- **GitHub**: https://github.com/settings/developers → callback
  `<CONVEX_SITE_URL>/api/auth/callback/github`
- **Google**: https://console.cloud.google.com/apis/credentials → redirect URI
  `<CONVEX_SITE_URL>/api/auth/callback/google`

`CONVEX_SITE_URL` = URL `*.convex.site` deployment-mu (lihat output `npx convex dev`).

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

Fondasi bersama (lihat plan §4) **code-complete** di branch `develop`. Auth login,
role tersimpan, dan seed perlu deployment Convex + kredensial OAuth untuk diverifikasi
end-to-end (jalankan langkah setup di atas).
