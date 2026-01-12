"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { Upload, X } from "lucide-react";

const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
};

type ImageUploadProps = {
  value: string | null | undefined;
  onChange: (value: string | null) => void;
  disabled?: boolean;
  id?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
};

export function ImageUpload({
  value,
  onChange,
  disabled,
  id,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
}: ImageUploadProps) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const parseImages = (rawValue: string | null | undefined) => {
    if (!rawValue) return [];
    const raw = rawValue.trim();
    if (!raw) return [];
    if (raw.startsWith("[") && raw.endsWith("]")) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed
            .map((item) => String(item).trim())
            .filter((item) => item.length > 0);
        }
      } catch {
        // fall through
      }
    }
    if (raw.includes(",") || raw.includes("|") || raw.includes("\n")) {
      return raw
        .split(/[,\n|]+/)
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
    }
    return [raw];
  };

  const serializeImages = (images: string[]) => {
    const cleaned = images.map((item) => item.trim()).filter(Boolean);
    if (cleaned.length === 0) return null;
    if (cleaned.length === 1) return cleaned[0];
    return JSON.stringify(cleaned);
  };

  const toPreviewUrl = (rawUrl: string) => {
    if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
      return rawUrl;
    }
    return `${getBaseUrl()}${rawUrl.startsWith("/") ? "" : "/"}${rawUrl}`;
  };

  const images = parseImages(value);
  const previewUrls = images.map(toPreviewUrl);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (disabled) return;

    const fileList = Array.from(files);
    const validFiles = fileList.filter((file) =>
      file.type.startsWith("image/")
    );
    if (validFiles.length === 0) {
      setError("Please select image files.");
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const uploadedUrls: string[] = [];
      for (const file of validFiles) {
        const formData = new FormData();
        formData.append("image", file);

        const response = await fetch(`${getBaseUrl()}/api/upload`, {
          method: "POST",
          body: formData,
          credentials: "include",
          headers: accessToken
            ? { Authorization: `Bearer ${accessToken}` }
            : undefined,
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Upload failed");
        }

        const data = await response.json();
        const imageUrl = data?.data?.imageUrl;

        if (!imageUrl) {
          throw new Error("Upload response missing image URL");
        }

        uploadedUrls.push(imageUrl);
      }

      if (uploadedUrls.length > 0) {
        const nextImages = [...images, ...uploadedUrls];
        onChange(serializeImages(nextImages));
      }
    } catch (uploadError) {
      const message =
        uploadError instanceof Error ? uploadError.message : "Upload failed";
      setError(message);
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const handleBrowseClick = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    handleFiles(event.dataTransfer.files);
  };

  return (
    <div className="space-y-2">
      <input
        id={id}
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => handleFiles(event.target.files)}
        disabled={disabled}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
      />
      <div
        className={cn(
          "flex min-h-[140px] cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/20 p-4 text-center text-sm text-muted-foreground transition",
          isDragging && "border-green-500 bg-green-500/10",
          disabled && "cursor-not-allowed opacity-60"
        )}
        role="button"
        tabIndex={0}
        onClick={handleBrowseClick}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {previewUrls.length > 0 ? (
          <div className="flex w-full flex-col items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Click or drop to add more images
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="size-8 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Drag and drop images
              </p>
              <p className="text-xs text-muted-foreground">
                or click to browse
              </p>
            </div>
          </div>
        )}
      </div>
      {previewUrls.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {previewUrls.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="group relative overflow-hidden rounded-lg border bg-muted/20"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Product ${index + 1}`}
                className="aspect-square w-full object-contain bg-background"
              />
              <button
                type="button"
                className={cn(
                  "absolute right-2 top-2 rounded-full bg-background/90 p-1 text-muted-foreground shadow-sm transition hover:text-foreground",
                  (disabled || isUploading) && "pointer-events-none opacity-60"
                )}
                onClick={(event) => {
                  event.stopPropagation();
                  const nextImages = images.filter(
                    (_, itemIndex) => itemIndex !== index
                  );
                  onChange(serializeImages(nextImages));
                  if (inputRef.current) {
                    inputRef.current.value = "";
                  }
                }}
                aria-label="Remove image"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleBrowseClick}
          disabled={disabled}
        >
          {previewUrls.length > 0 ? "Add more" : "Browse"}
        </Button>
        {previewUrls.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              onChange(null);
              if (inputRef.current) {
                inputRef.current.value = "";
              }
            }}
            disabled={disabled}
          >
            Remove all
          </Button>
        )}
        {isUploading && (
          <span className="text-xs text-muted-foreground">Uploading...</span>
        )}
        {error && <span className="text-xs text-destructive">{error}</span>}
      </div>
    </div>
  );
}
