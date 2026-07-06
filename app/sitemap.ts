import type { MetadataRoute } from "next";
import { PUBLIC_STANDARDS } from "@/lib/standards-public";

const SITE_URL = "https://musicphonetics.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPaths = [
    "",
    "/method",
    "/programs",
    "/curriculum",
    "/teachers",
    "/centre",
    "/founder",
    "/trust",
    "/standards",
    "/reviews",
    "/teach-with-us",
    "/teach-with-us/terms",
    "/contact",
    "/support",
  ];

  const entries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: path === "" ? 1 : 0.8,
  }));

  // Standards documents (public only)
  for (const s of PUBLIC_STANDARDS) {
    entries.push({
      url: `${SITE_URL}/standards/${s.slug}`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.6,
    });
  }

  return entries;
}
