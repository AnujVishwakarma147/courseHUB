import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CloudUploadIcon,
  ImageIcon,
  LoaderCircleIcon,
  XIcon,
} from "lucide-react";
import Image from "next/image";

import { Progress } from "@/components/ui/progress";

export function RenderEmptyState({
  isDragActive,
}: {
  isDragActive: boolean;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
        <CloudUploadIcon
          className={cn(
            "size-6 text-muted-foreground",
            isDragActive && "text-primary",
          )}
        />
      </div>

      <p className="text-base font-semibold text-foreground">
        Drop your files here or{" "}
        <span className="cursor-pointer font-bold text-primary">
          Click to upload
        </span>
      </p>

      <Button className="mt-4" type="button">
        Select File
      </Button>
      <p className="mt-3 text-xs text-muted-foreground">
        JPG, PNG, WebP, GIF or AVIF · Maximum 5 MB
      </p>
    </div>
  );
}

export function RenderUploadingState({
  fileName,
  progress,
}: {
  fileName: string;
  progress: number;
}) {
  return (
    <div className="w-full max-w-md text-center">
      <LoaderCircleIcon className="mx-auto size-10 animate-spin text-primary" />
      <p className="mt-4 text-lg font-semibold">{progress}%</p>
      <p className="mt-1 text-sm text-muted-foreground">Uploading...</p>
      <p className="mt-1 truncate text-xs text-muted-foreground">{fileName}</p>
      <Progress value={progress} className="mt-4" />
    </div>
  );
}

export function RenderSuccessState({
  previewUrl,
  isDeleting,
  onDelete,
}: {
  previewUrl: string;
  isDeleting: boolean;
  onDelete: () => void;
}) {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div className="relative aspect-video w-full max-w-2xl overflow-hidden rounded-sm">
        <Image
          src={previewUrl}
          alt="Course thumbnail preview"
          fill
          unoptimized
          sizes="(max-width: 768px) 90vw, 672px"
          className="object-cover object-center"
        />
      </div>
      <Button
        type="button"
        size="icon"
        variant="destructive"
        disabled={isDeleting}
        aria-label="Delete thumbnail"
        title="Delete thumbnail"
        className="absolute right-2 top-1 z-10 size-11 rounded-none shadow-lg sm:right-4 sm:top-2"
        onClick={(event) => {
          event.stopPropagation();
          onDelete();
        }}
      >
        {isDeleting ? (
          <LoaderCircleIcon className="size-5 animate-spin" />
        ) : (
          <XIcon className="size-5" />
        )}
      </Button>
    </div>
  );
}

export function RenderErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-destructive/30">
        <ImageIcon
          className={cn(
            "size-6 text-destructive",
          )}
        />
      </div>

      <p className="text-base font-semibold">
        Upload Failed
      </p>

      <p className="mt-1 text-xs text-muted-foreground">
        Something went wrong
      </p>

      <Button
        className="mt-4"
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onRetry();
        }}
      >
        Retry File Selection
      </Button>
    </div>
  );
}
