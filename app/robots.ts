import type { MetadataRoute } from "next";

const SITE_URL = "https://musicphonetics.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Keep private/operational areas out of search. Note the trailing slash on
      // "/teacher/" — it blocks the teacher PORTAL without blocking the public
      // "/teachers" faculty pages we very much want indexed.
      disallow: ["/owner", "/admin", "/teacher/", "/parent", "/sales", "/pay", "/api"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
