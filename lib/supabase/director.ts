"use client";

import { getSupabase } from "./client";

export type DirectorAudience = "parents" | "teachers" | "all";

export interface DirectorMessage {
  id: string;
  audience: DirectorAudience;
  title: string | null;
  body: string;
  is_published: boolean;
  target_student_id: string | null;
  target_teacher_id: string | null;
  created_at: string;
}

// All published messages the current signed-in user is allowed to see. RLS
// already scopes this: a parent sees broadcasts + notes for their own children;
// a teacher sees broadcasts + notes addressed to them. Best-effort - returns []
// if the table/columns don't exist yet (migration not run).
export async function loadReadableMessages(): Promise<DirectorMessage[]> {
  try {
    const { data } = await getSupabase()
      .from("director_messages")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false });
    return (data as DirectorMessage[]) ?? [];
  } catch {
    return [];
  }
}

// Parent portal: newest note aimed at THIS child wins; otherwise a parents/all
// broadcast; otherwise nothing. (rows are already newest-first.)
export function pickParentMessage(rows: DirectorMessage[], studentId: string): DirectorMessage | null {
  return (
    rows.find((m) => m.target_student_id === studentId) ??
    rows.find((m) => !m.target_student_id && !m.target_teacher_id) ??
    null
  );
}

// Teacher portal: newest note aimed at this teacher wins; otherwise a broadcast.
export async function loadTeacherMessage(): Promise<DirectorMessage | null> {
  const rows = await loadReadableMessages();
  return (
    rows.find((m) => m.target_teacher_id) ?? // RLS guarantees it's theirs
    rows.find((m) => !m.target_student_id && !m.target_teacher_id) ??
    null
  );
}

// ---- Owner ---------------------------------------------------------------

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

export async function saveDirectorMessage(m: {
  audience: DirectorAudience;
  title?: string;
  body: string;
  target_student_id?: string | null;
  target_teacher_id?: string | null;
}) {
  return getSupabase().from("director_messages").insert({
    audience: m.audience,
    title: m.title?.trim() || null,
    body: m.body.trim(),
    target_student_id: m.target_student_id ?? null,
    target_teacher_id: m.target_teacher_id ?? null,
  });
}

export async function setDirectorMessagePublished(id: string, is_published: boolean) {
  // updated_at is maintained by a DB trigger.
  return getSupabase().from("director_messages").update({ is_published }).eq("id", id);
}

export async function deleteDirectorMessage(id: string) {
  return getSupabase().from("director_messages").delete().eq("id", id);
}

// Recipient options for the composer (owner has RLS access to all).
export interface Recipient { id: string; name: string; sub?: string }

export async function loadRecipients(): Promise<{ students: Recipient[]; teachers: Recipient[] }> {
  const sb = getSupabase();
  const [sRes, tRes] = await Promise.all([
    sb.from("students").select("id,name,parent_name").order("name"),
    sb.from("profiles").select("id,full_name").eq("role", "teacher").order("full_name"),
  ]);
  const students: Recipient[] = ((sRes.data as { id: string; name: string; parent_name: string | null }[]) ?? [])
    .map((s) => ({ id: s.id, name: s.name, sub: s.parent_name ? `Parent: ${s.parent_name}` : undefined }));
  const teachers: Recipient[] = ((tRes.data as { id: string; full_name: string | null }[]) ?? [])
    .map((t) => ({ id: t.id, name: t.full_name || "Teacher" }));
  return { students, teachers };
}
