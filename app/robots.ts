import type { MetadataRoute } from "next";

const SITE_URL = "https://musicphonetics.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Keep private/operational areas out of search.
      disallow: ["/owner", "/admin"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
