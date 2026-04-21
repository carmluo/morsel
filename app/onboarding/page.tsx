"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

const AVATAR_COLORS = [
  "#FF8FA3", "#A8D8EA", "#FFD166", "#06D6A0",
  "#C77DFF", "#FB8500", "#8ECAE6", "#B7E4C7",
];

export default function OnboardingPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [color, setColor] = useState(AVATAR_COLORS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
    if (!trimmed || trimmed.length < 2) {
      setError("Username must be at least 2 characters (letters, numbers, _)");
      return;
    }

    setLoading(true);
    setError("");

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth/login"); return; }

    const { error } = await supabase.from("profiles").insert({
      id: user.id,
      username: trimmed,
      avatar_color: color,
    });

    if (error) {
      setError(
        error.code === "23505"
          ? "That username is taken — try another!"
          : error.message
      );
      setLoading(false);
      return;
    }

    router.push("/groups");
  };

  const preview = username.trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl text-text mb-1">Welcome!</h1>
          <p className="text-muted text-sm">Pick a name for your friends to see.</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-surface rounded-2xl shadow-card p-8 flex flex-col gap-6 animate-slide-up"
        >
          {/* Avatar preview */}
          <div className="flex flex-col items-center gap-4">
            <span
              className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-medium transition-colors duration-200"
              style={{ backgroundColor: color }}
            >
              {preview}
            </span>
            <div className="flex gap-2 flex-wrap justify-center">
              {AVATAR_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-8 h-8 rounded-full transition-transform duration-100 hover:scale-110"
                  style={{
                    backgroundColor: c,
                    outline: color === c ? `3px solid ${c}` : "none",
                    outlineOffset: "2px",
                  }}
                  aria-label={`Pick color ${c}`}
                />
              ))}
            </div>
          </div>

          <Input
            label="Username"
            placeholder="lunchqueen"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={error}
            autoFocus
            maxLength={20}
          />

          <Button type="submit" size="lg" loading={loading} className="w-full">
            Let's eat
          </Button>
        </form>
      </div>
    </div>
  );
}
