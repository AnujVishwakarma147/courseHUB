"use client";

import type { CourseSidebarData } from "@/app/data/course/get-course-sidebar-data";
import { buttonVariants } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ChevronDown, Play } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCourseProgress } from "./CourseProgressProvider";
import { LessonItem } from "./LessonIten";

type CourseSidebarProps = {
  data: CourseSidebarData;
};

export function CourseSidebar({ data }: CourseSidebarProps) {
  const { lessonId: activeLessonId } = useParams<{ lessonId?: string }>();
  const courseProgress = useCourseProgress();
  const completedLessons =
    courseProgress?.completedLessons ?? data.completedLessons;
  const totalLessons = courseProgress?.totalLessons ?? data.totalLessons;
  const progress = courseProgress?.progress ?? data.progress;

  return (
    <aside className="min-w-0 lg:pr-6">
      <Link
        href="/dashboard"
        className={buttonVariants({
          variant: "outline",
          className: "mb-5 w-full rounded-none",
        })}
      >
        <ArrowLeft className="size-4" />
        Back to Dashboard
      </Link>

      <div className="border-b pb-6">
        <div className="flex items-center gap-4">
          <span className="flex size-15 shrink-0 items-center justify-center bg-primary/10 text-primary">
            <Play className="size-6 stroke-[1.5]" />
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold tracking-tight">
              {data.course.title}
            </h1>
            <p className="mt-1 text-base text-muted-foreground">
              {data.course.category}
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-4 text-base">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">
            {completedLessons}/{totalLessons} lessons
          </span>
        </div>
        <Progress
          value={progress}
          className="mt-3 gap-0 [&_[data-slot=progress-track]]:h-2"
        />
        <p className="mt-3 text-base text-muted-foreground">
          {progress}% complete
        </p>
      </div>

      <div className="mt-6 space-y-4">
        {data.course.chapters.map((chapter, chapterIndex) => {
          const containsActiveLesson = chapter.lessons.some(
            (lesson) => lesson.id === activeLessonId,
          );

          return (
            <details
              key={chapter.id}
              open={containsActiveLesson}
              className="group"
            >
              <summary className="flex min-h-18 cursor-pointer list-none items-center gap-3 border bg-background px-5 py-3 outline-none transition-colors duration-200 hover:border-primary/35 hover:bg-primary/10 dark:bg-muted dark:hover:border-primary/40 dark:hover:bg-primary/15 [&::-webkit-details-marker]:hidden">
                <ChevronDown className="size-4 shrink-0 text-primary" />
                <span className="min-w-0">
                  <span className="block truncate text-lg font-semibold">
                    {chapterIndex + 1}: {chapter.title}
                  </span>
                  <span className="mt-0.5 block text-sm text-muted-foreground">
                    {chapter.lessons.length}{" "}
                    {chapter.lessons.length === 1 ? "lesson" : "lessons"}
                  </span>
                </span>
              </summary>

              {chapter.lessons.length > 0 ? (
                <div className="ml-0 space-y-3 py-3 pl-6">
                  {chapter.lessons.map((lesson) => (
                    <LessonItem
                      key={lesson.id}
                      slug={data.course.slug}
                      lesson={lesson}
                      isActive={lesson.id === activeLessonId}
                      isCompleted={
                        courseProgress?.completedLessonIds.has(lesson.id) ??
                        lesson.isCompleted
                      }
                    />
                  ))}
                </div>
              ) : null}
            </details>
          );
        })}
      </div>
    </aside>
  );
}
