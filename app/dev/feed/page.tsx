"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Avatar from "@/components/ui/Avatar";
import { formatRelativeTime, REACTION_EMOJIS, cn } from "@/lib/utils";

interface DevPost {
  id: string;
  drawing_url: string;
  meal_name: string;
  caption: string | null;
  created_at: string;
  profiles: { username: string; avatar_color: string };
  reactions: Record<string, number>;
  comments: { id: string; username: string; color: string; text: string; ts: string }[];
}

const MOCK_POSTS: DevPost[] = [
  {
    id: "mock-1",
    drawing_url: "https://placehold.co/400x400/FFD6E0/FF8FA3?text=🍜",
    meal_name: "Spicy miso ramen",
    caption: "desk lunch hits different when you drew it yourself",
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    profiles: { username: "yuki", avatar_color: "#A8D8EA" },
    reactions: { "🤤": 2, "🔥": 1 },
    comments: [
      { id: "c1", username: "mira", color: "#FFD166", text: "ok this actually looks amazing", ts: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
    ],
  },
  {
    id: "mock-2",
    drawing_url: "https://placehold.co/400x400/D6EEF8/A8D8EA?text=🥑",
    meal_name: "Avocado toast",
    caption: "basic and proud",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    profiles: { username: "mira", avatar_color: "#FFD166" },
    reactions: { "💅": 3 },
    comments: [],
  },
  {
    id: "mock-3",
    drawing_url: "https://placehold.co/400x400/FFF3CD/FFD166?text=🍕",
    meal_name: "Leftover pizza",
    caption: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    profiles: { username: "sam", avatar_color: "#B7E4C7" },
    reactions: { "😭": 2 },
    comments: [
      { id: "c2", username: "yuki", color: "#A8D8EA", text: "the sad pizza energy 😭", ts: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString() },
    ],
  },
];

export default function DevFeedPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<DevPost[]>([]);

  useEffect(() => {
    const local = JSON.parse(localStorage.getItem("dev_posts") ?? "[]").map(
      (p: Omit<DevPost, "reactions" | "comments">) => ({
        ...p,
        reactions: {},
        comments: [],
      })
    );
    setPosts([...local, ...MOCK_POSTS]);
  }, []);

  const addReaction = (postId: string, emoji: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id !== postId
          ? p
          : {
              ...p,
              reactions: {
                ...p.reactions,
                [emoji]: (p.reactions[emoji] ?? 0) + 1,
              },
            }
      )
    );
  };

  const addComment = (postId: string, text: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id !== postId
          ? p
          : {
              ...p,
              comments: [
                ...p.comments,
                {
                  id: crypto.randomUUID(),
                  username: "you",
                  color: "#FF8FA3",
                  text,
                  ts: new Date().toISOString(),
                },
              ],
            }
      )
    );
  };

  return (
    <div className="min-h-screen bg-bg pb-24">
      <header className="sticky top-0 z-10 bg-bg/90 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <button onClick={() => router.push("/dev")} className="text-muted hover:text-text transition-colors min-h-[44px] min-w-[44px] flex items-center">
            ←
          </button>
          <h1 className="font-display text-xl text-text">Lunch Club 🥗</h1>
          <button onClick={() => router.push("/dev/widget")} className="text-muted hover:text-text transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
            🪟
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 flex flex-col gap-4">
        {posts.map((post) => (
          <DevPostCard
            key={post.id}
            post={post}
            onReact={(emoji) => addReaction(post.id, emoji)}
            onComment={(text) => addComment(post.id, text)}
          />
        ))}
      </main>

      <button
        onClick={() => router.push("/dev/draw")}
        className="fixed bottom-6 right-6 w-14 h-14 bg-accent text-white rounded-full shadow-lg flex items-center justify-center text-2xl hover:bg-accent-hover active:scale-95 transition-all z-10"
      >
        ✏️
      </button>
    </div>
  );
}

function DevPostCard({
  post,
  onReact,
  onComment,
}: {
  post: DevPost;
  onReact: (emoji: string) => void;
  onComment: (text: string) => void;
}) {
  const [bursts, setBursts] = useState<{ id: number; emoji: string }[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const burstId = { current: 0 };

  const handleReact = (emoji: string) => {
    onReact(emoji);
    const id = ++burstId.current;
    setBursts((b) => [...b, { id, emoji }]);
  };

  return (
    <article className="bg-surface rounded-2xl shadow-card overflow-hidden animate-slide-up">
      <div className="relative aspect-square w-full bg-bg">
        <Image
          src={post.drawing_url}
          alt={post.meal_name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, 560px"
          unoptimized
        />
      </div>

      <div className="px-4 pt-4 pb-3 flex flex-col gap-3">
        <div className="flex items-center gap-2.5">
          <Avatar username={post.profiles.username} color={post.profiles.avatar_color} size="sm" />
          <span className="text-sm font-medium text-text">{post.profiles.username}</span>
          <span className="text-xs text-muted">· {formatRelativeTime(post.created_at)}</span>
        </div>

        <div>
          <p className="font-display text-lg text-text">{post.meal_name}</p>
          {post.caption && <p className="text-sm text-muted mt-0.5">{post.caption}</p>}
        </div>

        {/* Reactions */}
        <div className="relative flex items-center gap-1 flex-wrap overflow-visible">
          {REACTION_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleReact(emoji)}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1.5 rounded-full text-sm border min-h-[36px] transition-all",
                (post.reactions[emoji] ?? 0) > 0
                  ? "bg-accent/10 border-accent/30"
                  : "bg-bg border-border hover:border-muted"
              )}
            >
              {emoji}
              {(post.reactions[emoji] ?? 0) > 0 && (
                <span className="text-xs text-muted">{post.reactions[emoji]}</span>
              )}
            </button>
          ))}

          <AnimatePresence>
            {bursts.map(({ id, emoji }) => (
              <motion.span
                key={id}
                className="absolute left-0 bottom-full pointer-events-none text-xl"
                initial={{ y: 0, opacity: 1, scale: 1 }}
                animate={{ y: -50, opacity: 0, scale: 1.5 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                onAnimationComplete={() => setBursts((b) => b.filter((x) => x.id !== id))}
              >
                {emoji}
              </motion.span>
            ))}
          </AnimatePresence>
        </div>

        {/* Comments */}
        <button
          onClick={() => setShowComments((s) => !s)}
          className="text-xs text-muted hover:text-text transition-colors text-left min-h-[36px] flex items-center gap-1"
        >
          💬 {post.comments.length > 0 ? post.comments.length : "Add"} comment{post.comments.length !== 1 ? "s" : ""}
        </button>

        {showComments && (
          <div className="flex flex-col gap-3 pt-1 border-t border-border">
            {post.comments.map((c) => (
              <div key={c.id} className="flex gap-2 items-start">
                <Avatar username={c.username} color={c.color} size="sm" />
                <div className="bg-bg rounded-xl rounded-tl-sm px-3 py-2 flex-1">
                  <span className="text-xs font-medium text-text mr-2">{c.username}</span>
                  <span className="text-sm text-text">{c.text}</span>
                </div>
              </div>
            ))}
            <div className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && commentText.trim()) {
                    onComment(commentText.trim());
                    setCommentText("");
                  }
                }}
                placeholder="Add a comment…"
                className="flex-1 px-3 py-2.5 rounded-xl border border-border bg-bg text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent min-h-[44px]"
              />
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
