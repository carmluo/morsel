"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-5">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="font-display text-5xl text-text mb-2">morsel</h1>
          <p className="text-muted text-sm">Draw what you eat.</p>
        </div>

        {sent ? (
          <div className="bg-surface rounded-2xl shadow-card p-8 text-center animate-fade-in">
            <div className="text-4xl mb-4">📬</div>
            <h2 className="font-display text-2xl text-text mb-2">
              Check your email
            </h2>
            <p className="text-muted text-sm leading-relaxed">
              We sent a magic link to{" "}
              <span className="text-text font-medium">{email}</span>. Click it
              to sign in — no password needed.
            </p>
            <button
              onClick={() => setSent(false)}
              className="mt-6 text-sm text-muted underline underline-offset-2"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-surface rounded-2xl shadow-card p-8 flex flex-col gap-5 animate-fade-in"
          >
            <div>
              <h2 className="font-display text-2xl text-text mb-1">Sign in</h2>
              <p className="text-muted text-sm">
                We'll send you a magic link.
              </p>
            </div>

            <Input
              type="email"
              label="Email address"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              autoFocus
              error={error}
              required
            />

            <Button type="submit" size="lg" loading={loading} className="w-full">
              Send magic link
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
