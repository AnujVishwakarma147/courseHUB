"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/app/data/admin/require-admin";
import { prisma } from "@/lib/db";
import type { ApiResponse } from "@/lib/types";

const updateLessonSchema = z.object({
  lessonId: z.string().min(1),
  chapterId: z.string().min(1),
  courseId: z.string().min(1),
  title: z
    .string()
    .trim()
    .min(3, "Lesson name must be at least 3 characters")
    .max(120, "Lesson name must not exceed 120 characters"),
  description: z
    .string()
    .trim()
    .max(20_000, "Description is too long"),
  thumbnailKey: z
    .string()
    .trim()
    .min(1, "Thumbnail image is required")
    .max(500),
  videoKey: z.string().trim().min(1, "Video is required").max(500),
});

export type UpdateLessonValues = z.infer<typeof updateLessonSchema>;

export async function updateLesson(
  values: UpdateLessonValues,
): Promise<ApiResponse> {
  try {
    await requireAdmin();
    const input = updateLessonSchema.safeParse(values);

    if (!input.success) {
      return {
        status: "error",
        message: input.error.issues[0]?.message ?? "Invalid lesson data",
      };
    }

    const existingLesson = await prisma.lesson.findFirst({
      where: {
        id: input.data.lessonId,
        chapterId: input.data.chapterId,
        chapter: {
          courseId: input.data.courseId,
        },
      },
      select: { id: true },
    });

    if (!existingLesson) {
      return { status: "error", message: "Lesson not found" };
    }

    await prisma.lesson.update({
      where: { id: existingLesson.id },
      data: {
        title: input.data.title,
        description: input.data.description || null,
        thumbnailKey: input.data.thumbnailKey || null,
        videoKey: input.data.videoKey || null,
      },
      select: { id: true },
    });

    revalidatePath(`/admin/courses/${input.data.courseId}/edit`);
    revalidatePath(
      `/admin/courses/${input.data.courseId}/${input.data.chapterId}/${input.data.lessonId}`,
    );
    revalidateTag("published-course-details", "max");

    return {
      status: "success",
      message: "Lesson updated successfully",
    };
  } catch (error) {
    console.error("Failed to update lesson:", error);
    return {
      status: "error",
      message: "Could not update the lesson",
    };
  }
}
