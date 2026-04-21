"use server";

import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function createGroupAction(
  name: string,
  photoUrl?: string | null
): Promise<{ groupId?: string; error?: string }> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const admin = createAdminClient();

  const { data: group, error: gErr } = await admin
    .from("groups")
    .insert({ name, admin_id: user.id, ...(photoUrl ? { photo_url: photoUrl } : {}) })
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
