"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Avatar from "@/components/ui/Avatar";
import {
  submitGuessAction,
  revealPostAction,
} from "@/app/groups/[groupId]/post/[postId]/actions";

export interface MysteryGuess {
  username: string;
  avatar_color: string;
  guess: string;
  correct: boolean;
}

interface MysterySectionProps {
  postId: string;
  mealName: string;
  isPoster: boolean;
  initialRevealed: boolean;
  initialMyGuess: string | null;
  guesses: MysteryGuess[];
}

export default function MysterySection({
  postId,
  mealName,
  isPoster,
  initialRevealed,
  initialMyGuess,
  guesses,
}: MysterySectionProps) {
  const [guessText, setGuessText] = useState("");
  const [myGuess, setMyGuess] = useState(initialMyGuess);
  const [revealed, setRevealed] = useState(initialRevealed);
  const [isPending, startTransition] = useTransition();

  const handleSubmitGuess = () => {
    if (!guessText.trim()) return;
    const trimmed = guessText.trim();
    startTransition(async () => {
      const result = await submitGuessAction(postId, trimmed);
      if (!result.error) setMyGuess(trimmed);
    });
  };

  const handleReveal = () => {
    startTransition(async () => {
      const result = await revealPostAction(postId);
      if (!result.error) setRevealed(true);
    });
  };

  if (revealed) {
    return (
      <div className="flex flex-col gap-2">
        <AnimatePresence>
          <motion.p
            key="meal-name"
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="font-display text-lg text-text"
          >
            {mealName}
          </motion.p>
        </AnimatePresence>
        {guesses.length > 0 && (
          <div className="flex flex-col gap-1.5 mt-0.5">
            {guesses.map((g) => (
              <div key={g.username} className="flex items-center gap-2 text-sm">
                <Avatar
                  username={g.username}
                  color={g.avatar_color}
                  size="sm"
                  className="w-5 h-5 text-[10px]"
                />
                <span className="text-muted flex-1 truncate">
                  {g.username}:{" "}
                  <span className="text-text italic">"{g.guess}"</span>
                </span>
                <span className="shrink-0">{g.correct ? "✅" : "❌"}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (isPoster) {
    return (
      <div className="flex items-center justify-between gap-3">
        <p className="font-display text-lg text-text leading-snug">{mealName}</p>
        <button
          onClick={handleReveal}
          disabled={isPending}
          className="shrink-0 text-sm font-medium text-accent hover:text-accent-hover transition-colors min-h-[44px] px-1 flex items-center"
        >
          {isPending ? "Revealing…" : "Reveal to friends →"}
        </button>
      </div>
    );
  }

  if (myGuess) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-muted text-sm">🔒 Your guess:</span>
        <span className="text-sm font-medium text-text italic">"{myGuess}"</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-text">🕵️ What did they eat?</p>
      <div className="flex gap-2">
        <input
          type="text"
          value={guessText}
          onChange={(e) => setGuessText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmitGuess()}
          placeholder="Type your guess…"
          className="flex-1 rounded-xl border border-border bg-bg px-3 py-2 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 min-h-[44px]"
        />
        <button
          onClick={handleSubmitGuess}
          disabled={isPending || !guessText.trim()}
          className="shrink-0 bg-accent text-white text-sm font-medium px-4 py-2 rounded-xl min-h-[44px] disabled:opacity-50 hover:bg-accent-hover transition-colors"
        >
          {isPending ? "…" : "Guess"}
        </button>
      </div>
    </div>
  );
}
