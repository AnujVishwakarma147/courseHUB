import { CourseProgressProvider } from "@/app/dashboard/_components/CourseProgressProvider";
import { CourseSidebar } from "@/app/dashboard/_components/CourseSidebar";
import { getCourseSidebarData } from "@/app/data/course/get-course-sidebar-data";

type Params = Promise<{ slug: string }>;

export default async function CoursePlayerLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Params;
}>) {
  const { slug } = await params;
  const data = await getCourseSidebarData(slug);
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
      <div className="grid min-w-0 gap-8 px-5 pb-7 pt-4 sm:px-7 lg:grid-cols-[minmax(360px,0.95fr)_minmax(0,1.75fr)] lg:px-9 lg:pb-9 lg:pt-5">
        <CourseSidebar data={data} />
        <div className="min-w-0">{children}</div>
      </div>
    </CourseProgressProvider>
  );
}
