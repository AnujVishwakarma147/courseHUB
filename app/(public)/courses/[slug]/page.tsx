import { getIndividualCourse } from "@/app/data/course/get-course";
import { checkIfCourseBought } from "@/app/data/user/user-is-enrolled";
import { RenderDescription } from "@/components/rich-text-editor/RenderDescription";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { env } from "@/lib/env";
import {
  BarChart3,
  BookOpen,
  Check,
  ChevronDown,
  Clock3,
  LayoutGrid,
  Play,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import {
  confirmStripeCheckoutAction,
} from "./actions";
import { EnrollmentButton } from "./_components/EnrollmentButton";

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<{
  session_id?: string;
  enrolled?: string;
}>;

export default async function SlugPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const [{ slug }, query, requestHeaders] = await Promise.all([
    params,
    searchParams,
    headers(),
  ]);
  const [course, session] = await Promise.all([
    getIndividualCourse(slug),
    auth.api.getSession({ headers: requestHeaders }),
  ]);
  let enrollmentResult:
    | Awaited<ReturnType<typeof confirmStripeCheckoutAction>>
    | undefined;

  if (query.session_id && session?.user) {
    enrollmentResult = await confirmStripeCheckoutAction(
      query.session_id,
      course.id,
    );
  }

  const isEnrolled = session?.user
    ? await checkIfCourseBought(course.id, session.user.id)
    : false;
  const totalLessons = course.chapters.reduce(
    (total, chapter) => total + chapter.lessons.length,
    0,
  );
  const firstLessonId = course.chapters
    .flatMap((chapter) => chapter.lessons)
    .at(0)?.id;
  const thumbnailUrl =
    `https://res.cloudinary.com/${env.CLOUDINARY_CLOUD_NAME}` +
    `/image/upload/${course.fileKey}`;
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: env.STRIPE_CURRENCY.toUpperCase(),
  }).format(course.price);

  return (
    <div className="grid grid-cols-1 gap-8 py-6 lg:grid-cols-3 lg:gap-10">
      <article className="min-w-0 lg:col-span-2">
        <Image
          src={thumbnailUrl}
          alt={course.title}
          width={1600}
          height={900}
          sizes="(min-width: 1024px) 66vw, 100vw"
          priority
          className="aspect-video h-auto w-full rounded-md object-contain ring-1 ring-foreground/10"
        />

        <h1 className="mt-8 text-3xl font-bold tracking-tight md:text-4xl">
          {course.title}
        </h1>

        <p className="mt-4 text-lg text-muted-foreground">
          {course.smallDescription}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Badge className="h-8 rounded-none px-4">
            <BarChart3 />
            {course.level}
          </Badge>
          <Badge className="h-8 rounded-none px-4">
            <LayoutGrid />
            {course.category}
          </Badge>
          <Badge className="h-8 rounded-none px-4">
            <Clock3 />
            {course.duration} hours
          </Badge>
        </div>

        <div className="my-8 h-px bg-border" />

        <section>
          <h2 className="text-2xl font-semibold">Course Description</h2>
          <div className="mt-6">
            <RenderDescription content={course.description} />
          </div>
        </section>

        <section id="course-content" className="mt-12 scroll-mt-28 pb-12">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold">Course Content</h2>
            <p className="text-sm text-muted-foreground md:text-base">
              {course.chapters.length} chapters | {totalLessons} Lessons
            </p>
          </div>

          {course.chapters.length === 0 ? (
            <div className="rounded-md border p-8 text-center text-muted-foreground">
              Course content will be available soon.
            </div>
          ) : (
            <div className="space-y-5">
              {course.chapters.map((chapter, chapterIndex) => (
                <details
                  key={chapter.id}
                  className="group overflow-hidden rounded-md border bg-card"
                >
                  <summary className="flex cursor-pointer list-none items-center gap-5 p-6 outline-none [&::-webkit-details-marker]:hidden">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                      {chapterIndex + 1}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xl font-semibold">
                        {chapter.title}
                      </span>
                      <span className="mt-1 block text-sm text-muted-foreground">
                        {chapter.lessons.length}{" "}
                        {chapter.lessons.length === 1 ? "lesson" : "lessons"}
                      </span>
                    </span>

                    <span className="hidden border px-3 py-1 text-sm text-muted-foreground sm:inline">
                      {chapter.lessons.length}{" "}
                      {chapter.lessons.length === 1 ? "lesson" : "lessons"}
                    </span>
                    <ChevronDown className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                  </summary>

                  <div className="border-t">
                    {chapter.lessons.length === 0 ? (
                      <p className="p-6 text-sm text-muted-foreground">
                        No lessons available in this chapter yet.
                      </p>
                    ) : (
                      chapter.lessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className="flex items-center gap-4 px-8 py-5 not-last:border-b"
                        >
                          <span className="flex size-10 shrink-0 items-center justify-center rounded-full border text-muted-foreground">
                            <Play className="size-4 fill-current" />
                          </span>
                          <span className="min-w-0">
                            <span className="block font-medium">
                              {lesson.title}
                            </span>
                            {lesson.description ? (
                              <span className="mt-1 line-clamp-1 block text-sm text-muted-foreground">
                                {lesson.description}
                              </span>
                            ) : null}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </details>
              ))}
            </div>
          )}
        </section>
      </article>

      <aside className="min-w-0 lg:w-full lg:self-start">
        <Card className="gap-0 p-6 lg:fixed lg:top-[104px] lg:w-[calc((100vw-10rem)/3)]">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">Price:</h2>
            <p className="text-2xl font-bold text-primary">{formattedPrice}</p>
          </div>

          <div className="mt-8 bg-muted/60 p-5">
            <h3 className="text-lg font-semibold">What you will get:</h3>

            <div className="mt-5 space-y-5">
              <CourseFact
                icon={<Clock3 />}
                label="Course Duration"
                value={`${course.duration} hours`}
              />
              <CourseFact
                icon={<BarChart3 />}
                label="Difficulty Level"
                value={course.level}
              />
              <CourseFact
                icon={<LayoutGrid />}
                label="Category"
                value={course.category}
              />
              <CourseFact
                icon={<BookOpen />}
                label="Total Lessons"
                value={`${totalLessons} Lessons`}
              />
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-medium">This course includes:</h3>
            <div className="mt-4 space-y-3">
              <IncludedItem text="Full lifetime access" />
              <IncludedItem text="Access on mobile and desktop" />
              <IncludedItem text="Certificate of completion" />
            </div>
          </div>

          {enrollmentResult?.status === "error" ? (
            <p className="mt-8 border border-destructive/40 bg-destructive/10 p-3 text-center text-sm text-destructive">
              {enrollmentResult.message}
            </p>
          ) : query.enrolled === "true" ? (
            <p className="mt-8 border border-emerald-500/40 bg-emerald-500/10 p-3 text-center text-sm text-emerald-500">
              You are now enrolled in this course.
            </p>
          ) : null}

          {isEnrolled ? (
            <Link
              href={
                firstLessonId
                  ? `/dashboard/${course.slug}/${firstLessonId}`
                  : `/dashboard/${course.slug}`
              }
              className={buttonVariants({
                size: "lg",
                className:
                  "mt-8 h-12 w-full gap-2 rounded-none text-base",
              })}
            >
              <Play className="size-4 fill-current" />
              Watch Now
            </Link>
          ) : session?.user ? (
            <EnrollmentButton courseId={course.id} />
          ) : (
            <Link
              href="/login"
              className={buttonVariants({
                size: "lg",
                className: "mt-8 h-12 w-full rounded-none text-base",
              })}
            >
              Sign in to Enroll
            </Link>
          )}

          <p className="mt-4 text-center text-sm text-muted-foreground">
            30-day money-back guarantee
          </p>
        </Card>
      </aside>
    </div>
  );
}

function CourseFact({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary [&_svg]:size-5">
        {icon}
      </span>
      <span>
        <span className="block font-medium">{label}</span>
        <span className="mt-0.5 block text-sm text-muted-foreground">
          {value}
        </span>
      </span>
    </div>
  );
}

function IncludedItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500">
        <Check className="size-4" />
      </span>
      <span>{text}</span>
    </div>
  );
}
