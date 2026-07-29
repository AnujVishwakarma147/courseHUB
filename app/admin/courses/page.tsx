import { adminGetCourses } from "@/app/data/admin/admin-get-courses";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

import { AdminCourseCard } from "./_components/AdminCourseCard";

export default async function CoursesPage() {
  const data = await adminGetCourses();

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

      <div className="grid gap-6 md:grid-cols-2">
        {data.map((course) => (
          <AdminCourseCard key={course.id} data={course} />
        ))}
      </div>
    </div>
  );
}
