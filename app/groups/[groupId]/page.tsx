import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PostCard, { type PostData } from "@/components/feed/PostCard";
import GroupNav from "@/components/groups/GroupNav";
import LastGroupSetter from "@/components/groups/LastGroupSetter";
import Link from "next/link";

export const revalidate = 0;

export default async function FeedPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Verify membership
  const { data: membership } = await supabase
    .from("group_members")
    .select("group_id")
    .eq("group_id", groupId)
    .eq("user_id", user.id)
    .single();

  if (!membership) redirect("/groups");

  // Fetch group info
  const { data: group } = await supabase
    .from("groups")
    .select("id, name, admin_id, photo_url")
    .eq("id", groupId)
    .single();

  if (!group) redirect("/groups");

  // Fetch posts with author profile
  const { data: rawPosts } = await supabase
    .from("posts")
    .select("*, profiles(username, avatar_color)")
    .eq("group_id", groupId)
    .order("created_at", { ascending: false })
    .limit(30);

  // Fetch reactions
  const postIds = (rawPosts ?? []).map((p) => p.id);
  const { data: allReactions } = postIds.length
    ? await supabase
        .from("reactions")
        .select("post_id, emoji, user_id")
        .in("post_id", postIds)
    : { data: [] };

  // Fetch comment counts
  const { data: commentCounts } = postIds.length
    ? await supabase
        .from("comments")
        .select("post_id")
        .in("post_id", postIds)
    : { data: [] };

  // Fetch current user's guesses on mystery posts
  const mysteryPostIds = (rawPosts ?? [])
    .filter((p) => p.mystery_mode)
    .map((p) => p.id);

  const { data: myGuessRows } = mysteryPostIds.length
    ? await supabase
        .from("guesses")
        .select("post_id, guess")
        .in("post_id", mysteryPostIds)
        .eq("user_id", user.id)
    : { data: [] };

  // Fetch all guesses for revealed mystery posts (to show leaderboard)
  const revealedPostIds = (rawPosts ?? [])
    .filter((p) => p.mystery_mode && p.revealed)
    .map((p) => p.id);

  const { data: allGuessRows } = revealedPostIds.length
    ? await supabase
        .from("guesses")
        .select("post_id, guess, user_id, profiles(username, avatar_color)")
        .in("post_id", revealedPostIds)
    : { data: [] };

  const reactionMap = new Map<string, Map<string, { count: number; userReacted: boolean }>>();
  (allReactions ?? []).forEach((r) => {
    if (!reactionMap.has(r.post_id)) reactionMap.set(r.post_id, new Map());
    const emojiMap = reactionMap.get(r.post_id)!;
    const existing = emojiMap.get(r.emoji) ?? { count: 0, userReacted: false };
    emojiMap.set(r.emoji, {
      count: existing.count + 1,
      userReacted: existing.userReacted || r.user_id === user.id,
    });
  });

  const commentCountMap = new Map<string, number>();
  (commentCounts ?? []).forEach((c) => {
    commentCountMap.set(c.post_id, (commentCountMap.get(c.post_id) ?? 0) + 1);
  });

  const myGuessMap = new Map<string, string>();
  (myGuessRows ?? []).forEach((g) => myGuessMap.set(g.post_id, g.guess));

  type GuessRow = NonNullable<typeof allGuessRows>[number];
  const guessesMap = new Map<string, GuessRow[]>();
  (allGuessRows ?? []).forEach((g) => {
    if (!guessesMap.has(g.post_id)) guessesMap.set(g.post_id, []);
    guessesMap.get(g.post_id)!.push(g);
  });

  const posts: PostData[] = (rawPosts ?? []).map((p) => ({
    ...p,
    reactions: Array.from(reactionMap.get(p.id)?.entries() ?? []).map(
      ([emoji, data]) => ({ emoji, ...data })
    ),
    comment_count: commentCountMap.get(p.id) ?? 0,
    myGuess: myGuessMap.get(p.id) ?? null,
    guesses: (guessesMap.get(p.id) ?? []).map((g) => {
      const gProfile = g.profiles as unknown as { username: string; avatar_color: string };
      return {
        username: gProfile.username,
        avatar_color: gProfile.avatar_color,
        guess: g.guess,
        correct: g.guess.trim().toLowerCase() === p.meal_name.trim().toLowerCase(),
      };
    }),
    revealed: p.revealed ?? false,
  }));

  // Fetch members for nav
  const { data: members } = await supabase
    .from("group_members")
    .select("profiles(username, avatar_color)")
    .eq("group_id", groupId)
    .limit(6);

  const memberProfiles = (members ?? []).map((m) => ({
    username: (m.profiles as unknown as { username: string; avatar_color: string }).username,
    avatar_color: (m.profiles as unknown as { username: string; avatar_color: string }).avatar_color,
  }));

  // Fetch all user's groups for switcher
  const { data: userGroupRows } = await supabase
    .from("group_members")
    .select("groups(id, name, photo_url)")
    .eq("user_id", user.id);

  const userGroups = (userGroupRows ?? []).map(
    (m) => m.groups as unknown as { id: string; name: string; photo_url: string | null }
  );

  return (
    <div className="min-h-screen bg-bg pb-24">
      <LastGroupSetter groupId={groupId} />
      <GroupNav
        group={group}
        groups={userGroups}
        members={memberProfiles}
        currentUserId={user.id}
        isAdmin={group.admin_id === user.id}
      />

      <main className="max-w-lg mx-auto px-4 py-4 flex flex-col gap-4">
        {posts.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center gap-4">
            <h2 className="font-display text-2xl text-text">Nothing yet!</h2>
            <p className="text-muted text-sm max-w-xs">
              Be the first to share what you're eating. Draw something — it
              doesn't have to be perfect.
            </p>
            <Link
              href={`/groups/${groupId}/draw`}
              className="mt-2 inline-flex items-center gap-2 bg-accent text-white px-6 py-3 rounded-xl font-medium text-sm hover:bg-accent-hover transition-colors"
            >
              Draw your meal
            </Link>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} currentUserId={user.id} />
          ))
        )}
      </main>
    </div>
  );
}
