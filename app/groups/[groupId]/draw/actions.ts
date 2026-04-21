"use server";

import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function uploadDrawingAction(
  formData: FormData
): Promise<{ url?: string; error?: string }> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const file = formData.get("drawing") as File;
  if (!file) return { error: "No file provided." };

  const admin = createAdminClient();
  const filename = `${user.id}/${Date.now()}.webp`;

  const { error: uploadError } = await admin.storage
    .from("drawings")
    .upload(filename, file, { contentType: "image/webp" });

  if (uploadError) return { error: uploadError.message };

  const { data: { publicUrl } } = admin.storage
    .from("drawings")
    .getPublicUrl(filename);

  return { url: publicUrl };
}

export async function createPostAction(params: {
  groupId: string;
  drawingUrl: string;
  mealName: string;
  caption: string | null;
  mysteryMode: boolean;
}): Promise<{ postId?: string; error?: string }> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("posts")
    .insert({
      group_id: params.groupId,
      user_id: user.id,
      drawing_url: params.drawingUrl,
      meal_name: params.mealName,
      caption: params.caption,
      mystery_mode: params.mysteryMode,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  return { postId: data.id };
}
