// Konfigurasi auth provider untuk deployment (JWT issuer Convex Auth).
// CONVEX_SITE_URL otomatis tersedia di runtime Convex.
export default {
  providers: [
    {
      domain: process.env.CONVEX_SITE_URL,
      applicationID: "convex",
    },
  ],
};
