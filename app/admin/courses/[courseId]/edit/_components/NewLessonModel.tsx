"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  lessonSchema,
  type LessonSchemaType,
} from "@/lib/zodSchemas";
import { LoaderCircle, Plus } from "lucide-react";
import { type FormEvent, useState, useTransition } from "react";
import { toast } from "sonner";

import { createLesson } from "../action";

interface NewLessonModalProps {
  courseId: string;
  chapterId: string;
  disabled?: boolean;
  onCreated: (lesson: {
    id: string;
    title: string;
    position: number;
  }) => void;
}

export function NewLessonModal({
  courseId,
  chapterId,
  disabled = false,
  onCreated,
}: NewLessonModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function resetForm() {
    setName("");
    setError("");
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const values: LessonSchemaType = { name, courseId, chapterId };
    const validation = lessonSchema.safeParse(values);

    if (!validation.success) {
      setError(validation.error.issues[0]?.message ?? "Invalid lesson name");
      return;
    }

    setError("");
    startTransition(async () => {
      try {
        const response = await createLesson(validation.data);

        if (response.status === "error" || !response.data) {
          setError(response.message);
          toast.error(response.message);
          return;
        }

        resetForm();
        setIsOpen(false);
        onCreated(response.data);
        toast.success(response.message);
      } catch {
        toast.error("Failed to create lesson");
      }
    });
  }

  function handleOpenChange(open: boolean) {
    setIsOpen(open);
    if (!open) {
      resetForm();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className="h-14 w-full gap-2 rounded-none bg-muted/30 text-lg hover:bg-muted/60"
            disabled={disabled || pending}
          />
        }
      >
        <Plus className="size-4" />
        New Lesson
      </DialogTrigger>

      <DialogContent className="gap-5 rounded-md p-6 sm:max-w-112.5">
        <DialogHeader>
          <DialogTitle className="text-lg">Create new lesson</DialogTitle>
          <DialogDescription>
            What would you like to name your lesson?
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-5" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor={`lesson-name-${chapterId}`}>Name</Label>
            <Input
              id={`lesson-name-${chapterId}`}
              name="name"
              placeholder="Lesson Name"
              value={name}
              disabled={pending}
              onChange={(event) => {
                setName(event.target.value);
                if (error) setError("");
              }}
              aria-invalid={Boolean(error)}
              aria-describedby={
                error ? `lesson-name-error-${chapterId}` : undefined
              }
              autoFocus
              className="h-11 rounded-none"
            />
            {error ? (
              <p
                id={`lesson-name-error-${chapterId}`}
                className="text-sm text-destructive"
              >
                {error}
              </p>
            ) : null}
          </div>

          <DialogFooter className="mx-0 mb-0 border-0 bg-transparent p-0 pt-2">
            <Button
              type="submit"
              className="h-10 rounded-none px-5"
              disabled={pending}
            >
              {pending ? <LoaderCircle className="animate-spin" /> : null}
              Save Change
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
