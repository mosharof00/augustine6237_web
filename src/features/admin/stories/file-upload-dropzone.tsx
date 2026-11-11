"use client";

import { CheckCircle2, Loader2, Music, Upload, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/envelope";
import { uploadFile, type UploadPurpose } from "./api";

const IMAGE_MIMES = ["image/jpeg", "image/png", "image/webp"];
const AUDIO_MIMES = ["audio/mpeg", "audio/mp4", "audio/aac"];

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_AUDIO_BYTES = 20 * 1024 * 1024;

export function FileUploadDropzone({
  purpose,
  currentUrl,
  onUploaded,
  onClear,
  label = "Upload File",
}: {
  purpose: UploadPurpose;
  currentUrl?: string | null;
  onUploaded: (url: string) => void;
  onClear?: () => void;
  label?: string;
}) {
  const isAudio = purpose === "CHAPTER_AUDIO";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const accept = isAudio ? ".mp3,.m4a,.aac,audio/*" : ".jpg,.jpeg,.png,.webp,image/*";
  const maxBytes = isAudio ? MAX_AUDIO_BYTES : MAX_IMAGE_BYTES;
  const hint = isAudio ? "MP3, M4A, AAC (Max 20MB)" : "JPG, PNG, WebP (Max 5MB)";

  async function handleFile(file: File) {
    const allowed = isAudio ? AUDIO_MIMES : IMAGE_MIMES;
    if (file.type && !allowed.includes(file.type)) {
      toast.error(`Invalid file type. Allowed: ${isAudio ? "MP3, M4A, AAC" : "JPG, PNG, WebP"}`);
      return;
    }
    if (file.size > maxBytes) {
      toast.error(`File is too large. Max size: ${isAudio ? "20MB" : "5MB"}`);
      return;
    }

    setUploading(true);
    try {
      const result = await uploadFile(file, purpose);
      onUploaded(result.url);
      toast.success("File uploaded successfully");
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Failed to upload file. Please try again.",
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      void handleFile(file);
    }
  }

  return (
    <div className="space-y-2">
      <span className="text-sm font-medium">{label}</span>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />

      {currentUrl ? (
        <div className="relative flex items-center justify-between gap-3 rounded-xl border bg-muted/30 p-3">
          <div className="flex items-center gap-3 overflow-hidden">
            {isAudio ? (
              <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Music className="size-6" />
              </div>
            ) : (
              <div className="relative size-14 shrink-0 overflow-hidden rounded-lg border bg-background">
                <Image
                  src={currentUrl}
                  alt="Uploaded preview"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                <CheckCircle2 className="size-4 shrink-0 text-success" />
                <span className="truncate">
                  {isAudio ? "Audio file uploaded" : "Image uploaded"}
                </span>
              </div>
              <p className="truncate text-xs text-muted-foreground">{currentUrl}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              Change
            </Button>
            {onClear ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={uploading}
                onClick={onClear}
                aria-label="Remove uploaded file"
              >
                <X className="size-4" />
              </Button>
            ) : null}
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed p-6 text-center transition-colors ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-muted/40"
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="text-sm font-medium text-foreground">Uploading file...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                {isAudio ? <Music className="size-5" /> : <Upload className="size-5" />}
              </div>
              <p className="text-sm font-medium text-foreground">
                Drag &amp; Drop {isAudio ? "audio" : "image"} or{" "}
                <span className="text-primary underline">Browse</span>
              </p>
              <p className="text-xs text-muted-foreground">{hint}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
