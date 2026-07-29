import { adminGetCourses } from "@/app/data/admin/admin-get-courses";
import { EmptyState } from "@/components/general/EmptyState";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { Suspense } from "react";

import {
  AdminCourseCard,
  AdminCourseCardSkeleton,
} from "./_components/AdminCourseCard";

export default function CoursesPage() {
  return (
    <div className="space-y-8 px-6 lg:px-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Your Courses</h1>

        <Link
          href="/admin/courses/create"
          className={buttonVariants({
            size: "lg",
            className: "h-12 rounded-none px-6 text-base",
          })}
        >
          Create Course
        </Link>
      </div>

      <Suspense fallback={<AdminCourseCardSkeletonLayout />}>
        <RenderCourses />
      </Suspense>
    </div>
  );
}

async function RenderCourses() {
  const data = await adminGetCourses();

  if (data.length === 0) {
    return (
      <EmptyState
        title="No courses found"
        description="Create a new course to get started"
        buttonText="Create Course"
        href="/admin/courses/create"
      />
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {data.map((course, index) => (
        <AdminCourseCard
          key={course.id}
          data={course}
          priority={index === 0}
        />
      ))}
    </div>
  );
}

function AdminCourseCardSkeletonLayout() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <AdminCourseCardSkeleton key={index} />
      ))}
    </div>
  );
}
