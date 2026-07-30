"use client";

import { useEffect, useState } from "react";
import { getSupabaseSafe, isSupabaseConfigured } from "./client";
import type { Profile } from "./types";

export interface AuthState {
  loading: boolean;
  configured: boolean;
  userId: string | null;
  profile: Profile | null;
  error: string | null;
}

// Loads the current session + profile. Never throws - surfaces errors in state.
export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    loading: true, configured: isSupabaseConfigured(), userId: null, profile: null, error: null,
  });

  useEffect(() => {
    const { client: sb, error: initErr } = getSupabaseSafe();
    if (!sb) {
      setState((s) => ({ ...s, loading: false, configured: isSupabaseConfigured(), error: initErr }));
      return;
    }
    let active = true;

    let lastUid: string | null | undefined;

    async function load(userId: string | null) {
      if (!userId) {
        if (active) setState({ loading: false, configured: true, userId: null, profile: null, error: null });
        return;
      }
      try {
        const { data, error } = await sb!.from("profiles").select("*").eq("id", userId).single();
        if (!active) return;
        setState({
          loading: false, configured: true, userId,
          profile: (data as Profile) ?? null,
          error: error ? error.message : null,
        });
      } catch (e) {
        if (active) setState({ loading: false, configured: true, userId, profile: null, error: (e as Error)?.message || "Couldn't load your profile." });
      }
    }

    // Safety net: never let the portal sit on a spinner. If auth resolution
    // hasn't completed shortly after the request timeout, surface a bounded
    // error state so the shell can offer a retry instead of hanging.
    const guard = setTimeout(() => {
      if (active) setState((s) => (s.loading ? { ...s, loading: false, error: s.error || "Couldn't reach the server. Check your connection and try again." } : s));
    }, 12000);

    sb.auth.getSession().then(({ data }) => {
      lastUid = data.session?.user?.id ?? null;
      load(lastUid);
    }).catch((e) => {
      if (active) setState((s) => ({ ...s, loading: false, error: e?.message || "Auth error" }));
    });

    // IMPORTANT: do NOT run Supabase queries directly inside this callback — it
    // holds an internal auth lock and an awaited query deadlocks (portal hangs
    // on reload). Defer the work to a microtask so the lock is released first,
    // and skip redundant reloads when the user id hasn't changed.
    const { data: sub } = sb.auth.onAuthStateChange((_e, session) => {
      const uid = session?.user?.id ?? null;
      if (uid === lastUid) return;
      lastUid = uid;
      setTimeout(() => { if (active) load(uid); }, 0);
    });
    return () => { active = false; clearTimeout(guard); sub.subscription.unsubscribe(); };
  }, []);

  return state;
}

export async function signOut() {
  const { client } = getSupabaseSafe();
  // Clear any per-user portal state so it can't carry into the next account.
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem("mp-director-read");
      window.localStorage.removeItem("mp-selected-student");
      window.localStorage.removeItem("mp-portal-uid");
    } catch { /* ignore */ }
  }
  if (client) await client.auth.signOut();
}

// Sends a password-reset email that returns the user to /auth/update-password.
export async function sendPasswordReset(email: string): Promise<{ error: string | null }> {
  const { client, error } = getSupabaseSafe();
  if (!client) return { error: error || "Not configured" };
  const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/auth/update-password` : undefined;
  const { error: e } = await client.auth.resetPasswordForEmail(email.trim(), { redirectTo });
  return { error: e?.message ?? null };
}

// Sets a new password for the signed-in (or password-recovery) session.
export async function updatePassword(password: string): Promise<{ error: string | null }> {
  const { client, error } = getSupabaseSafe();
  if (!client) return { error: error || "Not configured" };
  const { error: e } = await client.auth.updateUser({ password });
  return { error: e?.message ?? null };
}
