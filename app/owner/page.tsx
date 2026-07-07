"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loading } from "@/components/portal/kit";

// The real owner command dashboard lives at /owner/dashboard (Supabase-backed).
// This root just forwards there.
export default function OwnerIndex() {
  const router = useRouter();
  useEffect(() => { router.replace("/owner/dashboard"); }, [router]);
  return <div className="min-h-screen bg-paper"><Loading label="Opening dashboard…" /></div>;
}
