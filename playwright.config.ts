import { defineConfig, devices } from "@playwright/test";

// Phase 1 Playwright harness. Runs against the real exported build in `out/`,
// served by a Cloudflare-like static server. Keep it minimal and deterministic.
const PORT = Number(process.env.E2E_PORT || 4321);

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  reporter: [["list"]],
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: "off",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // The CI/container ships a full Chromium build; point Playwright at it
        // directly so it doesn't try to fetch its own bundled browser.
        launchOptions: {
          executablePath:
            process.env.PLAYWRIGHT_CHROMIUM_PATH ||
            "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
          args: ["--no-sandbox"],
        },
      },
    },
  ],
  webServer: {
    command: "node tests/static-server.mjs",
    url: `http://127.0.0.1:${PORT}/`,
    reuseExistingServer: true,
    timeout: 20_000,
  },
});
