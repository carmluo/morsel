import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, ChevronRight } from "lucide-react";
import Avatar from "@/components/ui/Avatar";

export const revalidate = 0;

export default async function GroupsPage() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, avatar_color")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/onboarding");

  const { data: memberships } = await supabase
    .from("group_members")
    .select("groups(id, name, photo_url)")
    .eq("user_id", user.id);

  const groups = (memberships ?? []).map(
    (m) => m.groups as unknown as { id: string; name: string; photo_url: string | null }
  );

  const handleSignOut = async () => {
    "use server";
    const sb = await createServerClient();
    await sb.auth.signOut();
    redirect("/auth/login");
  };

  return (
    <div className="min-h-screen bg-bg pb-24">
      <header className="px-4 py-4 border-b border-border">
        <div className="max-w-sm mx-auto flex items-center justify-between">
          <h1 className="font-display text-3xl text-text">morsel</h1>
          <div className="flex items-center gap-3">
            <Avatar
              username={profile.username}
              color={profile.avatar_color}
              size="sm"
            />
            <form action={handleSignOut}>
              <button className="text-xs text-muted hover:text-text transition-colors">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-sm mx-auto px-4 py-6 flex flex-col gap-6">
        <div>
          <p className="text-muted text-sm mb-1">Hey, {profile.username}</p>
          <h2 className="font-display text-2xl text-text">Your groups</h2>
        </div>

        {groups.length === 0 ? (
          <div className="text-center py-12 flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-border flex items-center justify-center">
              <Users size={28} className="text-muted" />
            </div>
            <p className="text-muted text-sm max-w-xs">
              You're not in any groups yet. Create one and share the invite
              link with friends.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {groups.map((g) => (
              <Link
                key={g.id}
                href={`/groups/${g.id}`}
                className="flex items-center gap-4 bg-surface rounded-2xl shadow-card px-5 py-4 hover:shadow-card-hover transition-shadow"
              >
                {g.photo_url ? (
                  <img
                    src={g.photo_url}
                    alt={g.name}
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-border flex items-center justify-center shrink-0">
                    <Users size={18} className="text-muted" />
                  </div>
                )}
                <span className="font-medium text-text flex-1">{g.name}</span>
                <ChevronRight size={18} className="text-muted" />
              </Link>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link
            href="/groups/new"
            className="flex items-center justify-center gap-2 bg-accent text-white rounded-2xl py-4 font-medium text-sm hover:bg-accent-hover transition-colors min-h-[52px]"
          >
            + Create a group
          </Link>
          <Link
            href="/groups/join"
            className="flex items-center justify-center gap-2 bg-surface border border-border text-text rounded-2xl py-4 font-medium text-sm hover:border-muted transition-colors min-h-[52px]"
          >
            Join with a code
          </Link>
        </div>
      </main>
    </div>
  );
}
