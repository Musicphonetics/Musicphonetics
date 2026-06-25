"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/Button";
import { signInAdmin, DEMO_ADMIN_PASSWORD } from "@/lib/admin-auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (signInAdmin(password)) {
      router.push("/admin");
    } else {
      setError(true);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-ink px-5">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo invert />
        </div>
        <div className="rounded-2xl border border-white/10 bg-white p-7 shadow-card-hover">
          <h1 className="text-xl font-semibold text-ink">Owner portal</h1>
          <p className="mt-1 text-sm text-ink/60">
            Enter the password to access the dashboard.
          </p>

          <form onSubmit={handleSubmit} className="mt-6">
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              autoFocus
              placeholder="••••••••"
              className="w-full rounded-xl border border-hairline bg-paper px-4 py-3 text-sm text-ink focus:border-ink focus:outline-none"
            />
            {error && (
              <p className="mt-2 text-sm text-red-600">
                Incorrect password. Try again.
              </p>
            )}
            <div className="mt-5">
              <Button type="submit" variant="primary" size="lg" fullWidth>
                Sign in
              </Button>
            </div>
          </form>

          {/* Demo helper — remove before launch */}
          <p className="mt-5 rounded-lg bg-mist px-3 py-2 text-xs text-ink/55">
            Demo password: <code className="font-semibold">{DEMO_ADMIN_PASSWORD}</code>
          </p>
        </div>
      </div>
    </div>
  );
}
