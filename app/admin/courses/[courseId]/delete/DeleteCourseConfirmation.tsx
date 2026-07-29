"use client";

import { LoaderCircle, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { deleteCourse } from "./action";

interface DeleteCourseConfirmationProps {
  courseId: string;
  courseTitle: string;
}

export function DeleteCourseConfirmation({
  courseId,
  courseTitle,
}: DeleteCourseConfirmationProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);

    try {
      const response = await deleteCourse(courseId);

      if (response.status === "error") {
        toast.error(response.message);
        return;
      }

      toast.success(response.message);
      router.replace("/admin/courses");
      router.refresh();
    } catch {
      toast.error("Failed to delete course");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Card className="w-full max-w-xl gap-0 rounded-lg py-0">
      <CardHeader className="px-6 py-6">
        <CardTitle className="text-lg font-semibold">
          Are you sure you want to delete this course?
        </CardTitle>
        <CardDescription className="text-base">
          This action cannot be undone.
        </CardDescription>
        <p className="sr-only">Course: {courseTitle}</p>
      </CardHeader>

      <CardContent className="flex items-center justify-between gap-4 px-6 pb-6">
        <Link
          href="/admin/courses"
          aria-disabled={isDeleting}
          className={buttonVariants({
            variant: "outline",
            className:
              "h-10 rounded-none px-5 text-base aria-disabled:pointer-events-none aria-disabled:opacity-50",
          })}
        >
          Cancel
        </Link>

        <Button
          type="button"
          disabled={isDeleting}
          onClick={handleDelete}
          className="h-10 rounded-none bg-destructive px-5 text-base text-destructive-foreground hover:bg-destructive/85"
        >
          {isDeleting ? (
            <>
              <LoaderCircle className="size-4 animate-spin" />
              Deleting...
            </>
          ) : (
            <>
              <Trash2 className="size-4" />
              Delete
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
