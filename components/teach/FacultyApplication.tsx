"use client";

import { useState } from "react";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { whatsappLink } from "@/lib/data";
import { INSTRUMENTS } from "@/lib/teach-config";
import { ApplicationSummary } from "@/components/teach/ApplicationSummary";
import { cn } from "@/lib/utils";

// The application is submitted to /api/teacher-application, which stores it and
// emails the owner the full details (including bank). No login is created here;
// the owner approves in the portal, and only then is a login + Offer Letter issued.

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TIME_BANDS = ["Morning", "Afternoon", "Evening", "Late evening"];
const MODES = ["At home", "Online", "At the centre"];
const AREAS = ["South Delhi", "Gurugram", "Noida", "Faridabad", "Ghaziabad", "Online"];

const field =
  "w-full rounded-xl border border-hairline bg-white px-4 py-3 text-sm text-ink placeholder:text-ink/40 focus:border-ink focus-visible:outline-2 focus-visible:outline-gold focus:outline-none";

type Status = "idle" | "sending" | "success" | "error";

const STEPS = ["About you", "Your music", "Availability", "Portfolio", "Bank & payout", "Consent"];

interface FormState {
  fullName: string; dob: string; gender: string; city: string; address: string;
  phone: string; email: string; languages: string;
  instruments: string[]; yearsTeaching: string; yearsPerforming: string;
  qualification: string; grade: string; philosophy: string;
  commitment: string; days: string[]; timeBands: string[]; modes: string[];
  areas: string[]; transport: string;
  bankHolder: string; bankName: string; bankAccount: string; bankIfsc: string; bankUpi: string;
  youtube: string; instagram: string; website: string; demo: string;
  ref1Name: string; ref1Phone: string; ref2Name: string; ref2Phone: string;
  idConsent: boolean; cTerms: boolean; cSheet: boolean; cSafeguard: boolean; cNonSolicit: boolean;
  whyJoin: string;
}

const EMPTY: FormState = {
  fullName: "", dob: "", gender: "", city: "", address: "", phone: "", email: "", languages: "",
  instruments: [], yearsTeaching: "", yearsPerforming: "", qualification: "", grade: "", philosophy: "",
  commitment: "", days: [], timeBands: [], modes: [], areas: [], transport: "",
  bankHolder: "", bankName: "", bankAccount: "", bankIfsc: "", bankUpi: "",
  youtube: "", instagram: "", website: "", demo: "", ref1Name: "", ref1Phone: "", ref2Name: "", ref2Phone: "",
  idConsent: false, cTerms: false, cSheet: false, cSafeguard: false, cNonSolicit: false, whyJoin: "",
};

export function FacultyApplication() {
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [f, setF] = useState<FormState>(EMPTY);
  const [appRef, setAppRef] = useState<string | null>(null);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setF((p) => ({ ...p, [k]: v }));
  const toggle = (k: "instruments" | "days" | "timeBands" | "modes" | "areas", v: string) =>
    setF((p) => ({ ...p, [k]: p[k].includes(v) ? p[k].filter((x) => x !== v) : [...p[k], v] }));

  function validateStep(s: number): string {
    if (s === 0) {
      if (f.fullName.trim().length < 2) return "Please enter your full name.";
      if (!f.dob) return "Please enter your date of birth.";
      if (!f.city.trim()) return "Please enter your city.";
      if (!f.address.trim()) return "Please enter your address.";
      if (f.phone.replace(/\D/g, "").length < 10) return "Please enter a valid phone number.";
      if (!/^\S+@\S+\.\S+$/.test(f.email)) return "Please enter a valid email.";
    }
    if (s === 1) {
      if (f.instruments.length === 0) return "Select at least one instrument you teach.";
      if (!f.yearsTeaching.trim()) return "Please enter your years teaching.";
    }
    if (s === 2) {
      if (!f.commitment) return "Please choose full-time or part-time.";
      if (f.days.length === 0) return "Select the days you're available.";
      if (f.timeBands.length === 0) return "Select your available time bands.";
      if (f.modes.length === 0) return "Select at least one teaching mode.";
      if (f.areas.length === 0) return "Select the areas you can cover.";
    }
    if (s === 4) {
      if (f.bankHolder.trim().length < 2) return "Please enter the bank account holder's name.";
      if (f.bankName.trim().length < 2) return "Please enter your bank name.";
      if (f.bankAccount.replace(/\s/g, "").length < 6) return "Please enter a valid account number.";
      if (!/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/.test(f.bankIfsc.trim())) return "Please enter a valid IFSC code.";
    }
    if (s === 5) {
      if (!f.idConsent) return "Please confirm you can provide government ID and consent to verification.";
      if (!(f.cTerms && f.cSheet && f.cSafeguard && f.cNonSolicit)) return "Please accept all four terms to continue.";
    }
    return "";
  }

  function next() {
    const err = validateStep(step);
    if (err) { setError(err); return; }
    setError("");
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }
  function back() { setError(""); setStep((s) => Math.max(s - 1, 0)); }

  async function submit() {
    const err = validateStep(5);
    if (err) { setError(err); return; }
    setError("");
    setStatus("sending");

    // Record the APPLICATION only. No login is created here - the owner reviews
    // and approves in the portal, and only then is a login + Offer Letter issued.
    // The server stores it and emails the owner the full details (incl. bank).
    try {
      const res = await fetch("/api/teacher-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: f.fullName, email: f.email, phone: f.phone, agreed: true,
          dob: f.dob, gender: f.gender, city: f.city, address: f.address, languages: f.languages,
          instruments: f.instruments, years_teaching: f.yearsTeaching, years_performing: f.yearsPerforming,
          qualification: f.qualification, grade: f.grade,
          commitment: f.commitment, days: f.days, time_bands: f.timeBands, modes: f.modes, areas: f.areas, transport: f.transport,
          bank_holder: f.bankHolder, bank_name: f.bankName, bank_account: f.bankAccount, bank_ifsc: f.bankIfsc, bank_upi: f.bankUpi,
          why_join: f.whyJoin,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; ref?: string; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error || "That didn't go through. Please try again, or apply on WhatsApp.");
        setStatus("idle");
        return;
      }
      setAppRef(data.ref || null);
    } catch {
      setError("That didn't go through. Please check your connection and try again.");
      setStatus("idle");
      return;
    }
    setStatus("success");
  }

  if (status === "success") {
    return (
      <Section id="apply" background="white" spacing="lg">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-feature-green/10 text-feature-green">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <h3 className="mt-5 font-display text-2xl font-semibold text-ink">Application received. It is now under review.</h3>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-ink/70">
            Below is a copy of the details you submitted, for your records. We review every application
            personally. If you are selected, we&apos;ll send your <b>Offer Letter</b> and portal login. You can save
            this confirmation as a PDF.
          </p>
          <div className="mt-5 flex justify-center">
            <Button href={whatsappLink("Hi Musicphonetics, I've just submitted my teacher application.")} external variant="primary" size="lg">
              Message us on WhatsApp
            </Button>
          </div>
        </div>

        <ApplicationSummary
          data={{
            fullName: f.fullName, dob: f.dob, gender: f.gender, city: f.city, address: f.address,
            phone: f.phone, email: f.email, languages: f.languages,
            instruments: f.instruments, yearsTeaching: f.yearsTeaching, yearsPerforming: f.yearsPerforming,
            qualification: f.qualification, grade: f.grade,
            commitment: f.commitment, days: f.days, timeBands: f.timeBands, modes: f.modes, areas: f.areas, transport: f.transport,
            bankHolder: f.bankHolder, bankName: f.bankName, bankAccount: f.bankAccount, bankIfsc: f.bankIfsc, bankUpi: f.bankUpi,
          }}
          reference={appRef}
        />
      </Section>
    );
  }

  return (
    <Section id="apply" background="white" spacing="lg">
      <SectionHeading
        eyebrow="Apply to teach"
        title="Your application."
        intro="A few short steps. At the end you get your joining letter and portal login, ready to print and sign."
      />

      <div className="mx-auto mt-10 max-w-2xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((label, i) => (
              <div key={label} className="flex flex-1 flex-col items-center">
                <span className={cn(
                  "grid h-8 w-8 place-items-center rounded-full text-xs font-semibold transition-colors",
                  i < step ? "bg-feature-green text-paper" : i === step ? "bg-gold text-ink" : "bg-mist text-ink/40"
                )}>
                  {i < step ? "✓" : i + 1}
                </span>
                <span className={cn("mt-1.5 hidden text-[11px] sm:block", i === step ? "font-semibold text-ink" : "text-ink/65")}>{label}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-mist">
            <div className="h-full rounded-full bg-gold transition-all duration-300" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
          </div>
        </div>

        <div className="rounded-3xl border border-hairline bg-paper p-6 shadow-card sm:p-8">
          {/* STEP 1 */}
          {step === 0 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Text label="Full name" req value={f.fullName} onChange={(v) => set("fullName", v)} placeholder="Your name" />
              <Text label="Date of birth" req type="date" value={f.dob} onChange={(v) => set("dob", v)} />
              <Select label="Gender (optional)" value={f.gender} onChange={(v) => set("gender", v)} options={["", "Female", "Male", "Prefer not to say"]} />
              <Text label="City" req value={f.city} onChange={(v) => set("city", v)} placeholder="e.g. New Delhi" />
              <div className="sm:col-span-2"><Text label="Full address" req value={f.address} onChange={(v) => set("address", v)} placeholder="House / street / locality / pin" /></div>
              <Text label="Phone / WhatsApp" req inputMode="tel" value={f.phone} onChange={(v) => set("phone", v)} placeholder="+91…" />
              <Text label="Email" req type="email" inputMode="email" value={f.email} onChange={(v) => set("email", v)} placeholder="you@email.com" />
              <div className="sm:col-span-2"><Text label="Languages spoken" value={f.languages} onChange={(v) => set("languages", v)} placeholder="e.g. Hindi, English, Punjabi" /></div>
              <p className="sm:col-span-2 text-xs text-ink/70">Photo and ID are collected securely after selection - not on this page.</p>
            </div>
          )}

          {/* STEP 2 */}
          {step === 1 && (
            <div className="space-y-5">
              <Chips label="Instruments you teach" req items={INSTRUMENTS} selected={f.instruments} onToggle={(v) => toggle("instruments", v)} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Text label="Years teaching" req inputMode="numeric" value={f.yearsTeaching} onChange={(v) => set("yearsTeaching", v)} placeholder="e.g. 5" />
                <Text label="Years performing" inputMode="numeric" value={f.yearsPerforming} onChange={(v) => set("yearsPerforming", v)} placeholder="e.g. 12" />
                <Text label="Highest qualification / certification" value={f.qualification} onChange={(v) => set("qualification", v)} placeholder="Trinity / Rockschool / Degree / Other" />
                <Text label="Grade (if any)" value={f.grade} onChange={(v) => set("grade", v)} placeholder="e.g. Grade 8" />
              </div>
              <Area label="Teaching philosophy (short)" value={f.philosophy} onChange={(v) => set("philosophy", v)} placeholder="How you teach, in a few honest lines." />
            </div>
          )}

          {/* STEP 3 */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <FieldLabel req>Commitment</FieldLabel>
                <div className="mt-2 flex gap-2">
                  {["Full-time", "Part-time"].map((c) => (
                    <ChipButton key={c} on={f.commitment === c} onClick={() => set("commitment", c)}>{c}</ChipButton>
                  ))}
                </div>
              </div>
              <Chips label="Days available" req items={DAYS} selected={f.days} onToggle={(v) => toggle("days", v)} />
              <Chips label="Time bands" req items={TIME_BANDS} selected={f.timeBands} onToggle={(v) => toggle("timeBands", v)} />
              <Chips label="Teaching modes" req items={MODES} selected={f.modes} onToggle={(v) => toggle("modes", v)} />
              <Chips label="Areas you can cover" req items={AREAS} selected={f.areas} onToggle={(v) => toggle("areas", v)} />
              <div>
                <FieldLabel>Own transport</FieldLabel>
                <div className="mt-2 flex gap-2">
                  {["Yes", "No"].map((c) => (
                    <ChipButton key={c} on={f.transport === c} onClick={() => set("transport", c)}>{c}</ChipButton>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-ink/70">All optional - but a demo link and references help us move faster.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Text label="YouTube" type="url" value={f.youtube} onChange={(v) => set("youtube", v)} placeholder="https://…" />
                <Text label="Instagram" type="url" value={f.instagram} onChange={(v) => set("instagram", v)} placeholder="https://…" />
                <Text label="Website" type="url" value={f.website} onChange={(v) => set("website", v)} placeholder="https://…" />
                <Text label="Demo video link" type="url" value={f.demo} onChange={(v) => set("demo", v)} placeholder="YouTube / Drive URL" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Text label="Reference 1 - name" value={f.ref1Name} onChange={(v) => set("ref1Name", v)} placeholder="Name" />
                <Text label="Reference 1 - phone" inputMode="tel" value={f.ref1Phone} onChange={(v) => set("ref1Phone", v)} placeholder="+91…" />
                <Text label="Reference 2 - name" value={f.ref2Name} onChange={(v) => set("ref2Name", v)} placeholder="Name" />
                <Text label="Reference 2 - phone" inputMode="tel" value={f.ref2Phone} onChange={(v) => set("ref2Phone", v)} placeholder="+91…" />
              </div>
            </div>
          )}

          {/* STEP 5 - Bank & payout */}
          {step === 4 && (
            <div className="space-y-4">
              <p className="text-sm text-ink/70">
                Your payouts go here. Fees are settled to this account within <b className="text-ink">T+2 business days</b>. All student fees are billed only in the Musicphonetics name - you never collect fees directly.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Text label="Account holder name" req value={f.bankHolder} onChange={(v) => set("bankHolder", v)} placeholder="As printed in your bank" />
                <Text label="Bank name" req value={f.bankName} onChange={(v) => set("bankName", v)} placeholder="e.g. HDFC Bank" />
                <Text label="Account number" req inputMode="numeric" value={f.bankAccount} onChange={(v) => set("bankAccount", v)} placeholder="Your account number" />
                <Text label="IFSC code" req value={f.bankIfsc} onChange={(v) => set("bankIfsc", v.toUpperCase())} placeholder="e.g. HDFC0001234" />
                <div className="sm:col-span-2"><Text label="UPI ID (optional)" value={f.bankUpi} onChange={(v) => set("bankUpi", v)} placeholder="name@bank" /></div>
              </div>
              <p className="text-xs text-ink/60">Kept private and used only for your payouts. Government ID is collected securely after selection.</p>
            </div>
          )}

          {/* STEP 6 - Consent */}
          {step === 5 && (
            <div className="space-y-4">
              <Check checked={f.idConsent} onChange={(v) => set("idConsent", v)}>
                I can provide government ID (Aadhaar / PAN) and I consent to police / background verification for student safeguarding. <span className="text-ink/70">(ID document images are shared securely after selection.)</span>
              </Check>
              <div className="rounded-2xl border border-hairline bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#7A5E0F]">I agree to the terms</p>
                <div className="mt-3 space-y-3">
                  <Check checked={f.cTerms} onChange={(v) => set("cTerms", v)}>My agreed fee share, settled T+2 business days via the company account.</Check>
                  <Check checked={f.cSheet} onChange={(v) => set("cSheet", v)}>Mandatory daily class-sheet updates.</Check>
                  <Check checked={f.cSafeguard} onChange={(v) => set("cSafeguard", v)}>The safeguarding code of conduct.</Check>
                  <Check checked={f.cNonSolicit} onChange={(v) => set("cNonSolicit", v)}>The 6-month non-solicitation of Musicphonetics students/parents on exit.</Check>
                </div>
                <p className="mt-3 text-xs text-ink/70">Full terms: <a href="/teach-with-us/terms" className="font-semibold text-[#7A5E0F] underline underline-offset-2">read them here</a>.</p>
              </div>
              <Area label="Why do you want to teach with Musicphonetics?" value={f.whyJoin} onChange={(v) => set("whyJoin", v)} placeholder="A few honest lines." />
            </div>
          )}

          {error && (
            <p className="mt-5 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</p>
          )}
          {status === "error" && (
            <p className="mt-5 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700">
              That didn&apos;t go through. Try again, or{" "}
              <a href={whatsappLink("Hi Musicphonetics, I'd like to apply to teach.")} target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-2">apply on WhatsApp</a>.
            </p>
          )}

          {/* Nav */}
          <div className="mt-7 flex items-center justify-between gap-3">
            <button type="button" onClick={back} disabled={step === 0}
              className="text-sm font-semibold text-ink/70 transition-colors hover:text-ink disabled:opacity-0">
              ← Back
            </button>
            {step < STEPS.length - 1 ? (
              <Button type="button" onClick={next} variant="primary" size="lg">Continue</Button>
            ) : (
              <Button type="button" onClick={submit} variant="primary" size="lg">
                {status === "sending" ? "Sending…" : "Submit Application"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ---- small field helpers ---- */

function FieldLabel({ children, req }: { children: React.ReactNode; req?: boolean }) {
  return <span className="block text-sm font-medium text-ink">{children}{req && <span className="text-[#7A5E0F]"> *</span>}</span>;
}

function Text({ label, value, onChange, req, placeholder, type = "text", inputMode }: {
  label: string; value: string; onChange: (v: string) => void; req?: boolean;
  placeholder?: string; type?: string; inputMode?: "tel" | "email" | "numeric" | "url" | "text";
}) {
  const id = `fa-${label.replace(/\W+/g, "-").toLowerCase()}`;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block"><FieldLabel req={req}>{label}</FieldLabel></label>
      <input id={id} type={type} inputMode={inputMode} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={field} />
    </div>
  );
}

function Area({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  const id = `fa-${label.replace(/\W+/g, "-").toLowerCase()}`;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block"><FieldLabel>{label}</FieldLabel></label>
      <textarea id={id} rows={3} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={field} />
    </div>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  const id = `fa-${label.replace(/\W+/g, "-").toLowerCase()}`;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block"><FieldLabel>{label}</FieldLabel></label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={field}>
        {options.map((o) => <option key={o} value={o}>{o || "Select…"}</option>)}
      </select>
    </div>
  );
}

function ChipButton({ children, on, onClick }: { children: React.ReactNode; on: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={on}
      className={cn(
        "min-h-[42px] rounded-full border px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-gold",
        on ? "border-deep-gold bg-gold/15 text-ink" : "border-hairline bg-white text-ink/70 hover:border-ink/40"
      )}>
      {children}
    </button>
  );
}

function Chips({ label, items, selected, onToggle, req }: {
  label: string; items: string[]; selected: string[]; onToggle: (v: string) => void; req?: boolean;
}) {
  return (
    <fieldset>
      <legend className="mb-2"><FieldLabel req={req}>{label}</FieldLabel></legend>
      <div className="flex flex-wrap gap-2">
        {items.map((it) => <ChipButton key={it} on={selected.includes(it)} onClick={() => onToggle(it)}>{it}</ChipButton>)}
      </div>
    </fieldset>
  );
}

function Check({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-ink/80">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-5 w-5 shrink-0 rounded border-hairline accent-gold focus-visible:outline-2 focus-visible:outline-gold" />
      <span>{children}</span>
    </label>
  );
}
