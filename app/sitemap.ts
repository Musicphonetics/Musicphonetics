import type { MetadataRoute } from "next";
import { REGIONS, TEACHERS } from "@/lib/teachers";

const SITE_URL = "https://musicphonetics.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPaths = [
    "",
    "/method",
    "/programs",
    "/teachers",
    "/founder",
    "/trust",
    "/reviews",
    "/teach-with-us",
    "/contact",
  ];

  const entries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: path === "" ? 1 : 0.8,
  }));

  // Region pages (e.g. /teachers/india)
  for (const r of REGIONS) {
    entries.push({
      url: `${SITE_URL}/teachers/${r.slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: r.status === "active" ? 0.7 : 0.5,
    });
  }

  // Teacher profile pages
  for (const t of TEACHERS) {
    entries.push({
      url: `${SITE_URL}/teachers/profile/${t.slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    });
  }

  return entries;
}
