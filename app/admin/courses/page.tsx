import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

export default function CoursesPage() {
  return (
    <div className="flex items-center justify-between gap-4 px-6 lg:px-10">
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
  );
}
