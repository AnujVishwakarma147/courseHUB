import { cn } from "@/lib/utils";
import { Check, Play } from "lucide-react";
import Link from "next/link";

type LessonItemProps = {
  slug: string;
  lesson: {
    id: string;
    title: string;
    position: number;
  };
  isActive: boolean;
  isCompleted: boolean;
};

export function LessonItem({
  slug,
  lesson,
  isActive,
  isCompleted,
}: LessonItemProps) {
  return (
    <Link
      href={`/dashboard/${slug}/${lesson.id}`}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex w-full items-center gap-4 border bg-background px-6",
        "transition-[background-color,border-color,color,transform] duration-200 ease-out",
        "hover:border-primary/50 hover:bg-primary/10 focus-visible:border-primary/60 focus-visible:bg-primary/10 focus-visible:outline-none",
        isCompleted
          ? "h-14 border-emerald-500/25 bg-emerald-500/10 text-emerald-800 hover:bg-emerald-500/15 dark:bg-emerald-950/35 dark:text-emerald-300 dark:hover:border-emerald-500/45 dark:hover:bg-emerald-900/45"
          : isActive
            ? "h-14 border-primary/45 bg-primary/20 text-primary hover:bg-primary/25 dark:bg-primary/20 dark:hover:bg-primary/30"
            : "h-[45px] dark:bg-background/35 dark:hover:border-primary/50 dark:hover:bg-primary/20",
      )}
    >
      <span
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-muted-foreground/65 text-foreground",
          isCompleted
            ? "border-emerald-500 bg-emerald-500 text-white"
            : isActive && "border-primary text-primary",
        )}
      >
        {isCompleted ? (
          <Check className="size-4 stroke-3" />
        ) : (
          <Play className="ml-0.5 size-3.5 fill-current" />
        )}
      </span>

      <span className="min-w-0">
        <span className="block truncate text-lg font-medium">
          {lesson.position}. {lesson.title}
        </span>
        {isCompleted ? (
          <span className="mt-0.5 block text-sm font-medium text-emerald-600 dark:text-emerald-400">
            Completed
          </span>
        ) : isActive ? (
          <span className="mt-0.5 block text-sm font-medium text-primary">
            Currently Watching
          </span>
        ) : null}
      </span>
    </Link>
  );
}
