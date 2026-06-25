import Link from "next/link";
import { Logo } from "@/components/layout/Logo";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-paper px-5 text-center">
      <div>
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <p className="eyebrow">Page not found</p>
        <h1 className="mt-3 font-display text-5xl font-semibold text-ink">404</h1>
        <p className="mx-auto mt-4 max-w-md text-ink/65">
          The page you&apos;re looking for has moved or never existed. Let&apos;s
          get you back on the path.
        </p>
        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-ink px-7 py-3.5 text-base font-semibold text-paper transition-colors hover:bg-[#0f131c]"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
