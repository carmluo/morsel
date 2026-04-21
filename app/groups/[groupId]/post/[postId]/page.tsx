import { createServerClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Avatar from "@/components/ui/Avatar";
import CommentSection from "@/components/feed/CommentSection";
import ReactionBar from "@/components/feed/ReactionBar";
import MysterySection from "@/components/feed/MysterySection";
import { formatRelativeTime } from "@/lib/utils";

export const revalidate = 0;

export default async function PostPage({
  params,
}: {
  params: Promise<{ groupId: string; postId: string }>;
}) {
  const { groupId, postId } = await params;
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: post } = await supabase
    .from("posts")
    .select("*, profiles(username, avatar_color)")
    .eq("id", postId)
    .single();

  if (!post) notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, avatar_color")
    .eq("id", user.id)
    .single();

  const { data: rawReactions } = await supabase
    .from("reactions")
    .select("emoji, user_id")
    .eq("post_id", postId);

  const emojiMap = new Map<string, { count: number; userReacted: boolean }>();
  (rawReactions ?? []).forEach((r) => {
    const e = emojiMap.get(r.emoji) ?? { count: 0, userReacted: false };
    emojiMap.set(r.emoji, {
      count: e.count + 1,
      userReacted: e.userReacted || r.user_id === user.id,
    });
  });
  const reactions = Array.from(emojiMap.entries()).map(([emoji, d]) => ({
    emoji,
    ...d,
  }));

  const { data: rawComments } = await supabase
    .from("comments")
    .select("*, profiles(username, avatar_color)")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  // Fetch mystery guesses
  const { data: myGuessRow } = post.mystery_mode
    ? await supabase
        .from("guesses")
        .select("guess")
        .eq("post_id", postId)
        .eq("user_id", user.id)
        .single()
    : { data: null };

  const { data: allGuessRows } = post.mystery_mode && post.revealed
    ? await supabase
        .from("guesses")
        .select("guess, user_id, profiles(username, avatar_color)")
        .eq("post_id", postId)
    : { data: [] };

  const postAuthor = post.profiles as unknown as {
    username: string;
    avatar_color: string;
  };

  const guesses = (allGuessRows ?? []).map((g) => {
    const gp = g.profiles as unknown as { username: string; avatar_color: string };
    return {
      username: gp.username,
      avatar_color: gp.avatar_color,
      guess: g.guess,
      correct: g.guess.trim().toLowerCase() === post.meal_name.trim().toLowerCase(),
    };
  });

  return (
    <div className="min-h-screen bg-bg pb-10">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-bg/90 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center gap-3">
        <Link
          href={`/groups/${groupId}`}
          className="text-muted hover:text-text transition-colors p-1 -ml-1 min-h-[44px] min-w-[44px] flex items-center"
        >
          ←
        </Link>
        <h1 className="font-display text-xl text-text">
          {post.mystery_mode && !post.revealed ? "Mystery meal 🕵️" : post.meal_name}
        </h1>
      </header>

      <div className="max-w-lg mx-auto">
        {/* Drawing */}
        <div className="relative aspect-square w-full bg-bg">
          <Image
            src={post.drawing_url}
            alt={post.mystery_mode ? "Mystery meal" : post.meal_name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 560px"
            unoptimized={post.drawing_url.includes("placehold")}
          />
        </div>

        <div className="px-4 py-5 flex flex-col gap-5">
          {/* Author */}
          <div className="flex items-center gap-3">
            <Avatar
              username={postAuthor.username}
              color={postAuthor.avatar_color}
              size="md"
            />
            <div>
              <p className="font-medium text-text text-sm">
                {postAuthor.username}
              </p>
              <p className="text-xs text-muted">
                {formatRelativeTime(post.created_at)}
              </p>
            </div>
          </div>

          {/* Meal info */}
          <div className="flex flex-col gap-2">
            {post.mystery_mode ? (
              <MysterySection
                postId={postId}
                mealName={post.meal_name}
                isPoster={post.user_id === user.id}
                initialRevealed={post.revealed ?? false}
                initialMyGuess={myGuessRow?.guess ?? null}
                guesses={guesses}
              />
            ) : (
              <p className="font-display text-2xl text-text">{post.meal_name}</p>
            )}
            {post.caption && (!post.mystery_mode || post.revealed) && (
              <p className="text-sm text-muted mt-1">{post.caption}</p>
            )}
          </div>

          {/* Reactions */}
          <div className="relative overflow-visible">
            <ReactionBar
              postId={postId}
              initialReactions={reactions}
              userId={user.id}
            />
          </div>

          {/* Comments */}
          <div className="border-t border-border pt-5">
            <h2 className="font-display text-lg text-text mb-4">Comments</h2>
            <CommentSection
              postId={postId}
              initialComments={(rawComments ?? []) as any}
              currentUserId={user.id}
              currentUserProfile={profile}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
