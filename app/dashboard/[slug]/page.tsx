import { getFirstLessonId } from "@/app/data/course/get-course-sidebar-data";
import { buttonVariants } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

type Params = Promise<{ slug: string }>;

export default async function CourseStartPage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;
  const firstLessonId = await getFirstLessonId(slug);

  if (firstLessonId) {
    redirect(`/dashboard/${slug}/${firstLessonId}`);
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center border">
      <div className="max-w-md px-6 text-center">
        <BookOpen className="mx-auto size-14 text-primary" />
        <h1 className="mt-5 text-2xl font-semibold">Lessons are coming soon</h1>
        <p className="mt-2 text-muted-foreground">
          This course does not have a published lesson yet.
        </p>
        <Link
          href="/dashboard"
          className={buttonVariants({
            className: "mt-6 rounded-none",
          })}
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
