"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { createGroupAction } from "./actions";

export default function NewGroupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError("");

    const result = await createGroupAction(name.trim());
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
          <div className="text-5xl mb-3">🥘</div>
          <h1 className="font-display text-3xl text-text">Create a group</h1>
          <p className="text-muted text-sm mt-1">Give your lunch club a name.</p>
        </div>

        <form
          onSubmit={handleCreate}
          className="bg-surface rounded-2xl shadow-card p-8 flex flex-col gap-5"
        >
          <Input
            label="Group name"
            placeholder="e.g. Carmen's Lunch Club"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
            error={error}
            autoFocus
          />
          <Button type="submit" size="lg" loading={loading} className="w-full">
            Create group
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
