import Link from "next/link";
import Image from "next/image";
import Avatar from "@/components/ui/Avatar";
import ReactionBar from "@/components/feed/ReactionBar";
import MysterySection, { type MysteryGuess } from "@/components/feed/MysterySection";
import { formatRelativeTime } from "@/lib/utils";

export interface PostData {
  id: string;
  drawing_url: string;
  meal_name: string;
  caption: string | null;
  mystery_mode: boolean;
  revealed: boolean;
  created_at: string;
  user_id: string;
  group_id: string;
  profiles: {
    username: string;
    avatar_color: string;
  };
  reactions: {
    emoji: string;
    count: number;
    userReacted: boolean;
  }[];
  comment_count: number;
  myGuess: string | null;
  guesses: MysteryGuess[];
}

interface PostCardProps {
  post: PostData;
  currentUserId: string | null;
}

export default function PostCard({ post, currentUserId }: PostCardProps) {
  const isPoster = currentUserId === post.user_id;

  return (
    <article className="bg-surface rounded-2xl shadow-card overflow-hidden animate-slide-up">
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

      {/* Content */}
      <div className="px-4 pt-4 pb-3 flex flex-col gap-3">
        {/* Author + time */}
        <div className="flex items-center gap-2.5">
          <Avatar
            username={post.profiles.username}
            color={post.profiles.avatar_color}
            size="sm"
          />
          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium text-text">
              {post.profiles.username}
            </span>
            {" · "}
            <span className="text-xs text-muted">
              {formatRelativeTime(post.created_at)}
            </span>
          </div>
        </div>

        {/* Meal name area */}
        <div>
          {post.mystery_mode ? (
            <MysterySection
              postId={post.id}
              mealName={post.meal_name}
              isPoster={isPoster}
              initialRevealed={post.revealed}
              initialMyGuess={post.myGuess}
              guesses={post.guesses}
            />
          ) : (
            <p className="font-display text-lg text-text leading-snug">
              {post.meal_name}
            </p>
          )}
          {post.caption && !post.mystery_mode && (
            <p className="text-sm text-muted mt-0.5 leading-relaxed">
              {post.caption}
            </p>
          )}
          {post.caption && post.mystery_mode && post.revealed && (
            <p className="text-sm text-muted mt-0.5 leading-relaxed">
              {post.caption}
            </p>
          )}
        </div>

        {/* Reactions + comment link */}
        <div className="flex items-end justify-between gap-3">
          <div className="relative overflow-visible flex-1">
            <ReactionBar
              postId={post.id}
              initialReactions={post.reactions}
              userId={currentUserId}
            />
          </div>
          <Link
            href={`/groups/${post.group_id}/post/${post.id}`}
            className="text-xs text-muted hover:text-text transition-colors shrink-0 min-h-[36px] flex items-center gap-1"
          >
            💬 {post.comment_count > 0 ? post.comment_count : "Add"} comment
            {post.comment_count !== 1 ? "s" : ""}
          </Link>
        </div>
      </div>
    </article>
  );
}
