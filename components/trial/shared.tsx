"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseSafe } from "@/lib/supabase/client";

// Shared data + primitives for the Trial Portal (light, premium — built to sit
// inside PortalShell so it looks identical to the Student Portal).

export interface TrialSession {
  stage: string; status?: string; student_name?: string; who?: string; student_age?: string;
  instrument?: string; experience_level?: string; learning_goal?: string;
  dream_songs?: { title: string; lang?: string }[];
  pre_assessment?: Record<string, string>;
  teacher_summary?: string | null; director_note?: string | null;
  director_review?: { text?: string; path?: string; instrument?: string; frequency?: string; start_window?: string } | null;
  recommendation?: { path?: string; price?: string; monthly?: string } | null;
  trial_datetime?: string | null; feedback?: { by: string; text: string; at: string }[];
  created_at?: string;
}

export const STAGES = [
  { key: "booked", label: "Trial Booked", sub: "Your journey has begun" },
  { key: "pre_assessed", label: "Pre-Assessment", sub: "Help us understand you better" },
  { key: "teacher_assigned", label: "Teacher Assigned", sub: "Matched to you personally" },
  { key: "trial_done", label: "Trial Session", sub: "Your first class" },
  { key: "assessed", label: "Teacher Assessment", sub: "A real, structured review" },
  { key: "director_reviewed", label: "Director Review", sub: "Reviewed by the Director" },
  { key: "recommended", label: "Your Learning Pathway", sub: "A plan made only for you" },
];
export const ORDER: Record<string, number> = {
  booked: 0, pre_assessed: 1, teacher_assigned: 2, trial_scheduled: 2, trial_done: 3,
  assessed: 4, director_reviewed: 5, recommended: 6, enrolled: 7, nurture: 6,
};

export const EXPECT = [
  { icon: "🎯", t: "Personalised Assessment", d: "We understand you before we teach you." },
  { icon: "🎓", t: "Expert Teacher Guidance", d: "A teacher matched to your goals." },
  { icon: "📈", t: "Tailored Learning Pathway", d: "A plan built only for you." },
];

export const EVENTS = [
  { icon: "🎤", t: "Open Mic & Chai", d: "Students perform live, every quarter." },
  { icon: "🏆", t: "Student Showcase", d: "A real stage, real applause." },
  { icon: "🎼", t: "Trinity Exam Prep", d: "Graded milestones, done right." },
  { icon: "🔥", t: "Summer Music Camp", d: "Intensive, fun, unforgettable." },
];

export function instrumentImage(inst?: string) {
  const m: Record<string, string> = {
    Guitar: "/images/classes/duet.webp", Piano: "/images/classes/keys-duet.webp",
    Keyboard: "/images/classes/keys-duet.webp", Ukulele: "/images/classes/ukulele.webp",
    Vocals: "/images/classes/jam.webp", Drums: "/images/classes/trio.webp",
  };
  return m[inst || ""] || "/images/classes/duet.webp";
}

export function useTrial() {
  const router = useRouter();
  const [session, setSession] = useState<TrialSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const { client } = getSupabaseSafe();
    if (!client) { setErr("Portal not configured"); setLoading(false); return; }
    try {
      const { data: { session: auth } } = await client.auth.getSession();
      if (!auth) { router.replace("/trial/login"); return; }
      const { data, error } = await client.rpc("mp_trial_mine");
      if (error) setErr(error.message);
      setSession((data as TrialSession) || null);
    } catch (e) { setErr(e instanceof Error ? e.message : "Could not load"); }
    finally { setLoading(false); }
  }, [router]);

  useEffect(() => { reload(); }, [reload]);
  return { session, loading, err, reload };
}

export function firstNameOf(s?: TrialSession | null) {
  return (s?.student_name || "").trim().split(" ")[0] || "";
}
