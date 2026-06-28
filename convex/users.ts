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

    // Cek jika user sudah ada
    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (user !== null) {
      // User sudah ada, jika ingin update nama/gambar dll bisa di sini
      if (
        user.name !== identity.name ||
        user.image !== identity.picture ||
        user.email !== identity.email
      ) {
        await ctx.db.patch(user._id, {
          name: identity.name,
          image: typeof identity.picture === "string" ? identity.picture : undefined,
          email: identity.email,
        });
      }
      return user._id;
    }

    // Buat user baru
    return await ctx.db.insert("users", {
      name: identity.name,
      email: identity.email,
      image: typeof identity.picture === "string" ? identity.picture : undefined,
      tokenIdentifier: identity.tokenIdentifier,
    });
  },
});
