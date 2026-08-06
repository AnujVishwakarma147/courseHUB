import type { getEnrolledCourses } from "@/app/data/user/get-enrolled-courses";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { env } from "@/lib/env";
import { Award } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type EnrolledCourse = Awaited<ReturnType<typeof getEnrolledCourses>>[number];

type CourseProgressCardProps = {
  data: EnrolledCourse;
  priority?: boolean;
};

export function CourseProgressCard({
  data,
  priority = false,
}: CourseProgressCardProps) {
  const course = data.Course;
  const thumbnailUrl =
    `https://res.cloudinary.com/${env.CLOUDINARY_CLOUD_NAME}` +
    `/image/upload/${course.fileKey}`;
  const lessonIds = new Set(
    course.chapters.flatMap((chapter) =>
      chapter.lessons.map((lesson) => lesson.id),
    ),
  );
  const completedLessons = new Set(
    data.completedLessonIds.filter((lessonId) => lessonIds.has(lessonId)),
  ).size;
  const totalLessons = lessonIds.size;
  const progressPercentage =
    totalLessons === 0
      ? 0
      : Math.round((completedLessons / totalLessons) * 100);

  return (
    <Card className="group relative gap-0 overflow-hidden rounded-sm py-0">
      <Badge className="absolute top-3 right-3 z-10 h-8 rounded-none px-3 text-base">
        {course.level}
      </Badge>

      <Image
        src={thumbnailUrl}
        alt={course.title}
        width={600}
        height={400}
        sizes="(min-width: 768px) 50vw, 100vw"
        priority={priority}
        className="aspect-video w-full object-cover"
      />

      <CardContent className="p-6">
        <Link
          href={`/dashboard/${course.slug}`}
          className="line-clamp-1 text-2xl font-medium transition-colors group-hover:text-primary hover:underline"
        >
          {course.title}
        </Link>

        <p className="mt-3 line-clamp-1 text-base text-muted-foreground">
          {course.smallDescription}
        </p>

        <div className="mt-5">
          <div className="flex items-center justify-between text-base">
            <span>Progress:</span>
            <span className="font-medium">{progressPercentage}%</span>
          </div>
          <Progress
            value={progressPercentage}
            className="mt-2 gap-0 **:data-[slot=progress-track]:h-2"
          />
          <p className="mt-4 text-base text-muted-foreground">
            {completedLessons} of {totalLessons} lessons completed
          </p>
        </div>

        <div
          className={`mt-6 grid gap-3 ${
            progressPercentage === 100 ? "sm:grid-cols-2" : ""
          }`}
        >
          <Link
            href={`/dashboard/${course.slug}`}
            className={buttonVariants({
              size: "lg",
              variant: progressPercentage === 100 ? "outline" : "default",
              className: "h-13 w-full rounded-none text-base",
            })}
          >
            {progressPercentage === 100 ? "Review Course" : "Learn More"}
          </Link>

          {progressPercentage === 100 ? (
            <Link
              href={`/dashboard/${course.slug}/certificate`}
              className={buttonVariants({
                size: "lg",
                className: "h-13 w-full rounded-none text-base",
              })}
            >
              <Award className="size-4" />
              View Certificate
            </Link>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
