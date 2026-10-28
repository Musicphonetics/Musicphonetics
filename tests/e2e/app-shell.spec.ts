import { test, expect } from "@playwright/test";

// Phase 1 critical-journey smoke for the new /app shell, run against the real
// exported build. Note: the local export has no Supabase credentials, so the
// shell renders its chrome + the "not configured" / sign-in state rather than a
// signed-in session. Signed-in redirects are verified on the deployed site
// (where env is set) — see TESTING_AND_DEPLOYMENT.md.

test("public home is the marketing site, not the app shell", async ({ page }) => {
  const res = await page.goto("/");
  expect(res?.status()).toBe(200);
  await expect(page.locator("[data-app-shell]")).toHaveCount(0);
  await expect(page).toHaveTitle(/Musicphonetics/i);
});

test("/app is a real sign-in form (no public sign-up)", async ({ page }) => {
  await page.goto("/app");
  await expect(page.getByRole("heading", { name: "Sign in to Musicphonetics" })).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
  await expect(page.getByRole("button", { name: /Sign in/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Forgot password/ })).toBeVisible();
  // the gate must not expose the app shell (no role yet) and must not offer sign-up
  await expect(page.locator("[data-app-shell]")).toHaveCount(0);
  await expect(page.getByText(/Accounts are set up by Musicphonetics/)).toBeVisible();
  // other portals are reachable but tucked away
  await page.getByRole("button", { name: /Use a different portal/ }).click();
  await expect(page.locator('a[href="/owner/login"]')).toBeVisible();
});

test("teacher app shell renders with teacher navigation", async ({ page }) => {
  await page.goto("/app/teacher/home");
  await expect(page.locator('[data-app-shell="teacher"]')).toBeVisible();
  const rail = page.getByTestId("app-rail");
  for (const label of ["Home", "Students", "Lessons", "Calendar", "Enquiries", "Profile"]) {
    await expect(rail.getByRole("link", { name: label })).toBeVisible();
  }
  await expect(page.getByText(/App preview · Teacher/)).toBeVisible();
});

test("parent app shell renders with parent navigation", async ({ page }) => {
  await page.goto("/app/parent/home");
  await expect(page.locator('[data-app-shell="parent"]')).toBeVisible();
  const rail = page.getByTestId("app-rail");
  for (const label of ["Home", "Children", "Updates", "Teachers", "Profile"]) {
    await expect(rail.getByRole("link", { name: label })).toBeVisible();
  }
});

test("role navigation moves between app screens (client routing)", async ({ page }) => {
  await page.goto("/app/teacher/home");
  await page.getByTestId("app-rail").getByRole("link", { name: "Students" }).click();
  await expect(page).toHaveURL(/\/app\/teacher\/students$/);
  await expect(page.locator('[data-app-shell="teacher"]')).toBeVisible();
});

test("deep-link to an app screen loads directly (refresh-safe)", async ({ page }) => {
  const res = await page.goto("/app/parent/children");
  expect(res?.status()).toBe(200);
  await expect(page.locator('[data-app-shell="parent"]')).toBeVisible();
});

// Phase 3a data routes: they must exist, load inside the correct role shell and
// not crash. (The real roster/lesson/family DATA requires an authenticated
// Supabase session, so it is a production check — see TESTING_AND_DEPLOYMENT.md.)
test("phase 3a data routes load within their role shell", async ({ page }) => {
  for (const [route, role] of [
    ["/app/teacher/students", "teacher"],
    ["/app/parent/children", "parent"],
    ["/app/parent/updates", "parent"],
  ] as const) {
    const res = await page.goto(route);
    expect(res?.status(), route).toBe(200);
    await expect(page.locator(`[data-app-shell="${role}"]`), route).toBeVisible();
  }
});

test("a selected student deep-links with its id (refresh-safe)", async ({ page }) => {
  const res = await page.goto("/app/teacher/students?id=demo-id");
  expect(res?.status()).toBe(200);
  await expect(page.locator('[data-app-shell="teacher"]')).toBeVisible();
  await expect(page).toHaveURL(/\/app\/teacher\/students\?id=demo-id$/);
});

test("unknown /app route returns the 404 page", async ({ page }) => {
  const res = await page.goto("/app/teacher/does-not-exist");
  expect(res?.status()).toBe(404);
  await expect(page.getByText("Page not found")).toBeVisible();
});

test("mobile viewport shows the bottom navigation", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/app/teacher/home");
  const bottom = page.getByTestId("app-bottomnav");
  await expect(bottom).toBeVisible();
  await expect(bottom.getByRole("link", { name: "Students" })).toBeVisible();
});
