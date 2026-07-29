"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/app/data/admin/require-admin";
import { prisma } from "@/lib/db";
import type { ApiResponse } from "@/lib/types";

const idSchema = z.string().min(1);
function refreshCourse(courseId: string) {
  revalidatePath(`/admin/courses/${courseId}/edit`);
}

export async function createChapter(
  courseId: string,
): Promise<
  ApiResponse<{ id: string; title: string; position: number; lessons: [] }>
> {
  try {
    await requireAdmin();
    const validCourseId = idSchema.parse(courseId);
    const course = await prisma.course.findUnique({
      where: { id: validCourseId },
      select: {
        chapters: {
          select: { position: true },
          orderBy: { position: "desc" },
          take: 1,
        },
      },
    });

    if (!course) {
      return { status: "error", message: "Course not found" };
    }

    const position = (course.chapters[0]?.position ?? 0) + 1;
    const chapter = await prisma.chapter.create({
      data: {
        courseId: validCourseId,
        position,
        title: `Chapter Nr. ${position}`,
      },
      select: { id: true, title: true, position: true },
    });

    refreshCourse(validCourseId);
    return {
      status: "success",
      message: "Chapter created",
      data: { ...chapter, lessons: [] },
    };
  } catch (error) {
    console.error("Failed to create chapter:", error);
    return { status: "error", message: "Could not create chapter" };
  }
}

export async function createLesson(
  courseId: string,
  chapterId: string,
): Promise<
  ApiResponse<{ id: string; title: string; position: number }>
> {
  try {
    await requireAdmin();
    const input = z
      .object({ courseId: idSchema, chapterId: idSchema })
      .parse({ courseId, chapterId });
    const chapter = await prisma.chapter.findFirst({
      where: { id: input.chapterId, courseId: input.courseId },
      select: {
        lessons: {
          select: { position: true },
          orderBy: { position: "desc" },
          take: 1,
        },
      },
    });

    if (!chapter) {
      return { status: "error", message: "Chapter not found" };
    }

    const position = (chapter.lessons[0]?.position ?? 0) + 1;
    const lesson = await prisma.lesson.create({
      data: {
        chapterId: input.chapterId,
        position,
        title: `Lesson Nr. ${position}`,
      },
      select: { id: true, title: true, position: true },
    });

    refreshCourse(input.courseId);
    return {
      status: "success",
      message: "Lesson created",
      data: lesson,
    };
  } catch (error) {
    console.error("Failed to create lesson:", error);
    return { status: "error", message: "Could not create lesson" };
  }
}

export async function deleteChapter(
  courseId: string,
  chapterId: string,
): Promise<ApiResponse> {
  try {
    await requireAdmin();
    const input = z
      .object({ courseId: idSchema, chapterId: idSchema })
      .parse({ courseId, chapterId });
    const chapter = await prisma.chapter.findFirst({
      where: { id: input.chapterId, courseId: input.courseId },
      select: { id: true },
    });

    if (!chapter) {
      return { status: "error", message: "Chapter not found" };
    }

    await prisma.$transaction(async (transaction) => {
      await transaction.chapter.delete({ where: { id: chapter.id } });
      const remainingChapters = await transaction.chapter.findMany({
        where: { courseId: input.courseId },
        orderBy: { position: "asc" },
        select: { id: true },
      });

      for (const [index, remainingChapter] of remainingChapters.entries()) {
        await transaction.chapter.update({
          where: { id: remainingChapter.id },
          data: { position: index + 1 },
        });
      }
    });
    refreshCourse(input.courseId);
    return { status: "success", message: "Chapter deleted" };
  } catch (error) {
    console.error("Failed to delete chapter:", error);
    return { status: "error", message: "Could not delete chapter" };
  }
}

export async function deleteLesson(
  courseId: string,
  lessonId: string,
): Promise<ApiResponse> {
  try {
    await requireAdmin();
    const input = z
      .object({ courseId: idSchema, lessonId: idSchema })
      .parse({ courseId, lessonId });
    const lesson = await prisma.lesson.findFirst({
      where: {
        id: input.lessonId,
        chapter: { courseId: input.courseId },
      },
      select: { id: true, chapterId: true },
    });

    if (!lesson) {
      return { status: "error", message: "Lesson not found" };
    }

    await prisma.$transaction(async (transaction) => {
      await transaction.lesson.delete({ where: { id: lesson.id } });
      const remainingLessons = await transaction.lesson.findMany({
        where: { chapterId: lesson.chapterId },
        orderBy: { position: "asc" },
        select: { id: true },
      });

      for (const [index, remainingLesson] of remainingLessons.entries()) {
        await transaction.lesson.update({
          where: { id: remainingLesson.id },
          data: { position: index + 1 },
        });
      }
    });
    refreshCourse(input.courseId);
    return { status: "success", message: "Lesson deleted" };
  } catch (error) {
    console.error("Failed to delete lesson:", error);
    return { status: "error", message: "Could not delete lesson" };
  }
}
