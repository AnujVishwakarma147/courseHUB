"use client";

import type { CourseSidebarData } from "@/app/data/course/get-course-sidebar-data";
import { useMemo } from "react";

interface AppProps {
  courseData: CourseSidebarData["course"];
}

interface CourseProgressResult {
    totalLessons: number;
    completedLessons: number;
    progressPercentage: number;
}

export function useCourseProgress({
  courseData,
}: AppProps): CourseProgressResult {
  return useMemo(() => {
    const lessons = courseData.chapters.flatMap((chapter) => chapter.lessons);
    const totalLessons = lessons.length;
    const completedLessons = lessons.filter(
      (lesson) => lesson.isCompleted,
    ).length;
    const progressPercentage =
      totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;

    return {
      totalLessons,
      completedLessons,
      progressPercentage,
    };
  }, [courseData]);
}
