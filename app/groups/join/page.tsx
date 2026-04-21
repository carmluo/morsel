"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { joinGroupAction } from "./actions";

function JoinForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [code, setCode] = useState(searchParams.get("code") ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError("");

    const result = await joinGroupAction(code);
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push(`/groups/${result.groupId}`);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🔗</div>
          <h1 className="font-display text-3xl text-text">Join a group</h1>
          <p className="text-muted text-sm mt-1">
            Paste the invite code your friend shared.
          </p>
        </div>

        <form
          onSubmit={handleJoin}
          className="bg-surface rounded-2xl shadow-card p-8 flex flex-col gap-5"
        >
          <Input
            label="Invite code"
            placeholder="MORSEL01"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={8}
            error={error}
            autoFocus
            className="tracking-widest font-mono text-center text-lg"
          />
          <Button type="submit" size="lg" loading={loading} className="w-full">
            Join group
          </Button>
          <button
            type="button"
            onClick={() => router.back()}
            className="text-sm text-muted text-center hover:text-text transition-colors"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense>
      <JoinForm />
    </Suspense>
  );
}
