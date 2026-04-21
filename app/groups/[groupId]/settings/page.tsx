import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Avatar from "@/components/ui/Avatar";
import InviteCard from "@/components/groups/InviteCard";
import GroupPhotoEditor from "@/components/groups/GroupPhotoEditor";
import DeleteGroupButton from "@/components/groups/DeleteGroupButton";

export const revalidate = 0;

export default async function SettingsPage({
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

  const { data: group } = await supabase
    .from("groups")
    .select("id, name, invite_code, admin_id, photo_url")
    .eq("id", groupId)
    .single();

  if (!group || group.admin_id !== user.id) redirect(`/groups/${groupId}`);

  const { data: members } = await supabase
    .from("group_members")
    .select("user_id, joined_at, profiles(username, avatar_color)")
    .eq("group_id", groupId);

  const handleRemoveMember = async (memberId: string) => {
    "use server";
    if (memberId === user.id) return;
    const sb = await createServerClient();
    await sb
      .from("group_members")
      .delete()
      .eq("group_id", groupId)
      .eq("user_id", memberId);
    redirect(`/groups/${groupId}/settings`);
  };

  return (
    <div className="min-h-screen bg-bg pb-24">
      <header className="sticky top-0 z-10 bg-bg/90 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center gap-3">
        <Link
          href={`/groups/${groupId}`}
          className="text-muted hover:text-text transition-colors p-1 -ml-1 min-h-[44px] min-w-[44px] flex items-center"
        >
          ←
        </Link>
        <h1 className="font-display text-xl text-text">Group settings</h1>
      </header>

      <main className="max-w-sm mx-auto px-4 py-6 flex flex-col gap-6">
        {/* Group photo */}
        <section className="bg-surface rounded-2xl shadow-card p-5">
          <GroupPhotoEditor
            groupId={groupId}
            currentPhotoUrl={group.photo_url ?? null}
          />
        </section>

        {/* Invite */}
        <section>
          <h2 className="font-display text-lg text-text mb-3">{group.name}</h2>
          <InviteCard groupId={groupId} inviteCode={group.invite_code} />
        </section>

        {/* Members */}
        <section>
          <h2 className="font-display text-lg text-text mb-3">
            Members ({members?.length ?? 0})
          </h2>
          <div className="flex flex-col gap-2">
            {(members ?? []).map((m) => {
              const profile = m.profiles as unknown as {
                username: string;
                avatar_color: string;
              };
              const isAdmin = m.user_id === user.id;
              return (
                <div
                  key={m.user_id}
                  className="flex items-center gap-3 bg-surface rounded-xl shadow-card px-4 py-3"
                >
                  <Avatar
                    username={profile.username}
                    color={profile.avatar_color}
                    size="sm"
                  />
                  <span className="flex-1 text-sm font-medium text-text">
                    {profile.username}
                  </span>
                  {isAdmin && (
                    <span className="text-xs text-muted bg-bg px-2 py-1 rounded-full">
                      admin
                    </span>
                  )}
                  {!isAdmin && (
                    <form action={handleRemoveMember.bind(null, m.user_id)}>
                      <button className="text-xs text-red-500 hover:text-red-700 transition-colors min-h-[36px] px-2">
                        Remove
                      </button>
                    </form>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Danger zone */}
        <section>
          <DeleteGroupButton groupId={groupId} />
        </section>
      </main>
    </div>
  );
}
