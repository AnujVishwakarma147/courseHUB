import { AdminCourseCardSkeleton } from "./_components/AdminCourseCard";

export default function AdminCoursesLoading() {
  return (
    <div
      className="space-y-8 px-6 lg:px-10"
      role="status"
      aria-label="Loading courses"
    >
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Your Courses</h1>
        <div className="h-12 w-40 animate-pulse bg-muted" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <AdminCourseCardSkeleton key={index} />
        ))}
      </div>

      <span className="sr-only">Loading course cards...</span>
    </div>
  );
}
