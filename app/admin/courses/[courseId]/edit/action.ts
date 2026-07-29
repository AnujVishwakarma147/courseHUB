"use server";

import { request } from "@arcjet/next";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/app/data/admin/require-admin";
import arcjet from "@/lib/arcjet";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Prisma } from "@/lib/generated/prisma/client";
import type { ApiResponse } from "@/lib/types";
import {
  chapterSchema,
  courseSchema,
  lessonSchema,
  type ChapterSchemaType,
  type CourseSchemaType,
  type LessonSchemaType,
} from "@/lib/zodSchemas";

export async function UpdateCourse(
  courseId: string,
  values: CourseSchemaType,
): Promise<ApiResponse> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return {
        status: "error",
        message: "You must be logged in to update a course",
      };
    }

    const decision = await arcjet.protect(await request(), {
      fingerprint: session.user.id,
    });

    if (decision.isDenied()) {
      return { status: "error", message: "Request blocked" };
    }

    if (session.user.role !== "admin") {
      return {
        status: "error",
        message: "Only admins can update courses",
      };
    }

    const validation = courseSchema.safeParse(values);

    if (!validation.success) {
      return { status: "error", message: "Invalid form data" };
    }

    const course = await prisma.course.update({
      where: { id: courseId },
      data: validation.data,
      select: { id: true },
    });

    revalidatePath("/admin/courses");
    revalidatePath(`/admin/courses/${courseId}/edit`);

    return {
      status: "success",
      message: "Course updated successfully",
      data: course,
    };
  } catch (error) {
    console.error("Failed to update course:", error);

    return {
      status: "error",
      message: "Failed to update course. The slug may already be in use.",
    };
  }
}

const reorderSchema = z.object({
  courseId: z.string().min(1),
  orderedIds: z.array(z.string().min(1)),
});

const lessonReorderSchema = reorderSchema.extend({
  chapterId: z.string().min(1),
});

function hasSameIds(currentIds: string[], orderedIds: string[]) {
  return (
    currentIds.length === orderedIds.length &&
    new Set(orderedIds).size === orderedIds.length &&
    currentIds.every((id) => orderedIds.includes(id))
  );
}

export async function reorderChapters(
  courseId: string,
  orderedIds: string[],
): Promise<ApiResponse> {
  try {
    await requireAdmin();
    const input = reorderSchema.parse({ courseId, orderedIds });
    const chapters = await prisma.chapter.findMany({
      where: { courseId: input.courseId },
      select: { id: true },
    });

    if (!hasSameIds(chapters.map(({ id }) => id), input.orderedIds)) {
      return { status: "error", message: "Invalid chapter order" };
    }

    if (input.orderedIds.length > 0) {
      const positions = input.orderedIds.map((id, index) =>
        Prisma.sql`(${id}::text, ${index + 1}::integer)`,
      );
      const updatedCount = await prisma.$executeRaw(
        Prisma.sql`
          UPDATE "Chapter" AS chapter
          SET
            "position" = ordered."position",
            "updatedAt" = NOW()
          FROM (
            VALUES ${Prisma.join(positions, ", ")}
          ) AS ordered("id", "position")
          WHERE chapter."id" = ordered."id"
            AND chapter."courseId" = ${input.courseId}
        `,
      );

      if (updatedCount !== input.orderedIds.length) {
        return { status: "error", message: "Could not save chapter order" };
      }
    }

    return { status: "success", message: "Chapter order saved" };
  } catch (error) {
    console.error("Failed to reorder chapters:", error);
    return { status: "error", message: "Could not save chapter order" };
  }
}

export async function reorderLessons(
  courseId: string,
  chapterId: string,
  orderedIds: string[],
): Promise<ApiResponse> {
  try {
    await requireAdmin();
    const input = lessonReorderSchema.parse({
      courseId,
      chapterId,
      orderedIds,
    });
    const chapter = await prisma.chapter.findFirst({
      where: { id: input.chapterId, courseId: input.courseId },
      select: {
        lessons: {
          select: { id: true },
        },
      },
    });

    if (
      !chapter ||
      !hasSameIds(
        chapter.lessons.map(({ id }) => id),
        input.orderedIds,
      )
    ) {
      return { status: "error", message: "Invalid lesson order" };
    }

    if (input.orderedIds.length > 0) {
      const positions = input.orderedIds.map((id, index) =>
        Prisma.sql`(${id}::text, ${index + 1}::integer)`,
      );
      const updatedCount = await prisma.$executeRaw(
        Prisma.sql`
          UPDATE "Lesson" AS lesson
          SET
            "position" = ordered."position",
            "updatedAt" = NOW()
          FROM (
            VALUES ${Prisma.join(positions, ", ")}
          ) AS ordered("id", "position")
          WHERE lesson."id" = ordered."id"
            AND lesson."chapterId" = ${input.chapterId}
        `,
      );

      if (updatedCount !== input.orderedIds.length) {
        return { status: "error", message: "Could not save lesson order" };
      }
    }

    return { status: "success", message: "Lesson order saved" };
  } catch (error) {
    console.error("Failed to reorder lessons:", error);
    return { status: "error", message: "Could not save lesson order" };
  }
}


export async function createChapter(
  values: ChapterSchemaType,
): Promise<
  ApiResponse<{ id: string; title: string; position: number; lessons: [] }>
> {
  try {
    await requireAdmin();
    const result = chapterSchema.safeParse(values);

    if (!result.success) {
      return {
        status: "error",
        message: "Invalid Data",
      };
    }

    const chapter = await prisma.$transaction(async (tx) => {
      const maxPos = await tx.chapter.findFirst({
        where: {
          courseId: result.data.courseId,
        },
        select: {
          position: true,
        },
        orderBy: {
          position: "desc",
        },
      });

      return tx.chapter.create({
        data: {
          title: result.data.name,
          courseId: result.data.courseId,
          position: (maxPos?.position ?? 0) + 1,
        },
        select: {
          id: true,
          title: true,
          position: true,
        },
      });
    });

    revalidatePath(`/admin/courses/${result.data.courseId}/edit`);

    return {
      status: "success",
      message: "Chapter created successfully",
      data: {
        ...chapter,
        lessons: [],
      },
    };
  } catch (error) {
    console.error("Failed to create chapter:", error);
    return {
      status: "error",
      message: "Failed to create chapter",
    };
  }
}


export async function createLesson(
  values: LessonSchemaType,
): Promise<
  ApiResponse<{ id: string; title: string; position: number }>
> {
  try {
    await requireAdmin();
    const result = lessonSchema.safeParse(values);

    if (!result.success) {
      return {
        status: "error",
        message: result.error.issues[0]?.message ?? "Invalid lesson data",
      };
    }

    const lesson = await prisma.$transaction(async (tx) => {
      const chapter = await tx.chapter.findFirst({
        where: {
          id: result.data.chapterId,
          courseId: result.data.courseId,
        },
        select: {
          lessons: {
            select: { position: true },
            orderBy: { position: "desc" },
            take: 1,
          },
        },
      });

      if (!chapter) {
        throw new Error("Chapter not found");
      }

      return tx.lesson.create({
        data: {
          title: result.data.name,
          chapterId: result.data.chapterId,
          position: (chapter.lessons[0]?.position ?? 0) + 1,
          description: result.data.description,
          thumbnailKey: result.data.thumbnailKey,
          videoKey: result.data.videoKey,
        },
        select: {
          id: true,
          title: true,
          position: true,
        },
      });
    });

    revalidatePath(`/admin/courses/${result.data.courseId}/edit`);

    return {
      status: "success",
      message: "Lesson created successfully",
      data: lesson,
    };
  } catch (error) {
    console.error("Failed to create lesson:", error);
    return {
      status: "error",
      message:
        error instanceof Error && error.message === "Chapter not found"
          ? error.message
          : "Failed to create lesson",
    };
  }
}

const deleteChapterSchema = z.object({
  courseId: z.string().min(1),
  chapterId: z.string().min(1),
});

const deleteLessonSchema = z.object({
  courseId: z.string().min(1),
  lessonId: z.string().min(1),
});

export async function deleteLesson(
  courseId: string,
  lessonId: string,
): Promise<ApiResponse> {
  try {
    await requireAdmin();
    const input = deleteLessonSchema.parse({ courseId, lessonId });
    const lesson = await prisma.lesson.findFirst({
      where: {
        id: input.lessonId,
        chapter: {
          courseId: input.courseId,
        },
      },
      select: {
        id: true,
        chapterId: true,
      },
    });

    if (!lesson) {
      return {
        status: "error",
        message: "Lesson not found",
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.lesson.delete({
        where: {
          id: lesson.id,
        },
      });

      const remainingLessons = await tx.lesson.findMany({
        where: {
          chapterId: lesson.chapterId,
        },
        orderBy: {
          position: "asc",
        },
        select: {
          id: true,
        },
      });

      for (const [index, remainingLesson] of remainingLessons.entries()) {
        await tx.lesson.update({
          where: {
            id: remainingLesson.id,
          },
          data: {
            position: index + 1,
          },
        });
      }
    });

    revalidatePath(`/admin/courses/${input.courseId}/edit`);

    return {
      status: "success",
      message: "Lesson deleted successfully",
    };
  } catch (error) {
    console.error("Failed to delete lesson:", error);

    return {
      status: "error",
      message: "Failed to delete lesson",
    };
  }
}

export async function deleteChapter(
  courseId: string,
  chapterId: string,
): Promise<ApiResponse> {
  try {
    await requireAdmin();
    const input = deleteChapterSchema.parse({ courseId, chapterId });
    const chapter = await prisma.chapter.findFirst({
      where: {
        id: input.chapterId,
        courseId: input.courseId,
      },
      select: {
        id: true,
      },
    });

    if (!chapter) {
      return {
        status: "error",
        message: "Chapter not found",
      };
    }

    await prisma.$transaction(async (tx) => {
      // Lessons are removed by the Chapter -> Lesson cascade in schema.prisma.
      await tx.chapter.delete({
        where: {
          id: chapter.id,
        },
      });

      const remainingChapters = await tx.chapter.findMany({
        where: {
          courseId: input.courseId,
        },
        orderBy: {
          position: "asc",
        },
        select: {
          id: true,
        },
      });

      for (const [index, remainingChapter] of remainingChapters.entries()) {
        await tx.chapter.update({
          where: {
            id: remainingChapter.id,
          },
          data: {
            position: index + 1,
          },
        });
      }
    });

    revalidatePath(`/admin/courses/${input.courseId}/edit`);

    return {
      status: "success",
      message: "Chapter deleted successfully",
    };
  } catch (error) {
    console.error("Failed to delete chapter:", error);

    return {
      status: "error",
      message: "Failed to delete chapter",
    };
  }
}
