import { getLessonContent } from "@/app/data/course/get-lesson-content";
import { CourseContent } from "@/app/dashboard/[slug]/[lessonId]/_components/CourseContent";

type Params = Promise<{
  slug: string;
  lessonId: string;
}>;

export default async function LessonPage({ params }: { params: Params }) {
  const { slug, lessonId } = await params;
  const data = await getLessonContent(slug, lessonId);

  return <CourseContent data={data} />;
}
