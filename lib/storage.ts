"use client";

import imageCompression from "browser-image-compression";
import { createClient } from "@/lib/supabase/client";

const COMPRESSION_OPTIONS = {
  maxSizeMB: 0.3,
  maxWidthOrHeight: 1600,
  useWebWorker: false, // Next.js bundler breaks worker mode
  fileType: "image/webp" as const,
  initialQuality: 0.8,
};

// If the compressed result is bigger than this, something is very wrong.
const HARD_LIMIT_MB = 1;

async function compressImage(file: File): Promise<File> {
  if (file.type === "image/svg+xml") {
    throw new Error("SVG uploads are not supported. Use PNG, JPEG, or WebP.");
  }

  const originalMB = (file.size / 1024 / 1024).toFixed(2);
  console.log(`[upload] original: ${originalMB} MB (${file.type})`);

  let compressed: File;
  try {
    compressed = await imageCompression(file, COMPRESSION_OPTIONS);
  } catch (e) {
    console.error("[upload] compression threw:", e);
    throw new Error("Failed to compress image. Try a different file.");
  }

  const compressedMB = (compressed.size / 1024 / 1024).toFixed(2);
  console.log(
    `[upload] compressed: ${compressedMB} MB (${compressed.type}, ${compressed.size} bytes)`,
  );

  if (compressed.type !== "image/webp") {
    console.warn(
      `[upload] expected webp, got ${compressed.type} — uploading anyway`,
    );
  }

  if (compressed.size > HARD_LIMIT_MB * 1024 * 1024) {
    throw new Error(
      `Could not compress below ${HARD_LIMIT_MB} MB (result: ${compressedMB} MB). Try a smaller image.`,
    );
  }

  return compressed;
}

export async function uploadQuestionImage(
  file: File,
  userId: string,
): Promise<string> {
  const supabase = createClient();
  const compressed = await compressImage(file);

  // Determine extension from the compressed blob's type
  const extMap: Record<string, string> = {
    "image/webp": "webp",
    "image/jpeg": "jpg",
    "image/png": "png",
  };
  const ext =
    extMap[compressed.type] ??
    (file.name.split(".").pop()?.toLowerCase() || "bin");

  const random = Math.random().toString(36).slice(2, 8);
  const filename = `${userId}/${Date.now()}-${random}.${ext}`;

  const { error } = await supabase.storage
    .from("question-images")
    .upload(filename, compressed, {
      cacheControl: "31536000",
      upsert: false,
      contentType: compressed.type,
    });

  if (error) throw error;

  const { data } = supabase.storage
    .from("question-images")
    .getPublicUrl(filename);

  return data.publicUrl;
}

export async function deleteQuestionImage(publicUrl: string): Promise<void> {
  const supabase = createClient();

  const marker = "/question-images/";
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return;
  const path = publicUrl.slice(idx + marker.length);

  const { error } = await supabase.storage
    .from("question-images")
    .remove([path]);

  if (error) throw error;
}
