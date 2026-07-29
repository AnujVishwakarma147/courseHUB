import "server-only";

import { notFound } from "next/navigation";

import { prisma } from "@/lib/db";
import { requireAdmin } from "./require-admin";

export async function adminGetLesson(
  id: string,
  chapterId: string,
  courseId: string,
) {
  await requireAdmin();

  const data = await prisma.lesson.findFirst({
    where: {
      id,
      chapterId,
      chapter: {
        courseId,
      },
    },
    select: {
      title: true,
      videoKey: true,
      thumbnailKey: true,
      description: true,
      id: true,
      position: true,
    },
  });

  if (!data) {
    return notFound();
  }

  return data;
}

export type AdminLessonType = Awaited<ReturnType<typeof adminGetLesson>>;
