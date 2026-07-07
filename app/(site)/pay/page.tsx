import type { Metadata } from "next";
import { Suspense } from "react";
import { PayClient } from "@/components/pay/PayClient";

export const metadata: Metadata = {
  title: "Pay securely",
  description: "Pay for your Musicphonetics plan securely with Cashfree.",
  robots: { index: false, follow: false },
};

export default function PayPage() {
  return (
    <section className="relative flex min-h-[80vh] items-start overflow-hidden bg-ink py-14 text-paper sm:py-16">
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[-20%] h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-deep-gold/10 blur-[130px]" />
      <div className="container-mp relative">
        <Suspense fallback={<div className="min-h-[420px]" />}>
          <PayClient />
        </Suspense>
      </div>
    </section>
  );
}
