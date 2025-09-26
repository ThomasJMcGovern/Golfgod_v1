export default {
  providers: [
    {
      domain: process.env.CONVEX_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
      applicationID: "convex",
    },
  ],
};
