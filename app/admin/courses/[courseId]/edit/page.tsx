import { notFound } from "next/navigation";

import { requireAdmin } from "@/app/data/admin/require-admin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";

import { CourseStructure } from "./_components/CourseStructure";
import { EditCourseForm } from "./_components/EditCourseForm";

export default async function EditCoursePage({
  params,
  searchParams,
}: {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{
    tab?: string | string[];
    chapter?: string | string[];
  }>;
}) {
  await requireAdmin();

  const { courseId } = await params;
  const query = await searchParams;
  const requestedTab = Array.isArray(query.tab) ? query.tab[0] : query.tab;
  const requestedChapter = Array.isArray(query.chapter)
    ? query.chapter[0]
    : query.chapter;
  const initialTab =
    requestedTab === "course-structure" ? "course-structure" : "basic-info";
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      id: true,
      title: true,
      slug: true,
      smallDescription: true,
      description: true,
      fileKey: true,
      category: true,
      price: true,
      duration: true,
      level: true,
      status: true,
      chapters: {
        orderBy: { position: "asc" },
        select: {
          id: true,
          title: true,
          position: true,
          lessons: {
            orderBy: { position: "asc" },
            select: {
              id: true,
              title: true,
              position: true,
            },
          },
        },
      },
    },
  });

  if (!course) notFound();

  const initialChapterId = course.chapters.some(
    (chapter) => chapter.id === requestedChapter,
  )
    ? requestedChapter
    : undefined;

  const imageUrl =
    `https://res.cloudinary.com/${env.CLOUDINARY_CLOUD_NAME}` +
    `/image/upload/${course.fileKey}`;

  return (
    <div className="space-y-5">
      <Tabs defaultValue={initialTab} className="w-full">
        <TabsList className="grid h-12 w-full grid-cols-2 rounded-none">
          <TabsTrigger value="basic-info" className="rounded-none text-base">
            Basic Info
          </TabsTrigger>
          <TabsTrigger
            value="course-structure"
            className="rounded-none text-base"
          >
            Course Structure
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic-info">
          <EditCourseForm
            courseId={course.id}
            initialImageUrl={imageUrl}
            initialValues={{
              title: course.title,
              slug: course.slug,
              smallDescription: course.smallDescription,
              description: course.description,
              fileKey: course.fileKey,
              category: course.category,
              price: course.price,
              duration: course.duration,
              level: course.level,
              status: course.status,
            }}
          />
        </TabsContent>

        <TabsContent value="course-structure">
          <CourseStructure
            courseId={course.id}
            initialChapters={course.chapters}
            initialChapterId={initialChapterId}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
