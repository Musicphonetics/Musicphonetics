"use client";

import { useState } from "react";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { whatsappLink } from "@/lib/data";

// Same Web3Forms inbox as the student lead form; the subject line distinguishes
// faculty applications from student leads.
const WEB3FORMS_ACCESS_KEY = "1a5d9694-46b9-4236-8ced-1b68b65b5097";

const AREAS = [
  "South Delhi",
  "Gurugram",
  "Noida",
  "Faridabad",
  "Ghaziabad",
  "Online",
];

const field =
  "w-full rounded-xl border border-hairline bg-white px-4 py-3 text-sm text-ink placeholder:text-ink/40 focus:border-ink focus-visible:outline-2 focus-visible:outline-gold focus:outline-none";

type Status = "idle" | "sending" | "success" | "error";

export function FacultyApplication() {
  const [status, setStatus] = useState<Status>("idle");
  const [areas, setAreas] = useState<string[]>([]);

  const toggleArea = (a: string) =>
    setAreas((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    // Honeypot — if filled, silently treat as success (drop the bot).
    if ((fd.get("botcheck") as string)?.length) {
      setStatus("success");
      return;
    }
    const get = (k: string) => ((fd.get(k) as string) || "").trim();
    const name = get("name");
    const phone = get("phone");
    const instrument = get("instrument");
    if (name.length < 2 || phone.replace(/\D/g, "").length < 10 || !instrument) {
      setStatus("error");
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: `New Faculty Application — ${name} (${instrument})`,
          from_name: "Musicphonetics Careers",
          botcheck: "",
          ...(get("email") ? { email: get("email") } : {}),
          Name: name,
          WhatsApp: phone,
          Email: get("email") || "—",
          "Primary instrument": instrument,
          "Other instruments": get("otherInstruments") || "—",
          "Years teaching": get("yearsTeaching") || "—",
          "Years playing": get("yearsPlaying") || "—",
          "Areas they can teach": areas.length ? areas.join(", ") : "—",
          Availability: get("availability") || "—",
          "Short bio": get("bio") || "—",
          "Why they want to teach": get("whyTeach") || "—",
          "CV link": get("cvLink") || "—",
          "Demo video link": get("videoLink") || "—",
        }),
      });
      const data = (await res.json().catch(() => ({ success: false }))) as { success?: boolean };
      if (!res.ok || data.success === false) throw new Error("send failed");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <Section id="apply" background="paper" spacing="lg">
        <div className="mx-auto max-w-xl rounded-3xl border border-hairline bg-white p-8 text-center shadow-card sm:p-10">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-feature-green/10 text-feature-green">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h3 className="mt-5 font-display text-2xl font-semibold text-ink">Application received.</h3>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink/70">
            Thank you — we&apos;ll review it and be in touch on WhatsApp. Selection
            is by our seven-stage process, so please allow a few days.
          </p>
          <div className="mt-6 flex justify-center">
            <Button href={whatsappLink("Hi Musicphonetics, I've just submitted a faculty application.")} external variant="primary" size="lg">
              Message us on WhatsApp
            </Button>
          </div>
        </div>
      </Section>
    );
  }

  return (
    <Section id="apply" background="paper" spacing="lg">
      <SectionHeading
        eyebrow="Apply to teach"
        title="Tell us about you."
        intro="A few details to start. No file uploads needed — just share links to your CV and a short demo video."
      />
      <form onSubmit={onSubmit} className="mt-10 rounded-3xl border border-hairline bg-white p-6 shadow-card sm:p-8">
        {/* Honeypot (hidden from humans) */}
        <input type="text" name="botcheck" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" name="name" required placeholder="Your name" />
          <Field label="Phone / WhatsApp" name="phone" required placeholder="+91…" inputMode="tel" />
          <Field label="Email" name="email" type="email" placeholder="you@email.com" inputMode="email" />
          <Field label="Primary instrument" name="instrument" required placeholder="e.g. Guitar" />
          <Field label="Other instruments" name="otherInstruments" placeholder="e.g. Ukulele, Piano" />
          <Field label="Years teaching" name="yearsTeaching" placeholder="e.g. 5" inputMode="numeric" />
          <Field label="Years playing" name="yearsPlaying" placeholder="e.g. 12" inputMode="numeric" />
          <Field label="Availability" name="availability" placeholder="e.g. Weekday evenings, weekends" />
        </div>

        {/* Areas */}
        <fieldset className="mt-5">
          <legend className="mb-2 block text-sm font-medium text-ink">Areas you can teach</legend>
          <div className="flex flex-wrap gap-2">
            {AREAS.map((a) => {
              const on = areas.includes(a);
              return (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleArea(a)}
                  aria-pressed={on}
                  className={
                    "min-h-[44px] rounded-full border px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-gold " +
                    (on
                      ? "border-deep-gold bg-gold/15 text-ink"
                      : "border-hairline bg-paper text-ink/70 hover:border-ink/40")
                  }
                >
                  {a}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="CV link (Google Drive / PDF URL)" name="cvLink" type="url" placeholder="https://…" />
          <Field label="Demo video link (YouTube / Drive URL)" name="videoLink" type="url" placeholder="https://…" />
        </div>

        <div className="mt-5">
          <TextArea label="Short bio" name="bio" placeholder="Training, qualifications, performance background…" />
        </div>
        <div className="mt-5">
          <TextArea label="Why do you want to teach with us?" name="whyTeach" placeholder="A few honest lines." />
        </div>

        {status === "error" && (
          <div className="mt-5 rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-semibold">That didn&apos;t go through.</p>
            <p className="mt-1 text-red-700/80">
              Check your name, WhatsApp, and instrument and try again — or{" "}
              <a
                href={whatsappLink("Hi Musicphonetics, I'd like to apply to teach.")}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#7A5E0F] underline underline-offset-2"
              >
                apply on WhatsApp
              </a>
              .
            </p>
          </div>
        )}

        <div className="mt-6">
          <Button type="submit" variant="primary" size="lg" fullWidth>
            {status === "sending" ? "Sending…" : "Submit application"}
          </Button>
          <p className="mt-3 text-center text-xs text-ink/65">
            We review every application and reply on WhatsApp. Selection is by our
            seven-stage process.
          </p>
        </div>
      </form>
    </Section>
  );
}

function Field({
  label, name, required, placeholder, type = "text", inputMode,
}: {
  label: string; name: string; required?: boolean; placeholder?: string;
  type?: string; inputMode?: "tel" | "email" | "numeric" | "url" | "text";
}) {
  const id = `fa-${name}`;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {label}{required && <span className="text-[#7A5E0F]"> *</span>}
      </label>
      <input id={id} name={name} type={type} required={required} placeholder={placeholder} inputMode={inputMode} className={field} />
    </div>
  );
}

function TextArea({ label, name, placeholder }: { label: string; name: string; placeholder?: string }) {
  const id = `fa-${name}`;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">{label}</label>
      <textarea id={id} name={name} rows={4} placeholder={placeholder} className={field} />
    </div>
  );
}
