"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Section, SectionHeading } from "@/components/ui/Section";
import { formatINR } from "@/lib/utils";
import {
  TEACHER_SHARE, AVG_BONUS, FEE_MIN, FEE_MAX, FEE_DEFAULT,
  STUDENTS_MIN, STUDENTS_MAX, STUDENTS_DEFAULT, CHART_STUDENT_STEPS,
} from "@/lib/teach-config";

function monthly(students: number, fee: number, bonus: boolean) {
  return students * fee * TEACHER_SHARE + (bonus ? AVG_BONUS : 0);
}

function useTweened(value: number): number {
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  useEffect(() => {
    if (reduced) { setDisplay(value); return; }
    const from = fromRef.current;
    const start = performance.now();
    const dur = 450;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (value - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, reduced]);
  return display;
}

export function EarningsCalculator() {
  const [students, setStudents] = useState(STUDENTS_DEFAULT);
  const [fee, setFee] = useState(FEE_DEFAULT);
  const [bonus, setBonus] = useState(false);

  const m = monthly(students, fee, bonus);
  const y = m * 12;
  const shownMonthly = useTweened(m);
  const shownYearly = useTweened(y);

  // Chart data — income by roster size at the chosen fee, current pick highlighted.
  const chartData = CHART_STUDENT_STEPS.map((n) => ({
    name: `${n}`,
    income: Math.round(monthly(n, fee, bonus)),
    current: n === students,
  }));

  return (
    <Section id="calculator" background="white" spacing="lg">
      <SectionHeading
        eyebrow="What you'll earn"
        title="You keep 70%. Here's what that becomes."
        intro="An honest projection tool — no hidden inflation, no guarantees. Move the sliders to explore. Actual earnings depend on your students and their fees."
      />

      <div className="mt-10 grid gap-6 rounded-3xl border border-hairline bg-paper p-6 shadow-card sm:p-8 lg:grid-cols-2 lg:gap-10">
        {/* Controls + headline number */}
        <div>
          <label className="block">
            <span className="flex items-baseline justify-between">
              <span className="text-sm font-semibold text-ink">Students on your roster</span>
              <span className="font-display text-2xl font-semibold text-[#7A5E0F]">{students}</span>
            </span>
            <input
              type="range" min={STUDENTS_MIN} max={STUDENTS_MAX} value={students}
              onChange={(e) => setStudents(Number(e.target.value))}
              className="mt-3 w-full accent-gold"
              aria-label="Number of students"
            />
            <span className="mt-1 flex justify-between text-xs text-ink/70"><span>{STUDENTS_MIN}</span><span>{STUDENTS_MAX}</span></span>
          </label>

          <label className="mt-7 block">
            <span className="flex items-baseline justify-between">
              <span className="text-sm font-semibold text-ink">Average monthly fee / student</span>
              <span className="font-display text-2xl font-semibold text-[#7A5E0F]">{formatINR(fee)}</span>
            </span>
            <input
              type="range" min={FEE_MIN} max={FEE_MAX} step={500} value={fee}
              onChange={(e) => setFee(Number(e.target.value))}
              className="mt-3 w-full accent-gold"
              aria-label="Average monthly fee per student"
            />
            <span className="mt-1 flex justify-between text-xs text-ink/70"><span>{formatINR(FEE_MIN)}</span><span>{formatINR(FEE_MAX)}</span></span>
            <span className="mt-1.5 block text-[11px] leading-tight text-ink/70">Representative — actual fees vary by student and arrangement.</span>
          </label>

          <label className="mt-7 flex items-center justify-between gap-4 rounded-xl border border-hairline bg-white px-4 py-3">
            <span>
              <span className="block text-sm font-semibold text-ink">Include an estimated monthly bonus</span>
              <span className="block text-[11px] text-ink/70">Illustrative {formatINR(AVG_BONUS)} — off by default so the base case is pure teaching income.</span>
            </span>
            <button
              type="button" role="switch" aria-checked={bonus} aria-label="Include estimated monthly bonus"
              onClick={() => setBonus((v) => !v)}
              className={"relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold " + (bonus ? "bg-gold" : "bg-ink/20")}
            >
              <span className={"absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all " + (bonus ? "left-[22px]" : "left-0.5")} />
            </button>
          </label>
        </div>

        {/* Output */}
        <div className="flex flex-col justify-center rounded-2xl border border-hairline bg-white p-6 sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#7A5E0F]">Estimated monthly income</p>
          <p className="mt-1 font-display text-4xl font-semibold text-ink sm:text-5xl">{formatINR(shownMonthly)}</p>
          <p className="mt-2 text-sm text-ink/70">Estimated annual · <span className="font-semibold text-ink/80">{formatINR(shownYearly)}</span></p>
          <div className="mt-5 rounded-xl bg-paper p-4">
            <p className="text-sm leading-relaxed text-ink/70">
              You keep <span className="font-semibold text-ink">70% of every fee</span>. Musicphonetics keeps 30% and runs everything else — students, payments, scheduling, brand.
            </p>
          </div>
          <p className="mt-4 font-mono text-[11px] leading-relaxed text-ink/65">
            {students} students × {formatINR(fee)} × 0.70{bonus ? ` + ${formatINR(AVG_BONUS)} bonus` : ""} = {formatINR(m)}/mo
          </p>
        </div>
      </div>

      {/* Chart — income by roster size (the honest compounding story) */}
      <div className="mt-6 rounded-3xl border border-hairline bg-paper p-6 shadow-card sm:p-8">
        <p className="text-sm font-semibold text-ink">Your monthly income by student count</p>
        <p className="mt-1 text-xs text-ink/70">At {formatINR(fee)}/student. Your current pick is highlighted. More students is the real lever — bars roughly double as your roster grows.</p>
        <div className="mt-6 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
              <XAxis dataKey="name" tickLine={false} axisLine={{ stroke: "#e5e0d5" }} tick={{ fill: "#161B26", fontSize: 12 }} label={{ value: "students", position: "insideBottom", offset: -2, fill: "#9a927f", fontSize: 11 }} />
              <YAxis tickFormatter={(v) => `₹${Math.round(v / 1000)}k`} tickLine={false} axisLine={false} tick={{ fill: "#5f5a4e", fontSize: 11 }} width={44} />
              <Tooltip
                cursor={{ fill: "rgba(201,162,39,0.08)" }}
                formatter={(v: number) => [formatINR(v), "Monthly"]}
                labelFormatter={(l) => `${l} students`}
                contentStyle={{ borderRadius: 12, border: "1px solid #e5e0d5", fontSize: 12 }}
              />
              <Bar dataKey="income" radius={[6, 6, 0, 0]}>
                {chartData.map((d) => (
                  <Cell key={d.name} fill={d.current ? "#C9A227" : "#d9d2c2"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-4 text-[11px] leading-relaxed text-ink/65">
          All figures are illustrative estimates based on the fixed 70% split. They are not guaranteed income. The only levers shown are more students, higher fees, tenure, and bonuses — there is no multi-level or recruit-from-recruits math anywhere on this page.
        </p>
      </div>
    </Section>
  );
}
