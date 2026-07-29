"use client";
import { useCallback, useEffect, useState } from "react";
import {
  type FileRejection,
  useDropzone,
} from "react-dropzone";
import { toast } from "sonner";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

import {
  RenderEmptyState,
  RenderErrorState,
  RenderSuccessState,
  RenderUploadingState,
} from "./Render";

interface UploaderState {
  file: File | null;
  uploading: boolean;
  progress: number;
  key?: string;
  isDeleting: boolean;
  error: boolean;
  objectUrl?: string;
}

interface UploaderProps {
  value?: string;
  initialPreviewUrl?: string;
  onChange: (key: string) => void;
}

const initialState: UploaderState = {
  error: false,
  file: null,
  uploading: false,
  progress: 0,
  isDeleting: false,
};

function revokeBlobUrl(url?: string) {
  if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
}

export function Uploader({
  value,
  initialPreviewUrl,
  onChange,
}: UploaderProps) {
  const [fileState, setFileState] = useState<UploaderState>({
    ...initialState,
    key: value || undefined,
    objectUrl: initialPreviewUrl,
  });

  useEffect(() => {
    return () => {
      revokeBlobUrl(fileState.objectUrl);
    };
  }, [fileState.objectUrl]);

  const uploadFile = useCallback(
    async (file: File) => {
      const objectUrl = URL.createObjectURL(file);
      setFileState({
        file,
        uploading: true,
        progress: 0,
        error: false,
        isDeleting: false,
        objectUrl,
      });

      try {
        const response = await fetch("/api/s3/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            contentType: file.type,
            size: file.size,
          }),
        });
        const uploadData = (await response.json()) as {
          apiKey?: string;
          folder?: string;
          publicId?: string;
          signature?: string;
          timestamp?: number;
          uploadUrl?: string;
          error?: string;
        };

        if (
          !response.ok ||
          !uploadData.apiKey ||
          !uploadData.folder ||
          !uploadData.publicId ||
          !uploadData.signature ||
          !uploadData.timestamp ||
          !uploadData.uploadUrl
        ) {
          throw new Error(uploadData.error ?? "Could not prepare upload");
        }

        const uploadedKey = await new Promise<string>((resolve, reject) => {
          const request = new XMLHttpRequest();
          const formData = new FormData();
          formData.append("file", file);
          formData.append("api_key", uploadData.apiKey!);
          formData.append("folder", uploadData.folder!);
          formData.append("public_id", uploadData.publicId!);
          formData.append("signature", uploadData.signature!);
          formData.append("timestamp", String(uploadData.timestamp));

          request.open("POST", uploadData.uploadUrl!);
          request.upload.onprogress = (event) => {
            if (!event.lengthComputable) return;
            const progress = Math.round((event.loaded / event.total) * 100);
            setFileState((current) => ({ ...current, progress }));
          };
          request.onload = () => {
            try {
              const result = JSON.parse(request.responseText) as {
                public_id?: string;
                error?: { message?: string };
              };

              if (
                request.status >= 200 &&
                request.status < 300 &&
                result.public_id
              ) {
                resolve(result.public_id);
              } else {
                reject(
                  new Error(result.error?.message ?? "Cloudinary upload failed"),
                );
              }
            } catch {
              reject(new Error("Cloudinary returned an invalid response"));
            }
          };
          request.onerror = () => reject(new Error("Cloudinary upload failed"));
          request.send(formData);
        });

        setFileState((current) => ({
          ...current,
          uploading: false,
          progress: 100,
          key: uploadedKey,
        }));
        onChange(uploadedKey);
        toast.success("Thumbnail uploaded successfully");
      } catch (error) {
        setFileState((current) => ({
          ...current,
          uploading: false,
          error: true,
        }));
        toast.error(
          error instanceof Error ? error.message : "Thumbnail upload failed",
        );
      }
    },
    [onChange],
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles[0]) void uploadFile(acceptedFiles[0]);
    },
    [uploadFile],
  );

  function rejectedFiles(
    fileRejection: FileRejection[],
  ) {
    if (fileRejection.length) {
      const tooManyFiles = fileRejection.find(
        (rejection) =>
          rejection.errors[0]?.code ===
          "too-many-files",
      );

      const fileSizeTooBig = fileRejection.find(
        (rejection) =>
          rejection.errors[0]?.code ===
          "file-too-large",
      );

      if (fileSizeTooBig) {
        toast.error(
          "File size exceeds the 5MB limit",
        );
      }

      if (tooManyFiles) {
        toast.error(
          "Too many files selected, max is 1",
        );
      }

      setFileState((previousState) => ({
        ...previousState,
        error: true,
      }));
    }
  }

  const {
    getRootProps,
    getInputProps,
    isDragActive,
  } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
    },
    maxFiles: 1,
    multiple: false,
    maxSize: 5 * 1024 * 1024,
    onDropRejected: rejectedFiles,
    disabled: fileState.uploading || fileState.isDeleting,
    noClick: Boolean(fileState.key),
    noDrag: Boolean(fileState.key),
  });

  async function deleteFile() {
    if (!fileState.key) return;
    setFileState((current) => ({ ...current, isDeleting: true }));

    try {
      const response = await fetch("/api/s3/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: fileState.key }),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) throw new Error(result.error ?? "Delete failed");

      revokeBlobUrl(fileState.objectUrl);
      setFileState(initialState);
      onChange("");
      toast.success("Thumbnail deleted successfully");
    } catch (error) {
      setFileState((current) => ({ ...current, isDeleting: false }));
      toast.error(
        error instanceof Error ? error.message : "Could not delete thumbnail",
      );
    }
  }

  function retrySelection() {
    revokeBlobUrl(fileState.objectUrl);
    setFileState(initialState);
  }

  return (
    <Card
      {...getRootProps()}
      className={cn(
        "relative h-80 w-full border-2 border-dashed transition-colors duration-200 ease-in-out lg:h-[26rem]",
        isDragActive
          ? "border-primary border-solid bg-primary/10"
          : "border-border hover:border-primary",
      )}
    >
      <CardContent className="flex h-full w-full items-center justify-center p-4">
        <input {...getInputProps()} />

        {fileState.uploading && fileState.file ? (
          <RenderUploadingState
            fileName={fileState.file.name}
            progress={fileState.progress}
          />
        ) : fileState.key && fileState.objectUrl ? (
          <RenderSuccessState
            previewUrl={fileState.objectUrl}
            isDeleting={fileState.isDeleting}
            onDelete={deleteFile}
          />
        ) : fileState.error ? (
          <RenderErrorState onRetry={retrySelection} />
        ) : (
          <RenderEmptyState
            isDragActive={isDragActive}
          />
        )}
      </CardContent>
    </Card>
  );
}
