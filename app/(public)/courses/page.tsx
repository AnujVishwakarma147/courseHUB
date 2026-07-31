import { getAllCourses } from "@/app/data/course/get-all-courses";
import { EmptyState } from "@/components/general/EmptyState";
import { Suspense } from "react";
import {
  PublicCourseCard,
  PublicCoursesSkeleton,
} from "../_components/PublicCourseCard";

export default function PublicCoursesroute() {
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

      <Suspense fallback={<PublicCoursesSkeleton />}>
        <RenderCourses />
      </Suspense>
    </div>
  );
}

async function RenderCourses() {
  const courses = await getAllCourses();

  if (courses.length === 0) {
    return (
      <EmptyState
        title="No courses available"
        description="Published courses will appear here."
        buttonText="Go Home"
        href="/"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {courses.map((course, index) => (
        <PublicCourseCard
          key={course.id}
          data={course}
          priority={index === 0}
        />
      ))}
    </div>
  );
}
