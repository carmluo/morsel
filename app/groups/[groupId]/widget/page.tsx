import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import WidgetCarousel from "@/components/widget/WidgetCarousel";

export const revalidate = 0;

export default async function WidgetPage({
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

  const { data: membership } = await supabase
    .from("group_members")
    .select("group_id")
    .eq("group_id", groupId)
    .eq("user_id", user.id)
    .single();

  if (!membership) redirect("/groups");

  // Today's posts only
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { data: posts } = await supabase
    .from("posts")
    .select("id, drawing_url, meal_name, mystery_mode, profiles(username, avatar_color)")
    .eq("group_id", groupId)
    .gte("created_at", todayStart.toISOString())
    .order("created_at", { ascending: false });

  const widgetPosts = (posts ?? []).map((p) => ({
    ...p,
    profiles: p.profiles as unknown as { username: string; avatar_color: string },
  }));

  return (
    <div className="fixed inset-0 bg-[#1a1208] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-safe pt-4 pb-3 z-10">
        <span className="font-display text-white/80 text-lg">morsel</span>
        <Link
          href={`/groups/${groupId}`}
          className="text-white/60 hover:text-white transition-colors text-sm min-h-[44px] flex items-center"
        >
          Feed →
        </Link>
      </div>

      {/* Carousel */}
      <div className="flex-1 relative">
        <WidgetCarousel posts={widgetPosts} />
      </div>

      {/* Footer */}
      <div className="px-5 pb-safe pb-6 text-center">
        <p className="text-white/30 text-xs">
          Today's meals · {widgetPosts.length} drawing
          {widgetPosts.length !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}
