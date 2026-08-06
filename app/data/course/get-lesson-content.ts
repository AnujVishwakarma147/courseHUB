"use server";

import { requireUser } from "@/app/data/user/require-user";
import {
  getCourseSidebarData,
  type CourseSidebarData,
  type PlayerLesson,
} from "@/app/data/course/get-course-sidebar-data";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

export type CoursePlayerData = CourseSidebarData & {
  lesson: PlayerLesson & {
    description: string | null;
    thumbnailKey: string | null;
    videoKey: string | null;
  };
  nextLessonId: string | null;
};

export type MarkLessonCompleteResult = {
  status: "success";
  message: string;
};

export async function getLessonContent(
  slug: string,
  lessonId: string,
): Promise<CoursePlayerData> {
  const [sidebarData, lessonContent] = await Promise.all([
    getCourseSidebarData(slug),
    prisma.lesson.findUnique({
      where: {
        id: lessonId,
      },
      select: {
        description: true,
        thumbnailKey: true,
        videoKey: true,
      },
    }),
  ]);
  const lessons = sidebarData.course.chapters.flatMap(
    (chapter) => chapter.lessons,
  );
  const lessonIndex = lessons.findIndex((lesson) => lesson.id === lessonId);

  if (lessonIndex === -1 || !lessonContent) {
    notFound();
  }

  return {
    ...sidebarData,
    lesson: {
      ...lessons[lessonIndex],
      ...lessonContent,
    },
    nextLessonId: lessons[lessonIndex + 1]?.id ?? null,
  };
}

export async function markLessonComplete(
  slug: string,
  lessonId: string,
): Promise<MarkLessonCompleteResult> {
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
      status: true,
      completedLessonIds: true,
      Course: {
        select: {
          slug: true,
          status: true,
          chapters: {
            orderBy: {
              position: "asc",
            },
            select: {
              lessons: {
                orderBy: {
                  position: "asc",
                },
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

  if (
    !enrollment ||
    enrollment.status !== "Active" ||
    enrollment.Course.status !== "Published" ||
    enrollment.Course.slug !== slug
  ) {
    redirect(`/courses/${slug}`);
  }

  const lessonIds = enrollment.Course.chapters.flatMap((chapter) =>
    chapter.lessons.map((lesson) => lesson.id),
  );
  const lessonIndex = lessonIds.indexOf(lessonId);

  if (lessonIndex === -1) {
    notFound();
  }

  if (!enrollment.completedLessonIds.includes(lessonId)) {
    await prisma.enrollment.updateMany({
      where: {
        id: enrollment.id,
        NOT: {
          completedLessonIds: {
            has: lessonId,
          },
        },
      },
      data: {
        completedLessonIds: {
          push: lessonId,
        },
      },
    });
  }

  revalidatePath(`/dashboard/${slug}`);
  revalidatePath(`/dashboard/${slug}/${lessonId}`);
  revalidatePath("/dashboard");

  return {
    status: "success",
    message: "Progress updated",
  };
}
