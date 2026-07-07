"use client";

// ============================================================================
// Musicphonetics - Admin Auth (v1, demo only)
// Simple client-side password gate using sessionStorage. NOT real security.
//
// TODO(integration): replace with real authentication (e.g. Supabase Auth,
// NextAuth, or an Apps Script token) before exposing real CRM data.
// ============================================================================

// TODO(security): move this out of the bundle. Demo default per spec.
export const DEMO_ADMIN_PASSWORD = "musicphonetics-admin";

const STORAGE_KEY = "mp-admin-authed";

export function isAdminAuthed(): boolean {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem(STORAGE_KEY) === "true";
}

export function signInAdmin(password: string): boolean {
  if (password === DEMO_ADMIN_PASSWORD) {
    window.sessionStorage.setItem(STORAGE_KEY, "true");
    return true;
  }
  return false;
}

export function signOutAdmin(): void {
  window.sessionStorage.removeItem(STORAGE_KEY);
}
