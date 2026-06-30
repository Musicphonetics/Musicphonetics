"use client";

import { useReducedMotion } from "framer-motion";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Section, SectionHeading } from "@/components/ui/Section";
import { YEAR_PROJECTION } from "@/lib/teach-econ";
import { formatINR } from "@/lib/utils";

const kFmt = (v: number) => `₹${Math.round(v / 1000)}k`;

function TooltipBox({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-hairline bg-white px-3 py-2 text-sm shadow-card">
      <div className="font-semibold text-ink">{label}</div>
      <div className="text-[#7A5E0F]">{formatINR(payload[0].value)}</div>
    </div>
  );
}

export function YearProjection() {
  const reduced = useReducedMotion();
  return (
    <Section background="paper" spacing="lg">
      <SectionHeading
        eyebrow="Projected"
        title="Your first year."
        intro="Income ramps as your roster fills, then steadies — with a visible step at month 6 and month 12 for loyalty payments."
      />
      <div className="mt-10 rounded-3xl border border-hairline bg-white p-5 shadow-card sm:p-7">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={YEAR_PROJECTION} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
              <defs>
                <linearGradient id="goldFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C9A227" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#C9A227" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(22,27,38,.08)" vertical={false} />
              <XAxis dataKey="m" tick={{ fontSize: 11, fill: "rgba(22,27,38,.55)" }} tickLine={false} axisLine={{ stroke: "rgba(22,27,38,.14)" }} />
              <YAxis tickFormatter={kFmt} tick={{ fontSize: 11, fill: "rgba(22,27,38,.55)" }} tickLine={false} axisLine={false} width={44} domain={[0, 80000]} />
              <Tooltip content={<TooltipBox />} />
              <Area type="monotone" dataKey="income" stroke="#C9A227" strokeWidth={2.5} fill="url(#goldFill)" isAnimationActive={!reduced} animationDuration={1100} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-4 text-xs text-ink/65">
          Projected. Includes six-month and annual loyalty payments. Illustrative
          only — actual income depends on roster and retention.
        </p>
      </div>
    </Section>
  );
}
