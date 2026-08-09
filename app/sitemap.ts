import type { MetadataRoute } from "next";
import { PUBLIC_STANDARDS } from "@/lib/standards-public";
import { AREA_PAGES } from "@/lib/areas";

const SITE_URL = "https://musicphonetics.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPaths = [
    "",
    "/learn",
    "/method",
    "/programs",
    "/curriculum",
    "/teachers",
    "/faculty",
    "/music-classes",
    "/centre",
    "/founder",
    "/open-mic",
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

  // Local area landing pages (high local-SEO value).
  for (const a of AREA_PAGES) {
    entries.push({
      url: `${SITE_URL}/music-classes/${a.slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: a.flagship ? 1 : 0.9,
    });
  }

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
