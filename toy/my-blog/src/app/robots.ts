import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.SITE_URL || "http://43.138.158.121";

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/home", "/posts", "/categories", "/tags", "/about", "/leaderboard", "/search"],
      disallow: ["/admin", "/api/", "/auth/", "/settings", "/my-posts", "/my-bookmarks"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
