"use client";

import { useState, useTransition } from "react";
import { deleteGroupAction } from "@/app/groups/group-actions";

export default function DeleteGroupButton({ groupId }: { groupId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteGroupAction(groupId);
      if (result?.error) setError(result.error);
    });
  };

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="w-full text-sm font-medium text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 rounded-2xl py-4 transition-colors min-h-[52px]"
      >
        Delete group
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-3 bg-red-50 border border-red-200 rounded-2xl p-5">
      <p className="text-sm font-medium text-red-700">Delete this group?</p>
      <p className="text-xs text-red-500 leading-relaxed">
        This permanently deletes the group, all posts, drawings, and comments.
        This cannot be undone.
      </p>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-xl py-3 transition-colors disabled:opacity-50 min-h-[44px]"
        >
          {isPending ? "Deleting…" : "Yes, delete"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={isPending}
          className="flex-1 bg-white border border-border text-text text-sm font-medium rounded-xl py-3 transition-colors min-h-[44px]"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
