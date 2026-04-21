"use server";

import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

export async function uploadGroupPhotoAction(
  formData: FormData
): Promise<{ url?: string; error?: string }> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const file = formData.get("photo") as File;
  if (!file) return { error: "No file provided." };

  const admin = createAdminClient();
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const safeExt = ["jpg", "jpeg", "png", "webp", "heic"].includes(ext) ? ext : "jpg";
  const filename = `group-photos/${user.id}/${Date.now()}.${safeExt}`;

  const { error: uploadError } = await admin.storage
    .from("drawings")
    .upload(filename, file, { contentType: file.type, upsert: true });

  if (uploadError) return { error: uploadError.message };

  const { data: { publicUrl } } = admin.storage
    .from("drawings")
    .getPublicUrl(filename);

  return { url: publicUrl };
}

export async function updateGroupPhotoAction(
  groupId: string,
  photoUrl: string
): Promise<{ error?: string }> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const admin = createAdminClient();
  const { error } = await admin
    .from("groups")
    .update({ photo_url: photoUrl })
    .eq("id", groupId);

  return { error: error?.message };
}

export async function deleteGroupAction(groupId: string): Promise<{ error?: string }> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const admin = createAdminClient();

  const { data: group } = await admin
    .from("groups")
    .select("admin_id")
    .eq("id", groupId)
    .single();

  if (!group || group.admin_id !== user.id) return { error: "Not authorized." };

  const { error } = await admin.from("groups").delete().eq("id", groupId);
  if (error) return { error: error.message };

  redirect("/groups");
}
