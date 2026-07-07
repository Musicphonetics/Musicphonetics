"use client";

// ============================================================================
// Musicphonetics - Owner Portal Auth (v1)
// Client-side password gate. Structured so the secret can move to an
// environment variable / backend auth without changing call sites.
//
// To override without code changes, set NEXT_PUBLIC_OWNER_PASSWORD at build.
// TODO(security): replace with real backend auth (Supabase/NextAuth) before
// connecting real CRM/payment data. Do not keep the password in the bundle.
// ============================================================================

export const OWNER_PASSWORD =
  process.env.NEXT_PUBLIC_OWNER_PASSWORD ?? "Abhi@7276";

const STORAGE_KEY = "mp-owner-authed";

export function isOwnerAuthed(): boolean {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem(STORAGE_KEY) === "true";
}

export function signInOwner(password: string): boolean {
  if (password === OWNER_PASSWORD) {
    window.sessionStorage.setItem(STORAGE_KEY, "true");
    return true;
  }
  return false;
}

export function signOutOwner(): void {
  window.sessionStorage.removeItem(STORAGE_KEY);
}
