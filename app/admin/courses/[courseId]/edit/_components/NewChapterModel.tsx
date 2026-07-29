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
  chapterSchema,
  type ChapterSchemaType,
} from "@/lib/zodSchemas";
import { LoaderCircle, Plus } from "lucide-react";
import { type FormEvent, useState, useTransition } from "react";
import { toast } from "sonner";

import { createChapter } from "../action";

interface NewChapterModalProps {
  courseId: string;
  disabled?: boolean;
  onCreated: (chapter: {
    id: string;
    title: string;
    position: number;
    lessons: [];
  }) => void;
}

export function NewChapterModal({
  courseId,
  disabled = false,
  onCreated,
}: NewChapterModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const values: ChapterSchemaType = { name, courseId };
    const validation = chapterSchema.safeParse(values);

    if (!validation.success) {
      setError(validation.error.issues[0]?.message ?? "Invalid chapter name");
      return;
    }

    setError("");
    startTransition(async () => {
      try {
        const response = await createChapter(validation.data);

        if (response.status === "error" || !response.data) {
          toast.error(response.message);
          return;
        }

        onCreated(response.data);
        setName("");
        setIsOpen(false);
        toast.success(response.message);
      } catch {
        toast.error("Failed to create chapter");
      }
    });
  }

  function handleOpenChange(open: boolean) {
    setIsOpen(open);
    if (!open) {
      setError("");
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className="h-12 gap-2 rounded-none px-5 text-base"
            disabled={disabled || pending}
          />
        }
      >
        <Plus className="size-4" />
        New Chapter
      </DialogTrigger>

      <DialogContent className="gap-5 rounded-md p-6 sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Create new chapter</DialogTitle>
          <DialogDescription>
            What would you like to name your chapter?
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-5" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="chapter-name">Name</Label>
            <Input
              id="chapter-name"
              name="name"
              placeholder="Chapter Name"
              value={name}
              disabled={pending}
              onChange={(event) => setName(event.target.value)}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "chapter-name-error" : undefined}
              autoFocus
              className="h-11 rounded-none"
            />
            {error ? (
              <p
                id="chapter-name-error"
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
