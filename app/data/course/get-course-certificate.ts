import "server-only";

import { requireUser } from "@/app/data/user/require-user";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export async function getCourseCertificate(slug: string) {
  const user = await requireUser();
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      userId: user.id,
      status: "Active",
      Course: {
        slug,
        status: "Published",
      },
    },
    select: {
      id: true,
      updatedAt: true,
      completedLessonIds: true,
      Course: {
        select: {
          title: true,
          slug: true,
          chapters: {
            select: {
              lessons: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!enrollment) {
    redirect(`/courses/${slug}`);
  }

  const lessonIds = enrollment.Course.chapters.flatMap((chapter) =>
    chapter.lessons.map((lesson) => lesson.id),
  );
  const completedLessonIds = new Set(enrollment.completedLessonIds);
  const hasCompletedCourse =
    lessonIds.length > 0 &&
    lessonIds.every((lessonId) => completedLessonIds.has(lessonId));

  if (!hasCompletedCourse) {
    redirect(`/dashboard/${slug}`);
  }

  return {
    studentName: user.name?.trim() || user.email.split("@")[0],
    studentEmail: user.email,
    courseTitle: enrollment.Course.title,
    courseSlug: enrollment.Course.slug,
    completedAt: enrollment.updatedAt,
    certificateId: `CH-${enrollment.id.slice(0, 8).toUpperCase()}`,
  };
}
