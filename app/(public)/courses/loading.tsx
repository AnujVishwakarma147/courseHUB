import { PublicCoursesSkeleton } from "../_components/PublicCourseCard";

export default function CoursesLoading() {
  return (
    <div className="py-12">
      <div className="mb-12 flex flex-col space-y-3">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          Explore Courses
        </h1>

        <p className="max-w-3xl text-base text-muted-foreground md:text-lg">
          Discover our wide range of courses designed to help you achieve your
          learning goals.
        </p>
      </div>

      <PublicCoursesSkeleton />
    </div>
  );
}
