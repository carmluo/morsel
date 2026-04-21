"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { cn, REACTION_EMOJIS } from "@/lib/utils";

interface ReactionCount {
  emoji: string;
  count: number;
  userReacted: boolean;
}

interface ReactionBarProps {
  postId: string;
  initialReactions: ReactionCount[];
  userId: string | null;
}

export default function ReactionBar({
  postId,
  initialReactions,
  userId,
}: ReactionBarProps) {
  const [reactions, setReactions] = useState<ReactionCount[]>(() => {
    const map = new Map<string, ReactionCount>();
    REACTION_EMOJIS.forEach((e) =>
      map.set(e, { emoji: e, count: 0, userReacted: false })
    );
    initialReactions.forEach((r) => map.set(r.emoji, r));
    return [...map.values()];
  });
  const [bursts, setBursts] = useState<{ id: number; emoji: string }[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const burstIdRef = { current: 0 };

  const triggerReaction = useCallback(
    async (emoji: string) => {
      if (!userId) return;

      const supabase = createClient();
      const existing = reactions.find((r) => r.emoji === emoji);
      const alreadyReacted = existing?.userReacted ?? false;

      // Optimistic update
      setReactions((prev) =>
        prev.map((r) =>
          r.emoji === emoji
            ? {
                ...r,
                count: alreadyReacted ? Math.max(0, r.count - 1) : r.count + 1,
                userReacted: !alreadyReacted,
              }
            : r
        )
      );

      if (!alreadyReacted) {
        // Burst animation
        const burstId = ++burstIdRef.current;
        setBursts((b) => [...b, { id: burstId, emoji }]);
      }

      if (alreadyReacted) {
        await supabase
          .from("reactions")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", userId)
          .eq("emoji", emoji);
      } else {
        await supabase.from("reactions").upsert({
          post_id: postId,
          user_id: userId,
          emoji,
        });
      }

      setShowPicker(false);
    },
    [postId, userId, reactions]
  );

  return (
    <div className="relative flex items-center gap-1 flex-wrap">
      {reactions
        .filter((r) => r.count > 0 || REACTION_EMOJIS.includes(r.emoji))
        .map((r) => (
          <button
            key={r.emoji}
            onClick={() => triggerReaction(r.emoji)}
            disabled={!userId}
            className={cn(
              "flex items-center gap-1 px-2.5 py-1.5 rounded-full text-sm transition-all duration-150",
              "border min-h-[36px]",
              r.userReacted
                ? "bg-accent/10 border-accent/30 text-text"
                : "bg-bg border-border hover:border-muted text-text",
              !userId && "pointer-events-none"
            )}
          >
            <span>{r.emoji}</span>
            {r.count > 0 && (
              <span className="text-xs text-muted tabular-nums">{r.count}</span>
            )}
          </button>
        ))}

      {/* Burst animations — contained to parent card via overflow-hidden on parent */}
      <AnimatePresence>
        {bursts.map(({ id, emoji }) => (
          <motion.span
            key={id}
            className="absolute left-0 bottom-full pointer-events-none text-xl select-none"
            initial={{ y: 0, opacity: 1, scale: 1 }}
            animate={{ y: -50, opacity: 0, scale: 1.5 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            onAnimationComplete={() =>
              setBursts((b) => b.filter((x) => x.id !== id))
            }
          >
            {emoji}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}
