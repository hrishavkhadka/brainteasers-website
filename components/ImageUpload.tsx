"use client";

import { useRef, useState } from "react";
import { uploadQuestionImage } from "@/lib/storage";
import ZoomableImage from "./ZoomableImage";

export default function ImageUpload({
  label,
  value,
  onChange,
  userId,
}: {
  label: string;
  value: string | null;
  onChange: (url: string | null) => void;
  userId: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    if (file.type === "image/svg+xml") {
      setError("SVG files are not supported. Use PNG, JPEG, or WebP.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be under 10 MB.");
      return;
    }

    setUploading(true);
    try {
      const url = await uploadQuestionImage(file, userId);
      onChange(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleRemove() {
    if (!value) return;
    const urlToDelete = value;
    onChange(null);
    try {
      const { deleteQuestionImage } = await import("@/lib/storage");
      await deleteQuestionImage(urlToDelete);
    } catch (e) {
      console.error("Failed to delete image from storage:", e);
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>

      {value ? (
        <div className="relative inline-block">
          <ZoomableImage
            src={value}
            alt="Uploaded"
            imgClassName="max-h-40 rounded-lg border border-gray-200 dark:border-gray-700"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center hover:bg-red-700 z-10"
            aria-label="Remove image"
          >
            ×
          </button>
        </div>
      ) : (
        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={(e) => handleFile(e.target.files?.[0])}
            disabled={uploading}
            className="block w-full text-sm text-gray-600 dark:text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-100 dark:file:bg-gray-700 file:text-gray-700 dark:file:text-gray-200 hover:file:bg-gray-200 dark:hover:file:bg-gray-600 disabled:opacity-60"
          />
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Up to 10 MB. Images are compressed automatically.
          </p>
          {uploading && (
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              Compressing & uploading...
            </p>
          )}
        </div>
      )}

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>
      )}
    </div>
  );
}
