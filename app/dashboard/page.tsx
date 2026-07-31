import {
  PublicCourseCard,
  PublicCourseCardSkeleton,
} from "@/app/(public)/_components/PublicCourseCard";
import { CourseProgressCard } from "@/app/dashboard/_components/CourseProgressCard";
import { EmptyState } from "@/components/general/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { cache, Suspense } from "react";
import { getAllCourses } from "../data/course/get-all-courses";
import { getEnrolledCourses } from "../data/user/get-enrolled-courses";

const getDashboardCourses = cache(getAllCourses);
const getDashboardEnrollments = cache(getEnrolledCourses);

export default function DashboardPage() {

  return (
    <main className="px-5 py-8 lg:px-9 lg:py-10">
      <div className="flex flex-col gap-3">
        <h1 className="text-4xl font-bold tracking-tight">Enrolled Courses</h1>
        <p className="text-lg text-muted-foreground">
          Here you can see all the courses you have access to
        </p>
      </div>

      <div className="mt-8">
        <Suspense fallback={<EnrolledCoursesSkeleton />}>
          <RenderEnrolledCourses />
        </Suspense>
      </div>

      <section className="mt-16">
        <div className="flex flex-col gap-3">
          <h2 className="text-4xl font-bold tracking-tight">
            Available Courses
          </h2>
          <p className="text-lg text-muted-foreground">
            Here you can see all the courses you can purchase
          </p>
        </div>

        <div className="mt-3">
          <Suspense fallback={<AvailableCoursesSkeleton />}>
            <RenderAvailableCourses />
          </Suspense>
        </div>
      </section>
    </main>
  );
}

async function RenderEnrolledCourses() {
  const enrolledCourses = await getDashboardEnrollments();

  if (enrolledCourses.length === 0) {
    return (
      <EmptyState
        title="No courses purchased"
        description="You haven't purchased any courses yet."
        buttonText="Browse Courses"
        href="/courses"
        className="min-h-108 rounded-sm"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {enrolledCourses.map((enrollment, index) => (
        <CourseProgressCard
          key={enrollment.Course.id}
          data={enrollment}
          priority={index === 0}
        />
      ))}
    </div>
  );
}

async function RenderAvailableCourses() {
  const [courses, enrolledCourses] = await Promise.all([
    getDashboardCourses(),
    getDashboardEnrollments(),
  ]);
  const availableCourses = courses.filter(
    (course) =>
      !enrolledCourses.some(
        ({ Course: enrolled }) => enrolled.id === course.id,
      ),
  );

  if (availableCourses.length === 0) {
    return (
      <EmptyState
        title="No courses available"
        description="You have already purchased all available courses"
        buttonText="Browse Courses"
        href="/courses"
        className="min-h-80 rounded-sm"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {availableCourses.map((course, index) => (
        <PublicCourseCard
          key={course.id}
          data={course}
          priority={enrolledCourses.length === 0 && index === 0}
        />
      ))}
    </div>
  );
}

function EnrolledCoursesSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading enrolled courses"
      className="flex min-h-108 flex-col items-center justify-center rounded-sm border border-dashed p-8"
    >
      <Skeleton className="size-20 rounded-full" />
      <Skeleton className="mt-6 h-6 w-52 rounded-sm" />
      <Skeleton className="mt-3 h-4 w-72 max-w-full rounded-sm" />
      <Skeleton className="mt-8 h-11 w-44 rounded-none" />
      <span className="sr-only">Loading enrolled courses...</span>
    </div>
  );
}

function AvailableCoursesSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading available courses"
      className="grid grid-cols-1 gap-6 md:grid-cols-2"
    >
      {Array.from({ length: 2 }).map((_, index) => (
        <PublicCourseCardSkeleton key={index} />
      ))}
      <span className="sr-only">Loading available courses...</span>
    </div>
  );
}
