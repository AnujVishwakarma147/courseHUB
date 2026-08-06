import { AdminCourseCardSkeleton } from "./courses/_components/AdminCourseCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboardLoading() {
  return (
    <div role="status" aria-label="Loading admin dashboard">
      <div className="grid grid-cols-1 gap-5 px-4 lg:grid-cols-2 lg:px-8">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="flex min-h-44 flex-col border border-border/80 bg-card px-7 py-7"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-14" />
              </div>
              <Skeleton className="size-8" />
            </div>
            <Skeleton className="mt-auto h-4 w-56 max-w-full" />
          </div>
        ))}
      </div>

      <div className="mt-5 px-4 lg:px-8">
        <div className="border border-border/80 bg-card px-7 py-6">
          <Skeleton className="h-6 w-44" />
          <Skeleton className="mt-3 h-4 w-72 max-w-full" />
          <Skeleton className="mt-8 h-56 w-full" />
        </div>
      </div>

      <section className="mt-5 px-4 lg:px-8">
        <Skeleton className="mb-4 h-6 w-40" />
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <AdminCourseCardSkeleton key={index} />
          ))}
        </div>
      </section>

      <span className="sr-only">Loading admin cards...</span>
    </div>
  );
}
