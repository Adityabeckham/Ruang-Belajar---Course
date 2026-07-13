import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Mendapatkan identitas user yang sedang login dari JWT Firebase.
 */
export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    // Cek apakah user sudah tersimpan di tabel `users` Convex
    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    return user;
  },
});

/**
 * Menyinkronkan identitas user dari Firebase Auth ke database Convex
 * Dipanggil oleh frontend setelah user login sukses.
 */
export const storeUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called storeUser without authentication present");
    }

    // Security Hardening: Validasi Issuer
    // Memastikan token diterbitkan oleh domain Firebase kita, bukan disusupkan dari project lain.
    const expectedIssuer = "https://securetoken.google.com/ruang-belajar-course";
    if (identity.issuer !== expectedIssuer) {
      throw new Error(`Unauthorized: Invalid token issuer ${identity.issuer}`);
    }

    // Security Hardening: Validasi Email Terverifikasi
    // Mencegah account spoofing dari identitas palsu tanpa verifikasi email
    if (identity.emailVerified !== true) {
      throw new Error("Unauthorized: Email is not verified. Please verify your email first.");
    }

    // Security Hardening: Sanitasi Data
    const safeName = identity.name ? identity.name.substring(0, 100) : "Anonymous User";
    const safeEmail = identity.email ? identity.email.substring(0, 150) : undefined;
    const safeImage = typeof identity.picture === "string" ? identity.picture.substring(0, 500) : undefined;

    // Cek jika user sudah ada
    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (user !== null) {
      // User sudah ada, update profil jika ada perubahan dari IdP
      if (
        user.name !== safeName ||
        user.image !== safeImage ||
        user.email !== safeEmail
      ) {
        await ctx.db.patch(user._id, {
          name: safeName,
          image: safeImage,
          email: safeEmail,
        });
      }
      return user._id;
    }

    // Buat user baru
    return await ctx.db.insert("users", {
      name: safeName,
      email: safeEmail,
      image: safeImage,
      tokenIdentifier: identity.tokenIdentifier,
    });
  },
});
