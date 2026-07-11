"use client";

import { getSupabase } from "./client";

export type DirectorAudience = "parents" | "teachers" | "all";

export interface DirectorMessage {
  id: string;
  audience: DirectorAudience;
  title: string | null;
  body: string;
  is_published: boolean;
  created_at: string;
}

// Latest published message for a portal audience. Best-effort: if the table
// doesn't exist yet (migration not run) it simply returns null and the portal
// falls back to the default signed note.
export async function loadDirectorMessage(kind: "parents" | "teachers"): Promise<DirectorMessage | null> {
  try {
    const { data } = await getSupabase()
      .from("director_messages")
      .select("*")
      .eq("is_published", true)
      .in("audience", [kind, "all"])
      .order("created_at", { ascending: false })
      .limit(1);
    return (data?.[0] as DirectorMessage) ?? null;
  } catch {
    return null;
  }
}

// Owner: every message, newest first.
export async function loadDirectorMessages(): Promise<{ rows: DirectorMessage[]; error: string | null }> {
  try {
    const { data, error } = await getSupabase()
      .from("director_messages")
      .select("*")
      .order("created_at", { ascending: false });
    return { rows: (data as DirectorMessage[]) ?? [], error: error?.message ?? null };
  } catch (e) {
    return { rows: [], error: e instanceof Error ? e.message : "Failed to load" };
  }
}

export async function saveDirectorMessage(m: { audience: DirectorAudience; title?: string; body: string }) {
  return getSupabase().from("director_messages").insert({ audience: m.audience, title: m.title?.trim() || null, body: m.body.trim() });
}

export async function setDirectorMessagePublished(id: string, is_published: boolean) {
  return getSupabase().from("director_messages").update({ is_published, updated_at: new Date().toISOString() }).eq("id", id);
}

export async function deleteDirectorMessage(id: string) {
  return getSupabase().from("director_messages").delete().eq("id", id);
}
