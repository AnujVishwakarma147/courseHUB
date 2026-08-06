import {
  markLessonComplete,
  type CoursePlayerData,
} from "@/app/data/course/get-lesson-content";
import { RenderDescription } from "@/components/rich-text-editor/RenderDescription";
import { env } from "@/lib/env";
import { BookOpen } from "lucide-react";
import { CompleteLessonButton } from "./CompleteLessonButton";
import { CourseCompletionCertificate } from "./CourseCompletionCertificate";

type CourseContentProps = {
  data: CoursePlayerData;
};

export function CourseContent({ data }: CourseContentProps) {
  const completeAction = markLessonComplete.bind(
    null,
    data.course.slug,
    data.lesson.id,
  );
  const videoUrl = data.lesson.videoKey
    ? `https://res.cloudinary.com/${env.CLOUDINARY_CLOUD_NAME}/video/upload/${data.lesson.videoKey}`
    : null;
  const thumbnailUrl = data.lesson.thumbnailKey
    ? `https://res.cloudinary.com/${env.CLOUDINARY_CLOUD_NAME}/image/upload/${data.lesson.thumbnailKey}`
    : undefined;

  return (
    <main className="min-w-0">
      {videoUrl ? (
        <video
          key={videoUrl}
          controls
          preload="metadata"
          poster={thumbnailUrl}
          className="aspect-video w-full bg-black object-contain"
        >
          <source src={videoUrl} />
          Your browser does not support HTML video.
        </video>
      ) : (
        <div className="flex aspect-video w-full items-center justify-center bg-muted dark:bg-black/35">
          <div className="px-6 text-center">
            <BookOpen className="mx-auto size-16 stroke-[1.5] text-primary" />
            <p className="mt-6 text-xl text-muted-foreground">
              This lesson does not have a video yet
            </p>
          </div>
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <CompleteLessonButton
          key={data.lesson.id}
          action={completeAction}
          initialCompleted={data.lesson.isCompleted}
          lessonId={data.lesson.id}
        />
      </div>

      <CourseCompletionCertificate
        courseTitle={data.course.title}
        slug={data.course.slug}
      >
        <div className="mt-5 border-t pt-5">
          <h2 className="text-4xl font-semibold tracking-tight">
            {data.lesson.title}
          </h2>

          <div className="mt-5">
            {data.lesson.description ? (
              <RenderDescription content={data.lesson.description} />
            ) : (
              <p className="text-muted-foreground">
                No description has been added for this lesson yet.
              </p>
            )}
          </div>
        </div>
      </CourseCompletionCertificate>
    </main>
  );
}
