"use server";

import { requireUser } from "@/app/data/user/require-user";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export type PlayerLesson = {
  id: string;
  title: string;
  description: string | null;
  thumbnailKey: string | null;
  videoKey: string | null;
  position: number;
  isCompleted: boolean;
};

export type PlayerChapter = {
  id: string;
  title: string;
  position: number;
  lessons: PlayerLesson[];
};

export type CourseSidebarData = {
  course: {
    id: string;
    title: string;
    slug: string;
    category: string;
    chapters: PlayerChapter[];
  };
  completedLessons: number;
  totalLessons: number;
  progress: number;
};

export async function getCourseSidebarData(
  slug: string,
): Promise<CourseSidebarData> {
  const user = await requireUser();
  const course = await prisma.course.findFirst({
    where: {
      slug,
      status: "Published",
      enrollment: {
        some: {
          userId: user.id,
          status: "Active",
        },
      },
    },
    select: {
      id: true,
      title: true,
      slug: true,
      category: true,
      chapters: {
        orderBy: {
          position: "asc",
        },
        select: {
          id: true,
          title: true,
          position: true,
          lessons: {
            orderBy: {
              position: "asc",
            },
            select: {
              id: true,
              title: true,
              description: true,
              thumbnailKey: true,
              videoKey: true,
              position: true,
            },
          },
        },
      },
      enrollment: {
        where: {
          userId: user.id,
          status: "Active",
        },
        take: 1,
        select: {
          completedLessonIds: true,
        },
      },
    },
  });

  if (!course) {
    redirect(`/courses/${slug}`);
  }

  const completedLessonIds = new Set(
    course.enrollment[0]?.completedLessonIds ?? [],
  );
  const chapters = course.chapters.map((chapter) => ({
    ...chapter,
    lessons: chapter.lessons.map((lesson) => ({
      ...lesson,
      isCompleted: completedLessonIds.has(lesson.id),
    })),
  }));
  const lessons = chapters.flatMap((chapter) => chapter.lessons);
  const completedLessons = lessons.filter(
    (lesson) => lesson.isCompleted,
  ).length;

  return {
    course: {
      id: course.id,
      title: course.title,
      slug: course.slug,
      category: course.category,
      chapters,
    },
    completedLessons,
    totalLessons: lessons.length,
    progress:
      lessons.length === 0
        ? 0
        : Math.round((completedLessons / lessons.length) * 100),
  };
}

export async function getFirstLessonId(slug: string) {
  const data = await getCourseSidebarData(slug);

  return (
    data.course.chapters
      .flatMap((chapter) => chapter.lessons)
      .at(0)?.id ?? null
  );
}
