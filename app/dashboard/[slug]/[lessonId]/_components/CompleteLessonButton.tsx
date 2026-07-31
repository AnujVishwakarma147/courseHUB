"use client";

import type { MarkLessonCompleteResult } from "@/app/data/course/get-lesson-content";
import { useCourseProgress } from "@/app/dashboard/_components/CourseProgressProvider";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";
import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const courseProgress = useCourseProgress();
  const [isCompleted, setIsCompleted] = useState(initialCompleted);
  const [pending, startTransition] = useTransition();

  function handleComplete() {
    startTransition(async () => {
      try {
        const result = await action();

        setIsCompleted(true);
        courseProgress?.markLessonCompleted(lessonId);
        toast.success(result.message);

        if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          void confetti({
            particleCount: 140,
            spread: 90,
            startVelocity: 38,
            origin: { x: 0.55, y: 0.62 },
          });
        }

        router.refresh();
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
