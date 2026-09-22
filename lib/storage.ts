"use client";

import { createClient } from "@/lib/supabase/client";

export async function uploadQuestionImage(
  file: File,
  userId: string,
): Promise<string> {
  const supabase = createClient();

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const random = Math.random().toString(36).slice(2, 8);
  const filename = `${userId}/${Date.now()}-${random}.${ext}`;

  const { error } = await supabase.storage
    .from("question-images")
    .upload(filename, file, {
      cacheControl: "31536000",
      upsert: false,
      contentType: file.type,
    });

  if (error) throw error;

  const { data } = supabase.storage
    .from("question-images")
    .getPublicUrl(filename);

  return data.publicUrl;
}
export async function deleteQuestionImage(publicUrl: string): Promise<void> {
  const supabase = createClient();

  // Public URL format: https://xxx.supabase.co/storage/v1/object/public/question-images/{userId}/{filename}
  // We only need the part after the bucket name.
  const marker = "/question-images/";
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) {
    // Not our bucket — silently ignore.
    return;
  }
  const path = publicUrl.slice(idx + marker.length);

  const { error } = await supabase.storage
    .from("question-images")
    .remove([path]);

  if (error) throw error;
}
