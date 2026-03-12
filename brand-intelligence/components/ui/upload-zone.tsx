"use client";

import { useRef, useState } from "react";
import { Upload, X, Loader2, FileVideo } from "lucide-react";

interface UploadZoneProps {
  value?: string;
  onUpload: (url: string) => void;
  onRemove?: () => void;
  accept?: string;
  folder?: string;
  className?: string;
  /** How to render the preview once uploaded */
  previewType?: "image" | "icon" | "video";
  label?: string;
}

export function UploadZone({
  value,
  onUpload,
  onRemove,
  accept = "image/*",
  folder = "brand-assets",
  className = "",
  previewType = "image",
  label = "Upload",
}: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      onUpload(data.url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  if (value) {
    return (
      <div className={`relative rounded-lg overflow-hidden border border-[var(--border)] bg-[var(--muted)] ${className}`}>
        {previewType === "video" ? (
          <div className="flex h-full flex-col items-center justify-center gap-1 p-2">
            <FileVideo className="h-6 w-6 text-[var(--muted-foreground)]" />
            <span className="w-full truncate text-center text-xs text-[var(--muted-foreground)]">
              {decodeURIComponent(value.split("/").pop() ?? "file")}
            </span>
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt="Uploaded asset"
            className={`h-full w-full ${previewType === "icon" ? "object-contain p-2" : "object-cover"}`}
          />
        )}
        {onRemove && (
          <button
            onClick={onRemove}
            className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white transition-colors hover:bg-black/80"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-[var(--border)] bg-[var(--muted)] transition-colors hover:bg-[var(--accent)] ${className}`}
      onClick={() => !uploading && inputRef.current?.click()}
    >
      {uploading ? (
        <Loader2 className="h-5 w-5 animate-spin text-[var(--muted-foreground)]" />
      ) : (
        <>
          <Upload className="h-5 w-5 text-[var(--muted-foreground)]" />
          <span className="mt-1 text-xs text-[var(--muted-foreground)]">{label}</span>
        </>
      )}
      {uploadError && (
        <span className="mt-1 px-2 text-center text-xs text-red-500">{uploadError}</span>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
