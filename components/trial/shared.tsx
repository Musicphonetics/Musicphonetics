"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseSafe } from "@/lib/supabase/client";

// Shared data + primitives for the Trial Portal (light, premium, built to sit
// inside PortalShell so it looks identical to the Student Portal).

export interface TrialSession {
  stage: string; status?: string; student_name?: string; who?: string; student_age?: string;
  school?: string; instrument?: string; experience_level?: string; learning_goal?: string;
  dream_songs?: { title: string; lang?: string }[];
  pre_assessment?: Record<string, string>;
  teacher_summary?: string | null; director_note?: string | null;
  director_review?: { text?: string; path?: string; instrument?: string; frequency?: string; start_window?: string } | null;
  recommendation?: { path?: string; price?: string; monthly?: string } | null;
  trial_datetime?: string | null; trial_rating?: number | null;
  trial_otp?: string | null; trial_completed_at?: string | null;
  converted_student_id?: string | null;
  feedback?: { by: string; text: string; at: string; rating?: number }[];
  created_at?: string;
}

export const STAGES = [
  { key: "booked", label: "Trial Booked", sub: "Your journey has begun" },
  { key: "profile", label: "Build Your Profile", sub: "Tell us about the student" },
  { key: "book", label: "Book Your Trial", sub: "Pick your date & time" },
  { key: "meet", label: "Meet Your Teacher", sub: "Allotted & confirmed" },
  { key: "feedback", label: "Share Your Feedback", sub: "After your trial class" },
  { key: "pathway", label: "Your Learning Pathway", sub: "A plan made only for you" },
];

// The CURRENT actionable step, derived from DATA (not just stage) so the
// feedback gate is never skipped by a staff-side stage change. Steps before the
// returned index are complete; steps after are upcoming.
export function currentStep(s?: TrialSession | null): number {
  if (!s) return 1;
  const profileDone = s.stage !== "booked";          // pre-assessment moves off 'booked'
  const scheduled = !!s.trial_datetime;              // a slot is booked
  const completed = !!s.trial_completed_at;          // teacher closed the class (OTP)
  const feedbackDone = !!s.trial_rating;             // family submitted feedback
  if (!profileDone) return 1;                         // → Build Your Profile
  if (!scheduled) return 2;                           // → Book Your Trial
  if (!completed) return 3;                           // → Meet Your Teacher (trial ahead)
  if (!feedbackDone) return 4;                        // → Share Feedback
  return 5;                                           // → Your Learning Pathway
}

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
      const sess = (data as TrialSession) || null;
      // Once enrolled, the SAME account is a full Student Portal, send them there.
      if (sess && (sess.stage === "enrolled" || sess.converted_student_id)) {
        router.replace("/parent/dashboard");
        return;
      }
      setSession(sess);
    } catch (e) { setErr(e instanceof Error ? e.message : "Could not load"); }
    finally { setLoading(false); }
  }, [router]);

  useEffect(() => { reload(); }, [reload]);
  return { session, loading, err, reload };
}

export function firstNameOf(s?: TrialSession | null) {
  return (s?.student_name || "").trim().split(" ")[0] || "";
}
