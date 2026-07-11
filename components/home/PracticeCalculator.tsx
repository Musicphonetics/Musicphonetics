"use client";

import { useState } from "react";
import { SectionHeader } from "./SectionHeader";
import { WhatsAppCTA } from "./WhatsAppCTA";
import { WA_MSG } from "@/lib/home-config";
import { cn } from "@/lib/utils";

const INSTRUMENTS = ["Guitar", "Piano / Keyboard", "Vocals"];
const GOALS = ["Just for fun", "Play songs I love", "Perform on stage", "Trinity grades"];

// A little interactive "what will I actually achieve?" calculator - live numbers
// as you drag, so the visit feels like a game, not a brochure.
export function PracticeCalculator() {
  const [instrument, setInstrument] = useState(0);
  const [days, setDays] = useState(4);
  const [mins, setMins] = useState(30);
  const [goal, setGoal] = useState(1);

  const weeklyMin = days * mins;
  const monthlyHours = Math.round((weeklyMin * 4.33) / 60);
  const sixMonthHours = monthlyHours * 6;
  const songs = Math.max(1, Math.round(sixMonthHours / 5));

  const milestone =
    sixMonthHours < 20 ? { t: "Your first tunes", d: "Clean chords, simple melodies and a real practice habit." }
    : sixMonthHours < 50 ? { t: "Playing full songs", d: "You'll confidently play songs you love, start to finish." }
    : sixMonthHours < 90 ? { t: "Stage-ready", d: "Ready to perform at one of our open mics with a mentor beside you." }
    : { t: "Performance level", d: "Trinity grades and real stage performances well within reach." };

  const consistency = Math.min(100, Math.round((weeklyMin / 210) * 100)); // 210 min/wk ≈ ideal

  return (
    <section className="bg-paper py-14 sm:py-20">
      <div className="container-mp">
        <SectionHeader
          eyebrow="Try it · 30 seconds"
          title="See what you could achieve."
          sub="Move the sliders and watch your 6-month music journey add up. This is the plan we'd build with you."
          center
        />

        <div className="mx-auto mt-10 grid max-w-4xl gap-5 lg:grid-cols-[1fr_0.9fr]">
          {/* Controls */}
          <div className="rounded-3xl border border-hairline bg-white p-6 shadow-card sm:p-7">
            <Field label="I want to learn">
              <Segmented options={INSTRUMENTS} value={instrument} onChange={setInstrument} />
            </Field>
            <Field label={`I'll practise ${days} ${days === 1 ? "day" : "days"} a week`}>
              <Slider min={1} max={7} value={days} onChange={setDays} ariaLabel="Days of practice per week" />
            </Field>
            <Field label={`${mins} minutes each day`}>
              <Slider min={10} max={60} step={5} value={mins} onChange={setMins} ariaLabel="Minutes of practice each day" />
            </Field>
            <Field label="My goal">
              <Segmented options={GOALS} value={goal} onChange={setGoal} small />
            </Field>
          </div>

          {/* Live result */}
          <div className="flex flex-col rounded-3xl border border-gold/40 bg-gradient-to-b from-gold/[0.10] to-white p-6 shadow-card sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#7A5E0F]">In 6 months of {INSTRUMENTS[instrument].toLowerCase()}</p>
            <p className="mt-2 font-display text-5xl font-semibold text-ink">~{sixMonthHours}<span className="text-2xl font-normal text-ink/60"> hours</span></p>
            <p className="mt-1 text-sm text-ink/60">about <b className="text-ink">{monthlyHours} hrs/month</b> · roughly <b className="text-ink">{songs} songs</b> learned</p>

            <div className="mt-5">
              <div className="flex items-center justify-between text-xs text-ink/55">
                <span>Practice consistency</span><span className="font-semibold text-[#7A5E0F]">{consistency}%</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-mist">
                <span className="block h-full rounded-full bg-gold transition-all duration-300" style={{ width: `${consistency}%` }} />
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-hairline bg-white p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#7A5E0F]">You could reach</p>
              <p className="mt-1 font-display text-lg font-semibold text-ink">{milestone.t}</p>
              <p className="mt-0.5 text-sm leading-snug text-ink/65">{milestone.d}</p>
            </div>

            <div className="mt-5">
              <WhatsAppCTA fullWidth label="Start this plan" message={`Hi Musicphonetics, I'd like to start ${INSTRUMENTS[instrument]} - about ${days} days a week, ${mins} mins a day. My goal: ${GOALS[goal]}.`} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-5 first:mt-0">
      <p className="mb-2 text-sm font-semibold text-ink">{label}</p>
      {children}
    </div>
  );
}

function Segmented({ options, value, onChange, small }: { options: string[]; value: number; onChange: (i: number) => void; small?: boolean }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-2">
      {options.map((o, i) => (
        <button key={o} type="button" onClick={() => onChange(i)}
          className={cn("rounded-xl border px-3 py-2.5 text-left font-medium transition-colors", small ? "text-[0.82rem]" : "text-sm",
            value === i ? "border-gold bg-gold/10 text-ink" : "border-hairline text-ink/65 hover:border-ink/30")}>
          {o}
        </button>
      ))}
    </div>
  );
}

function Slider({ min, max, step = 1, value, onChange, ariaLabel }: { min: number; max: number; step?: number; value: number; onChange: (n: number) => void; ariaLabel: string }) {
  return (
    <input type="range" min={min} max={max} step={step} value={value} aria-label={ariaLabel} onChange={(e) => onChange(Number(e.target.value))}
      className="h-2 w-full cursor-pointer appearance-none rounded-full bg-mist accent-gold focus-visible:outline-2 focus-visible:outline-gold"
      style={{ background: `linear-gradient(90deg, #C9A227 ${((value - min) / (max - min)) * 100}%, #ECE8DF ${((value - min) / (max - min)) * 100}%)` }} />
  );
}
