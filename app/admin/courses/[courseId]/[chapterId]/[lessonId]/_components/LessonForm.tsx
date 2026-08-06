"use client";

import { AdminLessonType } from "@/app/data/admin/admin-get-lesson";
import { Uploader } from "@/components/file-uploader/Uploader";
import { RichTextEditor } from "@/components/rich-text-editor/Editor";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, LoaderCircle, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";

import { updateLesson } from "../action";

interface iAppProps {
  data: AdminLessonType;
  chapterId: string;
  courseId: string;
  initialThumbnailUrl?: string;
  initialVideoUrl?: string;
}

interface LessonValues {
  title: string;
  description: string;
  thumbnailKey: string;
  videoKey: string;
}

export function LessonForm({
  chapterId,
  data,
  courseId,
  initialThumbnailUrl,
  initialVideoUrl,
}: iAppProps) {
  const router = useRouter();
  const [values, setValues] = useState<LessonValues>({
    title: data.title,
    description: data.description ?? "",
    thumbnailKey: data.thumbnailKey ?? "",
    videoKey: data.videoKey ?? "",
  });
  const [titleError, setTitleError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isThumbnailBusy, setIsThumbnailBusy] = useState(false);
  const [isVideoBusy, setIsVideoBusy] = useState(false);
  const hasRequiredMedia = Boolean(values.thumbnailKey && values.videoKey);
  const isMediaBusy = isThumbnailBusy || isVideoBusy;

  function setValue<Key extends keyof LessonValues>(
    key: Key,
    value: LessonValues[Key],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
    if (key === "title") setTitleError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (values.title.trim().length < 3) {
      setTitleError("Lesson name must be at least 3 characters");
      return;
    }

    if (isMediaBusy || !hasRequiredMedia) {
      toast.error("Upload the thumbnail image and video before saving");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await updateLesson({
        lessonId: data.id,
        chapterId,
        courseId,
        title: values.title,
        description: values.description,
        thumbnailKey: values.thumbnailKey,
        videoKey: values.videoKey,
      });

      if (response.status === "error") {
        toast.error(response.message);
        return;
      }

      toast.success(response.message);
      router.push(
        `/admin/courses/${courseId}/edit?tab=course-structure&chapter=${encodeURIComponent(chapterId)}`,
      );
    } catch {
      toast.error("Could not update the lesson");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-2 md:px-6 lg:px-10 lg:py-4">
      <Button
        type="button"
        variant="outline"
        className="h-12 rounded-none px-5 text-base"
        onClick={() => router.back()}
      >
        <ArrowLeft className="size-5" />
        Go Back
      </Button>

      <Card className="rounded-xl py-0">
        <CardHeader className="border-b px-6 py-7 lg:px-10">
          <CardTitle className="text-2xl font-semibold">
            Lesson Configuration
          </CardTitle>
          <CardDescription className="text-base">
            Configure the video and description for this lesson.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 py-7 lg:px-10 lg:py-9">
          <form className="space-y-7" noValidate onSubmit={handleSubmit}>
            <FormField label="Lesson Name" error={titleError}>
              <Input
                id="lesson-name"
                value={values.title}
                placeholder="Enter lesson name"
                aria-invalid={Boolean(titleError)}
                className="h-12 rounded-none px-4 text-base"
                onChange={(event) => setValue("title", event.target.value)}
              />
            </FormField>

            <FormField label="Description">
              <RichTextEditor
                value={values.description}
                onChange={(description) =>
                  setValue("description", description)
                }
              />
            </FormField>

            <FormField label="Thumbnail Image">
              <Uploader
                value={values.thumbnailKey}
                initialPreviewUrl={initialThumbnailUrl}
                mediaType="image"
                onBusyChange={setIsThumbnailBusy}
                onChange={(thumbnailKey) =>
                  setValue("thumbnailKey", thumbnailKey)
                }
              />
            </FormField>

            <FormField label="Video File">
              <Uploader
                value={values.videoKey}
                initialPreviewUrl={initialVideoUrl}
                mediaType="video"
                onBusyChange={setIsVideoBusy}
                onChange={(videoKey) => setValue("videoKey", videoKey)}
              />
            </FormField>

            <Button
              type="submit"
              disabled={isSubmitting || isMediaBusy || !hasRequiredMedia}
              className="h-12 rounded-none px-7 text-base"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className="size-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="size-5" />
                  Save Lesson
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2.5">
      <Label className="text-base font-medium">{label}</Label>
      {children}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
