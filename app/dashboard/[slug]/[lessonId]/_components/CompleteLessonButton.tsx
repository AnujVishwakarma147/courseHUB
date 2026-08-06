"use client";

import type { MarkLessonCompleteResult } from "@/app/data/course/get-lesson-content";
import { useCourseProgress } from "@/app/dashboard/_components/CourseProgressProvider";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";
import { CheckCircle2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

type CompleteLessonButtonProps = {
  action: () => Promise<MarkLessonCompleteResult>;
  initialCompleted: boolean;
  lessonId: string;
};

export function CompleteLessonButton({
  action,
  initialCompleted,
  lessonId,
}: CompleteLessonButtonProps) {
  const courseProgress = useCourseProgress();
  const [isCompleted, setIsCompleted] = useState(initialCompleted);
  const [pending, startTransition] = useTransition();

  function handleComplete() {
    const completesCourse = Boolean(
      courseProgress &&
        courseProgress.totalLessons > 0 &&
        !courseProgress.completedLessonIds.has(lessonId) &&
        courseProgress.completedLessons + 1 >= courseProgress.totalLessons,
    );

    startTransition(async () => {
      try {
        const result = await action();

        setIsCompleted(true);
        courseProgress?.markLessonCompleted(lessonId);
        toast.success(
          completesCourse
            ? "Congratulations! You completed the course."
            : result.message,
        );

        if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          void confetti({
            particleCount: completesCourse ? 240 : 140,
            spread: completesCourse ? 120 : 90,
            startVelocity: completesCourse ? 48 : 38,
            origin: { x: 0.55, y: 0.62 },
          });
        }
      } catch {
        toast.error("Could not update lesson progress");
      }
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      disabled={pending || isCompleted}
      onClick={handleComplete}
      className="h-13 rounded-none px-5 text-lg"
    >
      <CheckCircle2 className="text-emerald-500" />
      {isCompleted ? "Completed" : "Mark as Complete"}
    </Button>
  );
}
