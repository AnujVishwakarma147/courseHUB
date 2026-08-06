import type { MetadataRoute } from "next";

const siteUrl = (
  process.env.BETTER_AUTH_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/dashboard/", "/api/", "/payment/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
