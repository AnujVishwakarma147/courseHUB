"use client";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { LoaderCircle, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { deleteLesson } from "../action";

interface DeleteLessonProps {
  courseId: string;
  lessonId: string;
  lessonNumber: number;
  disabled?: boolean;
  onDeleted: () => void;
  onPendingChange?: (pending: boolean) => void;
}

export function DeleteLesson({
  courseId,
  lessonId,
  lessonNumber,
  disabled = false,
  onDeleted,
  onPendingChange,
}: DeleteLessonProps) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleOpenChange(nextOpen: boolean) {
    if (!pending) {
      setOpen(nextOpen);
    }
  }

  function handleDelete() {
    onPendingChange?.(true);

    startTransition(async () => {
      try {
        const response = await deleteLesson(courseId, lessonId);

        if (response.status === "error") {
          toast.error(response.message);
          return;
        }

        onDeleted();
        setOpen(false);
        toast.success(response.message);
      } catch {
        toast.error("Failed to delete lesson");
      } finally {
        onPendingChange?.(false);
      }
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-10 shrink-0 rounded-none"
            aria-label={`Delete lesson ${lessonNumber}`}
            disabled={disabled || pending}
          />
        }
      >
        <Trash2 className="size-5" />
      </AlertDialogTrigger>

      <AlertDialogContent className="gap-5 rounded-md p-6 sm:max-w-121.25">
        <AlertDialogHeader className="gap-3">
          <AlertDialogTitle className="text-xl font-semibold">
            Delete this lesson?
          </AlertDialogTitle>
          <AlertDialogDescription className="max-w-md text-base leading-6">
            This action cannot be undone. Lesson {lessonNumber} will be
            permanently deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="mx-0 mb-0 border-0 bg-transparent p-0 pt-1">
          <AlertDialogCancel
            className="h-10 rounded-none px-5"
            disabled={pending}
          >
            Cancel
          </AlertDialogCancel>
          <Button
            type="button"
            className="h-10 rounded-none px-5"
            disabled={pending}
            onClick={handleDelete}
          >
            {pending ? <LoaderCircle className="animate-spin" /> : null}
            {pending ? "Deleting..." : "Delete Lesson"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
