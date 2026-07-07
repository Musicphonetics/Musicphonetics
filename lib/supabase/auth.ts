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

    async function load(userId: string | null) {
      if (!userId) {
        if (active) setState({ loading: false, configured: true, userId: null, profile: null, error: null });
        return;
      }
      const { data, error } = await sb!.from("profiles").select("*").eq("id", userId).single();
      if (!active) return;
      setState({
        loading: false, configured: true, userId,
        profile: (data as Profile) ?? null,
        error: error ? error.message : null,
      });
    }

    sb.auth.getSession().then(({ data }) => load(data.session?.user?.id ?? null)).catch((e) => {
      if (active) setState((s) => ({ ...s, loading: false, error: e?.message || "Auth error" }));
    });
    const { data: sub } = sb.auth.onAuthStateChange((_e, session) => load(session?.user?.id ?? null));
    return () => { active = false; sub.subscription.unsubscribe(); };
  }, []);

  return state;
}

export async function signOut() {
  const { client } = getSupabaseSafe();
  if (client) await client.auth.signOut();
}
