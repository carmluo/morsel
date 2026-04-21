"use server";

import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function createGroupAction(
  name: string
): Promise<{ groupId?: string; error?: string }> {
  // Verify the user is authenticated
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  // Use admin client to bypass RLS for writes
  const admin = createAdminClient();

  const { data: group, error: gErr } = await admin
    .from("groups")
    .insert({ name, admin_id: user.id })
    .select("id")
    .single();

  if (gErr || !group) {
    return { error: gErr?.message ?? "Failed to create group." };
  }

  const { error: mErr } = await admin.from("group_members").insert({
    group_id: group.id,
    user_id: user.id,
  });

  if (mErr) return { error: mErr.message };

  return { groupId: group.id };
}
