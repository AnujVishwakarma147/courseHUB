"use client";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ChevronDown,
  FileText,
  GripVertical,
} from "lucide-react";
import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { reorderChapters, reorderLessons } from "../action";
import { DeleteChapter } from "./DeleteChapter";
import { DeleteLesson } from "./DeleteLesson";
import { NewChapterModal } from "./NewChapterModel";
import { NewLessonModal } from "./NewLessonModel";

export interface CourseStructureLesson {
  id: string;
  title: string;
  position: number;
}

export interface CourseStructureChapter {
  id: string;
  title: string;
  position: number;
  lessons: CourseStructureLesson[];
}

interface CourseStructureProps {
  courseId: string;
  initialChapters: CourseStructureChapter[];
}

const chapterDndId = (id: string) => `chapter:${id}`;
const lessonDndId = (id: string) => `lesson:${id}`;

export function CourseStructure({
  courseId,
  initialChapters,
}: CourseStructureProps) {
  const [chapters, setChapters] = useState(initialChapters);
  const [isBusy, setIsBusy] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id || isBusy) return;

    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;

    if (activeType === "chapter") {
      const targetChapterId =
        overType === "chapter"
          ? (over.data.current?.itemId as string | undefined)
          : overType === "lesson"
            ? (over.data.current?.chapterId as string | undefined)
            : undefined;

      if (!targetChapterId) return;

      const oldIndex = chapters.findIndex(
        ({ id }) => chapterDndId(id) === active.id,
      );
      const newIndex = chapters.findIndex(({ id }) => id === targetChapterId);
      if (oldIndex < 0 || newIndex < 0) return;

      const previous = chapters;
      const next = arrayMove(chapters, oldIndex, newIndex).map(
        (chapter, index) => ({ ...chapter, position: index + 1 }),
      );
      setChapters(next);
      setIsBusy(true);
      const toastId = toast.loading("Saving chapter order...");

      try {
        const response = await reorderChapters(
          courseId,
          next.map(({ id }) => id),
        );

        if (response.status === "error") {
          setChapters(previous);
          toast.error(response.message, { id: toastId });
        } else {
          toast.success(response.message, { id: toastId });
        }
      } catch {
        setChapters(previous);
        toast.error("Could not save chapter order", { id: toastId });
      } finally {
        setIsBusy(false);
      }
      return;
    }

    if (activeType === "lesson") {
      const activeChapterId = active.data.current?.chapterId as
        | string
        | undefined;
      const overChapterId =
        overType === "lesson"
          ? (over.data.current?.chapterId as string | undefined)
          : overType === "chapter"
            ? (over.data.current?.itemId as string | undefined)
            : undefined;

      if (!activeChapterId || activeChapterId !== overChapterId) {
        toast.error("Lessons can only be reordered inside their chapter");
        return;
      }

      if (overType !== "lesson") return;

      const chapter = chapters.find(({ id }) => id === activeChapterId);
      if (!chapter) return;

      const oldIndex = chapter.lessons.findIndex(
        ({ id }) => lessonDndId(id) === active.id,
      );
      const newIndex = chapter.lessons.findIndex(
        ({ id }) => lessonDndId(id) === over.id,
      );
      if (oldIndex < 0 || newIndex < 0) return;

      const previous = chapters;
      const reorderedLessons = arrayMove(
        chapter.lessons,
        oldIndex,
        newIndex,
      ).map((lesson, index) => ({ ...lesson, position: index + 1 }));
      const next = chapters.map((item) =>
        item.id === activeChapterId
          ? { ...item, lessons: reorderedLessons }
          : item,
      );
      setChapters(next);
      setIsBusy(true);
      const toastId = toast.loading("Saving lesson order...");

      try {
        const response = await reorderLessons(
          courseId,
          activeChapterId,
          reorderedLessons.map(({ id }) => id),
        );

        if (response.status === "error") {
          setChapters(previous);
          toast.error(response.message, { id: toastId });
        } else {
          toast.success(response.message, { id: toastId });
        }
      } catch {
        setChapters(previous);
        toast.error("Could not save lesson order", { id: toastId });
      } finally {
        setIsBusy(false);
      }
    }
  }

  function handleCreateLesson(
    chapterId: string,
    lesson: CourseStructureLesson,
  ) {
    setChapters((current) =>
      current.map((chapter) =>
        chapter.id === chapterId
          ? {
              ...chapter,
              lessons: [...chapter.lessons, lesson],
            }
          : chapter,
      ),
    );
  }

  function handleDeletedChapter(chapterId: string) {
    setChapters((current) =>
      current
        .filter(({ id }) => id !== chapterId)
        .map((chapter, index) => ({ ...chapter, position: index + 1 })),
    );
  }

  function handleDeletedLesson(chapterId: string, lessonId: string) {
    setChapters((current) =>
      current.map((chapter) =>
        chapter.id === chapterId
          ? {
              ...chapter,
              lessons: chapter.lessons
                .filter(({ id }) => id !== lessonId)
                .map((lesson, index) => ({
                  ...lesson,
                  position: index + 1,
                })),
            }
          : chapter,
      ),
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl space-y-8 px-4 py-2 md:px-6 lg:px-8 lg:py-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Course Structure
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          Here you can update your Course Structure
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <Card className="overflow-hidden rounded-none py-0">
          <CardHeader className="flex min-h-20 flex-row items-center justify-between border-b px-6 py-4 lg:px-9">
            <div>
              <CardTitle className="text-2xl">Chapters</CardTitle>
              <CardDescription className="sr-only">
                Use the dotted handles to drag and reorder.
              </CardDescription>
            </div>
            <NewChapterModal
              courseId={courseId}
              disabled={isBusy}
              onCreated={(chapter) =>
                setChapters((current) => [...current, chapter])
              }
            />
          </CardHeader>

          <CardContent className="p-5 lg:p-9">
            {chapters.length === 0 ? (
              <div className="rounded-lg border border-dashed p-10 text-center">
                <p className="font-medium">No chapters yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add your first chapter to start creating lessons.
                </p>
              </div>
            ) : (
              <SortableContext
                items={chapters.map(({ id }) => chapterDndId(id))}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-8">
                  {chapters.map((chapter, chapterIndex) => (
                    <SortableChapter
                      key={chapter.id}
                      courseId={courseId}
                      chapter={chapter}
                      chapterNumber={chapterIndex + 1}
                      disabled={isBusy}
                      onCreateLesson={(lesson) =>
                        handleCreateLesson(chapter.id, lesson)
                      }
                      onDeleteChapter={() => handleDeletedChapter(chapter.id)}
                      onDeleteLesson={(lessonId) =>
                        handleDeletedLesson(chapter.id, lessonId)
                      }
                      onPendingChange={setIsBusy}
                    />
                  ))}
                </div>
              </SortableContext>
            )}
          </CardContent>
        </Card>
      </DndContext>
    </main>
  );
}

interface SortableChapterProps {
  courseId: string;
  chapter: CourseStructureChapter;
  chapterNumber: number;
  disabled: boolean;
  onCreateLesson: (lesson: CourseStructureLesson) => void;
  onDeleteChapter: () => void;
  onDeleteLesson: (lessonId: string) => void;
  onPendingChange: (pending: boolean) => void;
}

function SortableChapter({
  courseId,
  chapter,
  chapterNumber,
  disabled,
  onCreateLesson,
  onDeleteChapter,
  onDeleteLesson,
  onPendingChange,
}: SortableChapterProps) {
  const [isOpen, setIsOpen] = useState(true);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: chapterDndId(chapter.id),
    data: { type: "chapter", itemId: chapter.id },
    disabled,
  });
  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <section
      ref={setNodeRef}
      style={style}
      className={cn(
        "overflow-hidden rounded-xl border bg-card",
        isDragging && "relative z-20 opacity-70 shadow-xl",
      )}
    >
      <div className="flex min-h-24 items-center gap-3 border-b px-4 sm:px-7">
        <button
          type="button"
          className="touch-none cursor-grab rounded-md p-2 text-foreground/80 outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing disabled:pointer-events-none disabled:opacity-50"
          aria-label={`Drag chapter ${chapterNumber}`}
          disabled={disabled}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-5" />
        </button>

        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-3 rounded-md px-2 py-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((current) => !current)}
        >
          <ChevronDown
            className={cn(
              "size-5 shrink-0 transition-transform",
              !isOpen && "-rotate-90",
            )}
          />
          <span className="truncate text-xl font-medium">
            {chapter.title}
          </span>
        </button>

        <DeleteChapter
          courseId={courseId}
          chapterId={chapter.id}
          chapterNumber={chapterNumber}
          disabled={disabled}
          onDeleted={onDeleteChapter}
          onPendingChange={onPendingChange}
        />
      </div>

      {isOpen ? (
        <div className="space-y-4 p-3 sm:p-5">
          <SortableContext
            items={chapter.lessons.map(({ id }) => lessonDndId(id))}
            strategy={verticalListSortingStrategy}
          >
            <div className="overflow-hidden">
              {chapter.lessons.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  No lessons in this chapter yet.
                </div>
              ) : (
                chapter.lessons.map((lesson, lessonIndex) => (
                  <SortableLesson
                    key={lesson.id}
                    courseId={courseId}
                    chapterId={chapter.id}
                    lesson={lesson}
                    lessonNumber={lessonIndex + 1}
                    disabled={disabled}
                    onDelete={() => onDeleteLesson(lesson.id)}
                    onPendingChange={onPendingChange}
                  />
                ))
              )}
            </div>
          </SortableContext>

          <NewLessonModal
            courseId={courseId}
            chapterId={chapter.id}
            disabled={disabled}
            onCreated={onCreateLesson}
          />
        </div>
      ) : null}
    </section>
  );
}

interface SortableLessonProps {
  courseId: string;
  chapterId: string;
  lesson: CourseStructureLesson;
  lessonNumber: number;
  disabled: boolean;
  onDelete: () => void;
  onPendingChange: (pending: boolean) => void;
}

function SortableLesson({
  courseId,
  chapterId,
  lesson,
  lessonNumber,
  disabled,
  onDelete,
  onPendingChange,
}: SortableLessonProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: lessonDndId(lesson.id),
    data: { type: "lesson", chapterId, itemId: lesson.id },
    disabled,
  });
  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex min-h-[76px] items-center gap-3 border-b bg-card px-3 transition-colors last:border-b-0 hover:bg-accent/35 sm:px-5",
        isDragging && "relative z-30 opacity-70 shadow-xl",
      )}
    >
      <button
        type="button"
        className="touch-none cursor-grab rounded-md p-2 text-foreground/80 outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing disabled:pointer-events-none disabled:opacity-50"
        aria-label={`Drag lesson ${lessonNumber}`}
        disabled={disabled}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-5" />
      </button>

      <Link
        href={`/admin/courses/${courseId}/${chapterId}/${lesson.id}`}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-md py-3 outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`Edit lesson ${lesson.title}`}
      >
        <FileText className="size-5 shrink-0" />
        <span className="truncate text-xl">{lesson.title}</span>
      </Link>

      <DeleteLesson
        courseId={courseId}
        lessonId={lesson.id}
        lessonNumber={lessonNumber}
        disabled={disabled}
        onDeleted={onDelete}
        onPendingChange={onPendingChange}
      />
    </div>
  );
}
