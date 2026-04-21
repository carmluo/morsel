"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import { formatRelativeTime } from "@/lib/utils";

export interface CommentData {
  id: string;
  content: string;
  created_at: string;
  parent_id: string | null;
  user_id: string;
  profiles: {
    username: string;
    avatar_color: string;
  };
}

interface CommentSectionProps {
  postId: string;
  initialComments: CommentData[];
  currentUserId: string | null;
  currentUserProfile?: { username: string; avatar_color: string } | null;
}

export default function CommentSection({
  postId,
  initialComments,
  currentUserId,
  currentUserProfile,
}: CommentSectionProps) {
  const [comments, setComments] = useState(initialComments);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<CommentData | null>(null);
  const [posting, setPosting] = useState(false);

  const topLevel = comments.filter((c) => !c.parent_id);
  const replies = (parentId: string) =>
    comments.filter((c) => c.parent_id === parentId);

  const submit = async () => {
    if (!text.trim() || !currentUserId || !currentUserProfile) return;
    setPosting(true);

    const supabase = createClient();
    const { data, error } = await supabase
      .from("comments")
      .insert({
        post_id: postId,
        user_id: currentUserId,
        content: text.trim(),
        parent_id: replyTo?.id ?? null,
      })
      .select("*, profiles(username, avatar_color)")
      .single();

    if (!error && data) {
      setComments((prev) => [
        ...prev,
        data as unknown as CommentData,
      ]);
      setText("");
      setReplyTo(null);
    }
    setPosting(false);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Comment list */}
      {topLevel.length === 0 && (
        <p className="text-sm text-muted text-center py-4">
          No comments yet — be the first!
        </p>
      )}

      {topLevel.map((comment) => (
        <div key={comment.id}>
          <CommentBubble
            comment={comment}
            onReply={() => setReplyTo(comment)}
            isReplying={replyTo?.id === comment.id}
            currentUserId={currentUserId}
          />
          {/* Thread replies */}
          {replies(comment.id).map((reply) => (
            <div key={reply.id} className="ml-8 mt-2">
              <CommentBubble
                comment={reply}
                onReply={() => setReplyTo(comment)}
                isReplying={false}
                currentUserId={currentUserId}
              />
            </div>
          ))}
        </div>
      ))}

      {/* Input */}
      {currentUserId && (
        <div className="flex gap-3 items-start pt-2 border-t border-border">
          {currentUserProfile && (
            <Avatar
              username={currentUserProfile.username}
              color={currentUserProfile.avatar_color}
              size="sm"
            />
          )}
          <div className="flex-1 flex flex-col gap-2">
            {replyTo && (
              <p className="text-xs text-muted">
                Replying to{" "}
                <span className="font-medium text-text">
                  {replyTo.profiles.username}
                </span>{" "}
                <button
                  onClick={() => setReplyTo(null)}
                  className="text-accent hover:underline"
                >
                  cancel
                </button>
              </p>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && submit()}
                placeholder={
                  replyTo ? `Reply to ${replyTo.profiles.username}…` : "Add a comment…"
                }
                maxLength={300}
                className="flex-1 px-3 py-2.5 rounded-xl border border-border bg-bg text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent min-h-[44px]"
              />
              <Button size="sm" onClick={submit} loading={posting} disabled={!text.trim()}>
                Send
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CommentBubble({
  comment,
  onReply,
  isReplying,
  currentUserId,
}: {
  comment: CommentData;
  onReply: () => void;
  isReplying: boolean;
  currentUserId: string | null;
}) {
  return (
    <div className="flex gap-2.5 items-start">
      <Avatar
        username={comment.profiles.username}
        color={comment.profiles.avatar_color}
        size="sm"
      />
      <div className="flex-1">
        <div className="bg-bg rounded-xl rounded-tl-sm px-3 py-2">
          <span className="text-xs font-medium text-text mr-2">
            {comment.profiles.username}
          </span>
          <span className="text-sm text-text">{comment.content}</span>
        </div>
        <div className="flex items-center gap-3 mt-1 ml-1">
          <span className="text-xs text-muted">
            {formatRelativeTime(comment.created_at)}
          </span>
          {currentUserId && (
            <button
              onClick={onReply}
              className={`text-xs transition-colors ${
                isReplying ? "text-accent font-medium" : "text-muted hover:text-text"
              }`}
            >
              Reply
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
