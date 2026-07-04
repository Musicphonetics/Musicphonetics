import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Payment not completed",
  robots: { index: false, follow: false },
};

export default function PayRetryPage() {
  return (
    <section className="flex min-h-[70vh] items-center bg-ink py-16 text-paper">
      <div className="container-mp">
        <div className="mx-auto max-w-md rounded-3xl border border-white/12 bg-white/[0.05] p-8 text-center backdrop-blur-md">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-gold/40 text-gold">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 8v5M12 16.5v.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </div>
          <h1 className="mt-5 font-display text-2xl font-semibold">That payment didn&apos;t complete.</h1>
          <p className="mt-3 text-sm leading-relaxed text-paper/70">
            No money moves on an incomplete payment. You can try again in a
            minute — or message us and we&apos;ll sort it out together.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Button href="/pay" variant="light" size="lg" fullWidth>Try again</Button>
            <Button href="/support" variant="secondary" size="lg" fullWidth className="border-white/25 text-paper hover:border-white">
              Get help — we reply immediately
            </Button>
          </div>
          <p className="mt-5 text-xs text-paper/50">
            Charged but seeing this page? Don&apos;t pay twice — <Link href="/support" className="text-gold underline underline-offset-2">contact us</Link> and we&apos;ll verify it instantly.
          </p>
        </div>
      </div>
    </section>
  );
}
