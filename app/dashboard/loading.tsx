import { PublicCourseCardSkeleton } from "@/app/(public)/_components/PublicCourseCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <main
      className="px-5 py-8 lg:px-9 lg:py-10"
      role="status"
      aria-label="Loading dashboard courses"
    >
      <Skeleton className="mb-6 h-10 w-36 rounded-none" />

      <div className="flex flex-col gap-3">
        <h1 className="text-4xl font-bold tracking-tight">Enrolled Courses</h1>
        <p className="text-lg text-muted-foreground">
          Here you can see all the courses you have access to
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <PublicCourseCardSkeleton key={index} />
        ))}
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

        <div className="mt-3 grid grid-cols-1 gap-6 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <PublicCourseCardSkeleton key={index} />
          ))}
        </div>
      </section>

      <span className="sr-only">Loading dashboard...</span>
    </main>
  );
}
