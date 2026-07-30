import { adminGetRecentCourses } from "@/app/data/admin/admin-get-recent-courses";
import { AdminCourseCard, AdminCourseCardSkeleton } from "@/app/admin/courses/_components/AdminCourseCard";
import { adminGetDashboardStats } from "@/app/data/admin/admin-get-dashboard-stats";
import { adminGetEnrollmentStats } from "@/app/data/admin/admin-get-enrollment-stats";
import { ChartAreaInteractive } from "@/components/sidebar/chart-area-interactive";
import { SectionCards } from "@/components/sidebar/section-cards";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Suspense } from "react";

export default function AdminIndexPage() {
  return (
    <>
      <Suspense fallback={<DashboardStatsSkeleton />}>
        <DashboardStats />
      </Suspense>

      <Suspense fallback={<EnrollmentChartSkeleton />}>
        <EnrollmentChart />
      </Suspense>

      <section className="px-4 lg:px-8">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Recent Courses</h2>
          <Link
            href="/admin/courses"
            className={buttonVariants({
              variant: "outline",
              className: "h-10 rounded-none px-5 text-sm",
            })}
          >
            View All Courses
          </Link>
        </div>
        <Suspense fallback={<RecentCoursesSkeleton />}>
          <RenderRecentCourses />
        </Suspense>
      </section>
    </>
  );
}

async function DashboardStats() {
  const data = await adminGetDashboardStats();
  return <SectionCards data={data} />;
}

async function EnrollmentChart() {
  const data = await adminGetEnrollmentStats();
  return (
    <div className="px-4 lg:px-8">
      <ChartAreaInteractive data={data} />
    </div>
  );
}

async function RenderRecentCourses() {
  const [courses] = await Promise.all([
    adminGetRecentCourses(),
    new Promise((resolve) => setTimeout(resolve, 2000)),
  ]);

  if (courses.length === 0) {
    return (
      <div className="flex min-h-48 items-center justify-center border border-dashed text-muted-foreground">
        No courses created yet.
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {courses.map((course, index) => (
        <AdminCourseCard
          key={course.id}
          data={course}
          priority={index === 0}
        />
      ))}
    </div>
  );
}

function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 px-4 lg:grid-cols-2 lg:px-8">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="flex min-h-44 flex-col border border-border/80 bg-card px-7 py-7"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <Skeleton className="h-4 w-32 rounded-sm" />
              <Skeleton className="h-10 w-14 rounded-sm" />
            </div>
            <Skeleton className="size-8 rounded-sm" />
          </div>
          <Skeleton className="mt-auto h-4 w-56 max-w-full rounded-sm" />
        </div>
      ))}
    </div>
  );
}

function EnrollmentChartSkeleton() {
  return (
    <div className="px-4 lg:px-8">
      <div className="border border-border/80 bg-card px-7 py-6">
        <Skeleton className="h-6 w-44 rounded-sm" />
        <Skeleton className="mt-3 h-4 w-72 max-w-full rounded-sm" />
        <div className="mt-8 flex h-56 items-end gap-3 border-b border-border/70 px-2">
          {[28, 42, 32, 56, 38, 68, 44, 52, 36, 76, 48, 62].map(
            (height, index) => (
              <Skeleton
                key={index}
                className="flex-1 rounded-t-sm rounded-b-none"
                style={{ height: `${height}%` }}
              />
            ),
          )}
        </div>
      </div>
    </div>
  );
}

function RecentCoursesSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading recent courses"
      className="grid gap-6 md:grid-cols-2"
    >
      {Array.from({ length: 2 }).map((_, index) => (
        <AdminCourseCardSkeleton key={index} />
      ))}
      <span className="sr-only">Loading recent courses...</span>
    </div>
  );
}
