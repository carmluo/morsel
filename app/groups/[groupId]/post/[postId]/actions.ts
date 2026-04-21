"use server";

import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function submitGuessAction(
  postId: string,
  guess: string
): Promise<{ error?: string }> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const admin = createAdminClient();
  const { error } = await admin.from("guesses").upsert({
    post_id: postId,
    user_id: user.id,
    guess: guess.trim(),
  });

  return { error: error?.message };
}

export async function revealPostAction(
  postId: string
): Promise<{ error?: string }> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const admin = createAdminClient();

  // Only the poster can reveal
  const { data: post } = await admin
    .from("posts")
    .select("user_id")
    .eq("id", postId)
    .single();

  if (!post || post.user_id !== user.id) return { error: "Not authorized." };

  const { error } = await admin
    .from("posts")
    .update({ revealed: true })
    .eq("id", postId);

  return { error: error?.message };
}
