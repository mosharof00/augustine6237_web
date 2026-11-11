"use client";

import { useState } from "react";
import { X, Image as ImageIcon, MapPin } from "lucide-react";
import { createPost } from "@/lib/api/posts";
import { toast } from "sonner";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreatePostModal({
  isOpen,
  onClose,
  onSuccess,
}: CreatePostModalProps) {
  const [caption, setCaption] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [locationTag, setLocationTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!caption.trim() && !imageUrl.trim()) {
      toast.error("Please enter a caption or image URL");
      return;
    }

    try {
      setIsSubmitting(true);
      await createPost({
        caption: caption.trim() || undefined,
        image_url: imageUrl.trim() || undefined,
        location_tag: locationTag.trim() || undefined,
      });
      toast.success("Post published to your profile!");
      setCaption("");
      setImageUrl("");
      setLocationTag("");
      onSuccess();
      onClose();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to publish post",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-2xl border border-border/50 bg-[#162032] p-6 shadow-2xl text-foreground">
        <div className="flex items-center justify-between pb-4 border-b border-border/30">
          <h3 className="text-lg font-semibold">Create Profile Post</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="post-caption"
              className="text-xs font-medium text-muted-foreground"
            >
              Caption / Prediction
            </label>
            <textarea
              id="post-caption"
              rows={4}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Share match insights, game day predictions, or personal updates..."
              className="w-full rounded-xl border border-border/40 bg-[#0B1222] p-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-sky-500 focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="post-image-url"
              className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"
            >
              <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
              Photo / Image URL (Optional)
            </label>
            <input
              id="post-image-url"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full rounded-xl border border-border/40 bg-[#0B1222] p-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-sky-500 focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="post-location"
              className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"
            >
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              Location Tag (Optional)
            </label>
            <input
              id="post-location"
              type="text"
              value={locationTag}
              onChange={(e) => setLocationTag(e.target.value)}
              placeholder="e.g. Wembley Stadium, London"
              className="w-full rounded-xl border border-border/40 bg-[#0B1222] p-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-sky-500 focus:outline-none transition-colors"
            />
          </div>

          {imageUrl && (
            <div className="relative mt-2 overflow-hidden rounded-xl border border-border/30 h-40 bg-[#0B1222]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-border/40 text-sm font-medium hover:bg-white/5 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-sky-500 text-sm font-semibold text-white hover:bg-sky-400 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Publishing..." : "Publish Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

