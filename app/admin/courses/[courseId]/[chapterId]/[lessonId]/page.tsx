import { adminGetLesson } from "@/app/data/admin/admin-get-lesson";
import { env } from "@/lib/env";

import { LessonForm } from "./_components/LessonForm";

type Params = Promise<{
  courseId: string;
  chapterId: string;
  lessonId: string;
}>;

function cloudinaryUrl(
  key: string | null,
  resourceType: "image" | "video",
) {
  if (!key) return undefined;

  return (
    `https://res.cloudinary.com/${env.CLOUDINARY_CLOUD_NAME}` +
    `/${resourceType}/upload/${key}`
  );
}

export default async function LessonIdPage({ params }: { params: Params }) {
  const { chapterId, courseId, lessonId } = await params;
  const lesson = await adminGetLesson(lessonId, chapterId, courseId);

  return (
    <LessonForm
      data={lesson}
      chapterId={chapterId}
      courseId={courseId}
      initialThumbnailUrl={cloudinaryUrl(lesson.thumbnailKey, "image")}
      initialVideoUrl={cloudinaryUrl(lesson.videoKey, "video")}
    />
  );
}
