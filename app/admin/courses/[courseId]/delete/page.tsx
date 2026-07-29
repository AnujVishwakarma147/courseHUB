import { notFound } from "next/navigation";

import { requireAdmin } from "@/app/data/admin/require-admin";
import { prisma } from "@/lib/db";

import { DeleteCourseConfirmation } from "./DeleteCourseConfirmation";

export default async function DeleteCourseRoute({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  await requireAdmin();
  const { courseId } = await params;
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      id: true,
      title: true,
    },
  });

  if (!course) notFound();

  return (
    <main className="flex min-h-[calc(100vh-var(--header-height)-3rem)] w-full items-center justify-center px-4 py-10">
      <DeleteCourseConfirmation
        courseId={course.id}
        courseTitle={course.title}
      />
    </main>
  );
}
