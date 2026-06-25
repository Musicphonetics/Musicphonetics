"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { whatsappLink } from "@/lib/data";

/**
 * Apply-to-teach form placeholder.
 * TODO(integration): wire submission to Google Sheets / Apps Script / email.
 * For v1 this validates locally and routes the applicant to WhatsApp.
 */
export function TeachForm() {
  const [submitted, setSubmitted] = useState(false);

  const fieldClasses =
    "w-full rounded-xl border border-hairline bg-white px-4 py-3 text-sm text-ink placeholder:text-ink/40 focus:border-ink focus:outline-none";

  if (submitted) {
    return (
      <div className="rounded-2xl border border-hairline bg-white p-8 text-center shadow-card">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-feature-green/10 text-feature-green">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 className="mt-4 text-xl font-semibold text-ink">
          Thank you for your interest.
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink/65">
          This is a demo form — submissions are not yet stored. To apply right
          now, continue the conversation with us on WhatsApp and our team will
          take it forward.
        </p>
        <div className="mt-6 flex justify-center">
          <Button
            href={whatsappLink("Hi Musicphonetics, I'd like to apply to teach.")}
            external
            variant="primary"
            size="lg"
          >
            Continue on WhatsApp
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
      className="rounded-2xl border border-hairline bg-white p-6 shadow-card sm:p-8"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-1">
          <label htmlFor="t-name" className="mb-1.5 block text-sm font-medium text-ink">
            Full name
          </label>
          <input id="t-name" name="name" required placeholder="Your name" className={fieldClasses} />
        </div>
        <div className="sm:col-span-1">
          <label htmlFor="t-phone" className="mb-1.5 block text-sm font-medium text-ink">
            Phone / WhatsApp
          </label>
          <input id="t-phone" name="phone" required placeholder="+91…" className={fieldClasses} />
        </div>
        <div className="sm:col-span-1">
          <label htmlFor="t-instruments" className="mb-1.5 block text-sm font-medium text-ink">
            Instruments you teach
          </label>
          <input id="t-instruments" name="instruments" required placeholder="e.g. Guitar, Piano" className={fieldClasses} />
        </div>
        <div className="sm:col-span-1">
          <label htmlFor="t-areas" className="mb-1.5 block text-sm font-medium text-ink">
            Areas you can teach in
          </label>
          <input id="t-areas" name="areas" placeholder="e.g. South Delhi, Online" className={fieldClasses} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="t-experience" className="mb-1.5 block text-sm font-medium text-ink">
            Tell us about your experience
          </label>
          <textarea
            id="t-experience"
            name="experience"
            rows={4}
            placeholder="Years teaching, qualifications, performance background…"
            className={fieldClasses}
          />
        </div>
      </div>

      <p className="mt-4 text-xs text-ink/50">
        Demo form — submissions are not stored yet. We&apos;ll route you to
        WhatsApp to continue.
      </p>

      <div className="mt-5">
        <Button type="submit" variant="primary" size="lg" fullWidth>
          Apply to teach
        </Button>
      </div>
    </form>
  );
}
