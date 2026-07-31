"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type CourseProgressContextValue = {
  completedLessonIds: ReadonlySet<string>;
  completedLessons: number;
  totalLessons: number;
  progress: number;
  markLessonCompleted: (lessonId: string) => void;
};

const CourseProgressContext =
  createContext<CourseProgressContextValue | null>(null);

type CourseProgressProviderProps = {
  children: ReactNode;
  initialCompletedLessonIds: string[];
  totalLessons: number;
};

export function CourseProgressProvider({
  children,
  initialCompletedLessonIds,
  totalLessons,
}: CourseProgressProviderProps) {
  const [completedLessonIds, setCompletedLessonIds] = useState(
    () => new Set(initialCompletedLessonIds),
  );

  const markLessonCompleted = useCallback((lessonId: string) => {
    setCompletedLessonIds((currentIds) => {
      if (currentIds.has(lessonId)) {
        return currentIds;
      }

      const nextIds = new Set(currentIds);
      nextIds.add(lessonId);
      return nextIds;
    });
  }, []);

  const value = useMemo<CourseProgressContextValue>(() => {
    const completedLessons = completedLessonIds.size;

    return {
      completedLessonIds,
      completedLessons,
      totalLessons,
      progress:
        totalLessons === 0
          ? 0
          : Math.round((completedLessons / totalLessons) * 100),
      markLessonCompleted,
    };
  }, [completedLessonIds, markLessonCompleted, totalLessons]);

  return (
    <CourseProgressContext value={value}>{children}</CourseProgressContext>
  );
}

export function useCourseProgress() {
  return useContext(CourseProgressContext);
}
