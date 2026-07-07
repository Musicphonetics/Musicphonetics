/** @type {import('next').NextConfig} */

// --- Supabase env bridge --------------------------------------------------
// This app is Next.js (static export), so only NEXT_PUBLIC_* vars are inlined
// into the browser bundle. To honour Vite-style naming in the Cloudflare Pages
// dashboard, we read VITE_SUPABASE_* (or NEXT_PUBLIC_* as a fallback) at BUILD
// time and inline them as NEXT_PUBLIC_* for the client. The frontend always
// reads process.env.NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY.
//
// Server-only secrets (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) are NOT bridged
// here — they are read directly by the Cloudflare Pages Functions and must
// never reach the client.
function normalizeUrl(u) {
  if (!u) return "";
  return u.trim().replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
}
const SUPABASE_URL = normalizeUrl(
  process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ""
);
const SUPABASE_ANON_KEY =
  (process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();

const nextConfig = {
  reactStrictMode: true,
  // Static HTML export — Cloudflare Pages serves the `out/` folder directly
  // (no Next.js server runtime). Client talks to Supabase with the anon key;
  // RLS protects the data. Privileged actions go through Pages Functions.
  output: "export",
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: SUPABASE_ANON_KEY,
  },
};

export default nextConfig;
