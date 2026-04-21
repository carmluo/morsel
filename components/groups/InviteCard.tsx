"use client";

import { useState } from "react";

interface InviteCardProps {
  groupId: string;
  inviteCode: string;
}

export default function InviteCard({ groupId, inviteCode }: InviteCardProps) {
  const [copied, setCopied] = useState<"link" | "code" | null>(null);

  const link =
    typeof window !== "undefined"
      ? `${window.location.origin}/groups/join?code=${inviteCode}`
      : `https://morsel.app/groups/join?code=${inviteCode}`;

  const copy = async (type: "link" | "code") => {
    await navigator.clipboard.writeText(type === "link" ? link : inviteCode);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="bg-bg rounded-2xl border border-border p-4 flex flex-col gap-3">
      <p className="text-sm font-medium text-text">Invite friends</p>

      {/* Code */}
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-surface rounded-xl border border-border px-4 py-3">
          <p className="text-xs text-muted mb-0.5">Invite code</p>
          <p className="font-mono font-bold text-lg text-text tracking-widest">
            {inviteCode}
          </p>
        </div>
        <button
          onClick={() => copy("code")}
          className="px-4 py-3 rounded-xl bg-accent/10 text-accent text-sm font-medium hover:bg-accent/20 transition-colors min-h-[44px]"
        >
          {copied === "code" ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Link */}
      <button
        onClick={() => copy("link")}
        className="text-sm text-muted hover:text-text transition-colors underline underline-offset-2 text-left"
      >
        {copied === "link" ? "✓ Link copied!" : "Copy invite link"}
      </button>
    </div>
  );
}
