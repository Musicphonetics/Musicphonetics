"use client";

import { Badge } from "@/components/ui/Badge";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { LEAD_SOURCES } from "@/lib/types";

function CopyBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-hairline bg-paper p-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-deep-gold">
        {title}
      </p>
      <pre className="whitespace-pre-wrap font-body text-sm leading-relaxed text-ink/80">
        {children}
      </pre>
    </div>
  );
}

function BotCard({
  code,
  title,
  badge,
  children,
}: {
  code: string;
  title: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-hairline bg-white p-6 shadow-card">
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-lg bg-ink px-2.5 py-1 font-mono text-xs font-semibold text-paper">
          {code}
        </span>
        <h3 className="text-lg font-semibold text-ink">{title}</h3>
        {badge && <Badge tone="gold">{badge}</Badge>}
      </div>
      <div className="mt-4 space-y-4 text-sm leading-relaxed text-ink/75">
        {children}
      </div>
    </div>
  );
}

export function AutomationMap() {
  return (
    <div className="space-y-8">
      {/* Intro */}
      <div className="rounded-2xl border border-hairline bg-white p-6 shadow-card">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-xl font-semibold text-ink">
            WATI / Astra Automation Map
          </h2>
          <Badge tone="green">Internal documentation</Badge>
        </div>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink/65">
          The WhatsApp bot journey from first message to human handover. Each
          stage saves structured fields to the People / Leads sheet, then routes
          the lead onward. Gabriel (Astra) and Director Abhishek take over for
          the human-led close.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-semibold text-ink/60">
          {["BOT_00", "BOT_01", "BOT_02", "BOT_03", "BOT_04", "BOT_05", "BOT_06"].map(
            (b, i, arr) => (
              <span key={b} className="flex items-center gap-2">
                <span className="rounded-md bg-mist px-2 py-1">{b}</span>
                {i < arr.length - 1 && <span className="text-gold">→</span>}
              </span>
            )
          )}
        </div>
      </div>

      {/* BOT_00 */}
      <BotCard code="BOT_00" title="Welcome" badge="Sets expectation">
        <p>Greets the lead, sets expectation, and sends them into Discovery.</p>
        <CopyBlock title="Welcome message">
{`👋 Welcome to Musicphonetics.

Thank you for reaching out.

To help us recommend the right learning path, you'll go through a short guided conversation that takes about a minute.

Once that's complete, one of our team members will personally continue with you.

Let's begin.`}
        </CopyBlock>
      </BotCard>

      {/* BOT_01 */}
      <BotCard code="BOT_01" title="Discovery">
        <div>
          <p className="font-semibold text-ink">
            Q1. Where did you first come across Musicphonetics?
          </p>
          <p className="mt-1 text-xs text-ink/50">
            Saves: <code className="rounded bg-mist px-1 py-0.5">lead_source</code>
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {LEAD_SOURCES.map((s) => (
              <Badge key={s} tone="muted">
                {s}
              </Badge>
            ))}
          </div>
        </div>
        <div>
          <p className="font-semibold text-ink">
            Q2. Are you already familiar with Musicphonetics?
          </p>
          <p className="mt-1 text-xs text-ink/50">
            Saves: <code className="rounded bg-mist px-1 py-0.5">brand_awareness</code>
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge tone="muted">Yes, I&apos;m familiar</Badge>
            <Badge tone="muted">No, I&apos;d like to know more</Badge>
          </div>
        </div>
        <div className="rounded-xl border border-hairline bg-paper p-4 text-xs text-ink/70">
          <p>
            <span className="font-semibold">Routing:</span> If familiar →{" "}
            <span className="font-mono">BOT_03 Qualification</span>. If not
            familiar → <span className="font-mono">BOT_02 Brand Experience</span>.
          </p>
        </div>
      </BotCard>

      {/* BOT_02 */}
      <BotCard code="BOT_02" title="Brand Experience" badge="For new leads">
        <p>
          Shown to leads who want to know more, before qualification. Mixes
          message copy with media placeholders, then moves to qualification.
        </p>
        <CopyBlock title="Brand belief">
{`Musicphonetics was built around one belief:

Music should never feel random.

Every student deserves structured, personal guidance from the very beginning.`}
        </CopyBlock>
        <CopyBlock title="What makes us different">
{`What makes us different?

• Carefully selected teachers
• One-to-one personalised learning
• Director-led philosophy
• Long-term musical growth
• Personal attention throughout the journey`}
        </CopyBlock>
        <div className="grid gap-3 sm:grid-cols-3">
          <ImagePlaceholder label="Voice note placeholder" aspect="square" />
          <ImagePlaceholder label="Brand video placeholder" aspect="square" />
          <ImagePlaceholder label="PDF brochure placeholder" aspect="square" />
        </div>
      </BotCard>

      {/* BOT_03 */}
      <BotCard code="BOT_03" title="Qualification" badge="Writes to Leads sheet">
        <p>Collects the structured fields used for matching and recommendation.</p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {[
            "Full name",
            "Who are classes for?",
            "What are you interested in?",
            "Instrument",
            "Area",
            "Experience",
            "Goal",
          ].map((q) => (
            <li key={q} className="flex items-center gap-2 rounded-lg border border-hairline px-3 py-2">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden="true" />
              {q}
            </li>
          ))}
        </ul>
        <p className="text-xs text-ink/50">
          Writes to the People / Leads sheet (mirrors the People table fields).
        </p>
      </BotCard>

      {/* BOT_04 */}
      <BotCard code="BOT_04" title="Recommendation" badge="Saves package_selected">
        <p>
          Presents the three learning paths and saves{" "}
          <code className="rounded bg-mist px-1 py-0.5">package_selected</code>.
        </p>
        <CopyBlock title="Packages message">
{`Great! Here's how students begin with us — three simple ways:

A · The Foundation
Steady start, trained teacher, two classes a week.
Rs 1,200/class · Rs 9,600/mo

B · The Transformation (most chosen)
Everything in Foundation, plus our Director from day one + a monthly session with him.
Rs 1,500/class · Rs 12,000/mo — about Rs 50 a day.

C · The Director's Circle
Learn from the Director himself, by prior booking.
Rs 2,800/class · Rs 20,000 for 8.`}
        </CopyBlock>
      </BotCard>

      {/* BOT_05 */}
      <BotCard code="BOT_05" title="Gabriel" badge="Astra sales handover">
        <p>
          Gabriel is the voice of Musicphonetics after package selection. Gabriel
          continues the conversation and{" "}
          <span className="font-semibold text-ink">does not restart qualification</span>.
        </p>
        <div className="rounded-xl border border-hairline bg-paper p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-deep-gold">
            Gabriel · scope
          </p>
          <p className="mt-2 leading-relaxed">
            Gabriel reinforces trust, guides toward B or C where suitable, and
            then hands final confirmation to Director Abhishek. Gabriel never
            confirms final teacher, final slot, final fee, or booking.
          </p>
        </div>
      </BotCard>

      {/* BOT_06 */}
      <BotCard code="BOT_06" title="Director" badge="Human confirmation">
        <p>
          Director Abhishek provides human confirmation of the final fee,
          teacher, slot, and booking — the only stage where these are locked in.
        </p>
      </BotCard>
    </div>
  );
}
