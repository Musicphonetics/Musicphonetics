"use client";

import { useReducedMotion } from "framer-motion";
import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Section, SectionHeading } from "@/components/ui/Section";
import { SOLO_VS } from "@/lib/teach-econ";
import { formatINR } from "@/lib/utils";
import { cn } from "@/lib/utils";

const incomeData = [
  { name: "Going solo", value: 28000, faculty: false },
  { name: "Musicphonetics", value: 59200, faculty: true },
];

function MetricRow({ label, solo, faculty, unit }: { label: string; solo: number; faculty: number; unit: string }) {
  const max = Math.max(solo, faculty);
  const fmt = (n: number) => (unit === "₹/class" ? formatINR(n) : `${n} ${unit}`);
  const Bar2 = ({ v, gold }: { v: number; gold?: boolean }) => (
    <div className="flex items-center gap-3">
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-mist">
        <div className={cn("h-full rounded-full", gold ? "bg-gold" : "bg-ink/30")} style={{ width: `${(v / max) * 100}%` }} />
      </div>
      <span className="w-24 shrink-0 text-right text-sm font-semibold text-ink">{fmt(v)}</span>
    </div>
  );
  return (
    <div className="rounded-2xl border border-hairline bg-paper p-5">
      <div className="text-sm font-semibold text-ink">{label}</div>
      <div className="mt-3 space-y-2">
        <div><span className="mb-1 block text-xs text-ink/50">Going solo</span><Bar2 v={solo} /></div>
        <div><span className="mb-1 block text-xs text-ink/50">Musicphonetics</span><Bar2 v={faculty} gold /></div>
      </div>
    </div>
  );
}

export function SoloVsFaculty() {
  const reduced = useReducedMotion();
  const rate = SOLO_VS[0];
  const vol = SOLO_VS[1];
  return (
    <Section background="white" spacing="lg">
      <SectionHeading
        eyebrow="Solo vs Musicphonetics"
        title="The edge isn't a higher rate. It's a full, steady roster."
        intro="Your per-class rate going solo can match ours. What changes is the volume and the stability — and who carries the admin."
      />

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Steady monthly income — hero comparison */}
        <div className="rounded-3xl border border-hairline bg-paper p-5 shadow-card sm:p-7">
          <p className="text-sm font-semibold text-ink">Steady monthly income</p>
          <div className="mt-2 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incomeData} margin={{ top: 24, right: 8, bottom: 8, left: 8 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#161B26" }} tickLine={false} axisLine={{ stroke: "rgba(22,27,38,.14)" }} />
                <YAxis hide />
                <Bar dataKey="value" radius={[10, 10, 0, 0]} isAnimationActive={!reduced} animationDuration={900}>
                  {incomeData.map((d, i) => (<Cell key={i} fill={d.faculty ? "#C9A227" : "#9aa0ab"} />))}
                  <LabelList dataKey="value" position="top" formatter={(v: number) => formatINR(v)} style={{ fill: "#161B26", fontWeight: 600, fontSize: 13 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid gap-4">
          <MetricRow label="Per-class rate" solo={rate.solo} faculty={rate.faculty} unit="₹/class" />
          <MetricRow label="Steady students / month" solo={vol.solo} faculty={vol.faculty} unit="students" />
        </div>
      </div>

      <p className="mt-6 max-w-3xl text-xs leading-relaxed text-ink/50">
        Solo per-class rates from Delhi market rates, 2026; solo income reflects
        typical roster instability and unpaid admin time. Faculty figures
        projected at a full roster. Going solo, your per-class rate can match
        ours — but you carry the empty weeks, the no-shows, and the admin. We
        trade volatility for a full, steady roster.
      </p>
    </Section>
  );
}
