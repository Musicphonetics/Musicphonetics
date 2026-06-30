"use client";

import { useReducedMotion } from "framer-motion";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Section, SectionHeading } from "@/components/ui/Section";
import { ROSTER_RAMP } from "@/lib/teach-econ";
import { formatINR } from "@/lib/utils";

const kFmt = (v: number) => `₹${Math.round(v / 1000)}k`;

function TooltipBox({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-hairline bg-white px-3 py-2 text-sm shadow-card">
      <div className="font-semibold text-ink">{label}</div>
      <div className="text-[#7A5E0F]">{formatINR(payload[0].value)} / mo</div>
    </div>
  );
}

export function RosterRamp() {
  const reduced = useReducedMotion();
  return (
    <Section background="white" spacing="lg">
      <SectionHeading
        eyebrow="Projected"
        title="How your roster fills."
        intro="A new teacher's roster typically builds over the first weeks. This is an illustrative ramp."
      />
      <div className="mt-10 rounded-3xl border border-hairline bg-paper p-5 shadow-card sm:p-7">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ROSTER_RAMP} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(22,27,38,.08)" vertical={false} />
              <XAxis dataKey="stage" tick={{ fontSize: 11, fill: "#161B26" }} tickLine={false} axisLine={{ stroke: "rgba(22,27,38,.14)" }} interval={0} />
              <YAxis tickFormatter={kFmt} tick={{ fontSize: 11, fill: "rgba(22,27,38,.55)" }} tickLine={false} axisLine={false} width={44} />
              <Tooltip content={<TooltipBox />} cursor={{ fill: "rgba(201,162,39,.08)" }} />
              <Bar dataKey="income" radius={[8, 8, 0, 0]} isAnimationActive={!reduced} animationDuration={900}>
                {ROSTER_RAMP.map((_, i) => (<Cell key={i} fill="#C9A227" />))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-4 text-xs text-ink/65">Projected, blended package, 8 classes/student/month.</p>
      </div>
    </Section>
  );
}
