import type { MetadataRoute } from "next";

const siteUrl = (
  process.env.BETTER_AUTH_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/courses", "/about", "/contact", "/login", "/signup"];

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    changeFrequency: route === "/courses" ? "daily" : "weekly",
    priority: route === "" ? 1 : route === "/courses" ? 0.9 : 0.7,
  }));
}
