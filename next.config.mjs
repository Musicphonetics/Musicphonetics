/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Static HTML export — Cloudflare Pages serves the `out/` folder directly
  // (no Next.js server runtime). Lead capture posts to Web3Forms from the
  // client; the OG image is a pre-rendered static file in /public.
  output: "export",
  images: {
    // Image Optimization needs a server; static export uses plain <img>.
    // Inline blur placeholders (lib/media.ts) still work.
    unoptimized: true,
  },
};

export default nextConfig;
