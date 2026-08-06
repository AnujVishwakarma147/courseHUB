"use client";

import { useCourseProgress } from "@/app/dashboard/_components/CourseProgressProvider";
import { buttonVariants } from "@/components/ui/button";
import { Award, BadgeCheck } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

type CourseCompletionCertificateProps = {
  children: ReactNode;
  courseTitle: string;
  slug: string;
};

export function CourseCompletionCertificate({
  children,
  courseTitle,
  slug,
}: CourseCompletionCertificateProps) {
  const courseProgress = useCourseProgress();

  if (
    !courseProgress ||
    courseProgress.totalLessons === 0 ||
    courseProgress.progress !== 100
  ) {
    return children;
  }

  return (
    <section className="mt-5 border border-emerald-500/40 bg-emerald-500/10 p-5 sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <span className="flex size-14 shrink-0 items-center justify-center bg-emerald-500 text-white">
          <Award className="size-8" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            <BadgeCheck className="size-4" />
            Course completed
          </p>
          <h2 className="mt-1 text-2xl font-semibold">Congratulations!</h2>
          <p className="mt-1 text-muted-foreground">
            You completed {courseTitle} with 100% progress. Your certificate is
            ready.
          </p>
        </div>

        <Link
          href={`/dashboard/${slug}/certificate`}
          className={buttonVariants({
            className: "h-11 shrink-0 rounded-none px-5 text-base",
          })}
        >
          <Award className="size-4" />
          View Certificate
        </Link>
      </div>
    </section>
  );
}
