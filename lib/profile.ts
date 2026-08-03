"use client";

import { getSupabase } from "@/lib/supabase/client";

export interface TeacherProfile {
  id?: string;
  slug?: string | null;
  name: string;
  headline: string;
  location: string;
  instruments: string;
  experience_years: string;
  specialties: string;
  qualifications: string;
  achievements: string;
  languages: string;
  age_group: string;
  approach: string;
  advice: string;
  bio: string;
  photo_url: string;
  status?: string;
  free_edit_used?: boolean;
  published_at?: string | null;
}

export const EMPTY_PROFILE: TeacherProfile = {
  name: "", headline: "", location: "", instruments: "", experience_years: "", specialties: "",
  qualifications: "", achievements: "", languages: "", age_group: "", approach: "", advice: "",
  bio: "", photo_url: "",
};

const asStr = (v: unknown) => (v == null ? "" : String(v));

export function rowToProfile(row: Record<string, unknown> | null): TeacherProfile | null {
  if (!row) return null;
  return {
    id: asStr(row.id), slug: (row.slug as string) ?? null, name: asStr(row.name), headline: asStr(row.headline),
    location: asStr(row.location), instruments: asStr(row.instruments), experience_years: asStr(row.experience_years),
    specialties: asStr(row.specialties), qualifications: asStr(row.qualifications), achievements: asStr(row.achievements),
    languages: asStr(row.languages), age_group: asStr(row.age_group), approach: asStr(row.approach),
    advice: asStr(row.advice), bio: asStr(row.bio), photo_url: asStr(row.photo_url),
    status: asStr(row.status), free_edit_used: !!row.free_edit_used, published_at: (row.published_at as string) ?? null,
  };
}

export async function loadMyProfile(): Promise<TeacherProfile | null> {
  const { data: { session } } = await getSupabase().auth.getSession();
  const uid = session?.user?.id;
  if (!uid) return null;
  const { data } = await getSupabase().from("teacher_public_profiles").select("*").eq("id", uid).maybeSingle();
  return rowToProfile(data as Record<string, unknown> | null);
}

export async function submitProfile(p: TeacherProfile): Promise<{ status: string; slug: string } | { error: string }> {
  const payload = { ...p } as Record<string, unknown>;
  delete payload.status; delete payload.free_edit_used; delete payload.published_at; delete payload.id;
  const { data, error } = await getSupabase().rpc("mp_submit_teacher_profile", { p: payload });
  if (error) return { error: /function .*mp_submit_teacher_profile/i.test(error.message) ? "Run supabase/owner_leads_teacher_profiles.sql first." : error.message };
  const row = Array.isArray(data) ? data[0] : data;
  return { status: row?.status ?? "published", slug: row?.slug ?? "" };
}

export async function aiBio(answers: Record<string, string>): Promise<{ headline: string; bio: string }> {
  const res = await fetch("/api/ai/bio", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ answers }) });
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; headline?: string; bio?: string; error?: string; detail?: string };
  if (!res.ok || !data.ok) throw new Error((data.error || "Couldn't write the bio.") + (data.detail ? ` — ${data.detail}` : ""));
  return { headline: data.headline || "", bio: data.bio || "" };
}

// Public: published profiles for the directory + a single profile by slug.
export async function loadPublishedProfiles(): Promise<TeacherProfile[]> {
  const { data } = await getSupabase().from("teacher_public_profiles").select("*").eq("status", "published").order("published_at", { ascending: false });
  return ((data as Record<string, unknown>[]) ?? []).map((r) => rowToProfile(r)!).filter(Boolean);
}
export async function loadProfileBySlug(slug: string): Promise<TeacherProfile | null> {
  const { data } = await getSupabase().from("teacher_public_profiles").select("*").eq("slug", slug).eq("status", "published").maybeSingle();
  return rowToProfile(data as Record<string, unknown> | null);
}

// Owner: pending profiles + approve/reject.
export async function loadPendingProfiles(): Promise<TeacherProfile[]> {
  const { data } = await getSupabase().from("teacher_public_profiles").select("*").in("status", ["pending"]).order("updated_at", { ascending: false });
  return ((data as Record<string, unknown>[]) ?? []).map((r) => rowToProfile(r)!).filter(Boolean);
}
export async function reviewProfile(id: string, approve: boolean): Promise<{ error?: string }> {
  const { error } = await getSupabase().rpc("mp_review_teacher_profile", { p_id: id, p_approve: approve });
  return { error: error?.message };
}

const toList = (s: string) => s.split(/[,\n]/).map((x) => x.trim()).filter(Boolean);
export const profileList = toList;
