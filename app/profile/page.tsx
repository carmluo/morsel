import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import Avatar from "@/components/ui/Avatar";

export const revalidate = 0;

export default async function ProfilePage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, avatar_color")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/onboarding");

  const { data: posts } = await supabase
    .from("posts")
    .select("id, drawing_url, meal_name, created_at, group_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const handleSignOut = async () => {
    "use server";
    const sb = await createServerClient();
    await sb.auth.signOut();
    redirect("/auth/login");
  };

  return (
    <div className="min-h-screen bg-bg pb-24">
      <header className="px-4 pt-6 pb-4 border-b border-border">
        <div className="max-w-lg mx-auto flex items-center gap-4">
          <Avatar
            username={profile.username}
            color={profile.avatar_color}
            size="lg"
          />
          <div className="flex-1">
            <h1 className="font-display text-2xl text-text">{profile.username}</h1>
            <p className="text-sm text-muted">{posts?.length ?? 0} drawings</p>
          </div>
          <form action={handleSignOut}>
            <button className="text-sm text-muted hover:text-text transition-colors px-3 py-2 rounded-xl hover:bg-border min-h-[44px]">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4">
        {(!posts || posts.length === 0) ? (
          <div className="text-center py-16 flex flex-col items-center gap-3">
            <div className="text-5xl">🎨</div>
            <p className="font-display text-xl text-text">No drawings yet</p>
            <p className="text-sm text-muted">Share your first meal with a group!</p>
            <Link
              href="/groups"
              className="mt-2 text-sm text-accent hover:text-accent-hover transition-colors"
            >
              Go to your groups →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/groups/${post.group_id}/post/${post.id}`}
                className="aspect-square relative rounded-2xl overflow-hidden bg-bg hover:opacity-90 transition-opacity shadow-card"
              >
                <Image
                  src={post.drawing_url}
                  alt={post.meal_name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, 280px"
                  unoptimized={post.drawing_url.includes("placehold")}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-transparent px-2 py-2">
                  <p className="text-white text-xs font-medium truncate">{post.meal_name}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
