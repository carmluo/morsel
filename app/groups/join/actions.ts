"use server";

import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function joinGroupAction(
  code: string
): Promise<{ groupId?: string; error?: string }> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const admin = createAdminClient();

  const { data: group } = await admin
    .from("groups")
    .select("id, name")
    .eq("invite_code", code.trim().toUpperCase())
    .single();

  if (!group) return { error: "That code doesn't match any group." };

  const { error } = await admin.from("group_members").upsert({
    group_id: group.id,
    user_id: user.id,
  });

  if (error) return { error: error.message };

  return { groupId: group.id };
}
