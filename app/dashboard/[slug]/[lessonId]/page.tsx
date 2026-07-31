import { CourseSidebar } from "@/app/dashboard/_components/CourseSidebar";
import { CourseProgressProvider } from "@/app/dashboard/_components/CourseProgressProvider";
import { getLessonContent } from "@/app/data/course/get-lesson-content";
import { CourseContent } from "./_components/CourseContent";

type Params = Promise<{
  slug: string;
  lessonId: string;
}>;

export default async function LessonPage({ params }: { params: Params }) {
  const { slug, lessonId } = await params;
  const data = await getLessonContent(slug, lessonId);
  const completedLessonIds = data.course.chapters.flatMap((chapter) =>
    chapter.lessons
      .filter((lesson) => lesson.isCompleted)
      .map((lesson) => lesson.id),
  );

  return (
    <CourseProgressProvider
      key={data.course.id}
      initialCompletedLessonIds={completedLessonIds}
      totalLessons={data.totalLessons}
    >
      <div className="grid min-w-0 gap-8 px-5 py-7 sm:px-7 lg:grid-cols-[minmax(360px,0.95fr)_minmax(0,1.75fr)] lg:px-9 lg:py-9">
        <CourseSidebar data={data} />
        <CourseContent data={data} />
      </div>
    </CourseProgressProvider>
  );
}
