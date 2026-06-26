"use client";

import { useEffect, useState } from "react";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/Button";
import { OwnerDashboard } from "@/components/owner/OwnerDashboard";
import { isOwnerAuthed, signInOwner } from "@/lib/owner-auth";

export default function OwnerPage() {
  const [authed, setAuthed] = useState(false);
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    setAuthed(isOwnerAuthed());
    setReady(true);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (signInOwner(password)) {
      setAuthed(true);
      setError(false);
    } else {
      setError(true);
    }
  }

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center bg-mist text-ink/50">
        Loading…
      </div>
    );
  }

  if (authed) return <OwnerDashboard />;

  return (
    <div className="grid min-h-screen place-items-center bg-ink px-5">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo invert />
        </div>
        <div className="rounded-2xl border border-white/10 bg-white p-7 shadow-card-hover">
          <h1 className="text-xl font-semibold text-ink">Owner portal</h1>
          <p className="mt-1 text-sm text-ink/60">
            Enter the owner password to access the dashboard.
          </p>
          <form onSubmit={handleSubmit} className="mt-6">
            <label htmlFor="owner-password" className="mb-1.5 block text-sm font-medium text-ink">
              Password
            </label>
            <input
              id="owner-password"
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
              <p className="mt-2 text-sm text-red-600">Incorrect password. Try again.</p>
            )}
            <div className="mt-5">
              <Button type="submit" variant="primary" size="lg" fullWidth>
                Sign in
              </Button>
            </div>
          </form>
        </div>
        <p className="mt-4 text-center text-xs text-paper/40">
          Protected area · Musicphonetics
        </p>
      </div>
    </div>
  );
}
