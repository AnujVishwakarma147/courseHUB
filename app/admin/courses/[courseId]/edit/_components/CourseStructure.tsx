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
  LoaderCircle,
  Plus,
  Trash2,
} from "lucide-react";
import { useState, type CSSProperties } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

import {
  createChapter,
  createLesson,
  deleteChapter,
  deleteLesson,
  reorderChapters,
  reorderLessons,
} from "../structure-actions";

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

    if (activeType === "chapter" && overType === "chapter") {
      const oldIndex = chapters.findIndex(
        ({ id }) => chapterDndId(id) === active.id,
      );
      const newIndex = chapters.findIndex(
        ({ id }) => chapterDndId(id) === over.id,
      );
      if (oldIndex < 0 || newIndex < 0) return;

      const previous = chapters;
      const next = arrayMove(chapters, oldIndex, newIndex).map(
        (chapter, index) => ({ ...chapter, position: index + 1 }),
      );
      setChapters(next);
      setIsBusy(true);

      const response = await reorderChapters(
        courseId,
        next.map(({ id }) => id),
      );

      if (response.status === "error") {
        setChapters(previous);
        toast.error(response.message);
      } else {
        toast.success(response.message);
      }
      setIsBusy(false);
      return;
    }

    if (activeType === "lesson" && overType === "lesson") {
      const activeChapterId = active.data.current?.chapterId as
        | string
        | undefined;
      const overChapterId = over.data.current?.chapterId as string | undefined;

      if (!activeChapterId || activeChapterId !== overChapterId) {
        toast.error("Lessons can only be reordered inside their chapter");
        return;
      }

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

      const response = await reorderLessons(
        courseId,
        activeChapterId,
        reorderedLessons.map(({ id }) => id),
      );

      if (response.status === "error") {
        setChapters(previous);
        toast.error(response.message);
      } else {
        toast.success(response.message);
      }
      setIsBusy(false);
    }
  }

  async function handleCreateChapter() {
    setIsBusy(true);
    const response = await createChapter(courseId);

    if (response.status === "error" || !response.data) {
      toast.error(response.message);
    } else {
      setChapters((current) => [...current, response.data!]);
      toast.success(response.message);
    }
    setIsBusy(false);
  }

  async function handleCreateLesson(chapterId: string) {
    setIsBusy(true);
    const response = await createLesson(courseId, chapterId);

    if (response.status === "error" || !response.data) {
      toast.error(response.message);
    } else {
      setChapters((current) =>
        current.map((chapter) =>
          chapter.id === chapterId
            ? {
                ...chapter,
                lessons: [...chapter.lessons, response.data!],
              }
            : chapter,
        ),
      );
      toast.success(response.message);
    }
    setIsBusy(false);
  }

  async function handleDeleteChapter(chapterId: string) {
    if (
      !window.confirm(
        "Delete this chapter and all of its lessons? This cannot be undone.",
      )
    ) {
      return;
    }

    setIsBusy(true);
    const response = await deleteChapter(courseId, chapterId);

    if (response.status === "error") {
      toast.error(response.message);
    } else {
      setChapters((current) =>
        current
          .filter(({ id }) => id !== chapterId)
          .map((chapter, index) => ({ ...chapter, position: index + 1 })),
      );
      toast.success(response.message);
    }
    setIsBusy(false);
  }

  async function handleDeleteLesson(chapterId: string, lessonId: string) {
    if (!window.confirm("Delete this lesson? This cannot be undone.")) return;

    setIsBusy(true);
    const response = await deleteLesson(courseId, lessonId);

    if (response.status === "error") {
      toast.error(response.message);
    } else {
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
      toast.success(response.message);
    }
    setIsBusy(false);
  }

  return (
    <main className="mx-auto w-full max-w-7xl space-y-8 px-4 py-2 md:px-6 lg:px-10 lg:py-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Course Structure
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          Arrange chapters and drag lessons into the order students will see.
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <Card className="overflow-hidden rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between border-b">
            <div className="space-y-1">
              <CardTitle className="text-xl">Chapters</CardTitle>
              <CardDescription>
                Use the dotted handles to drag and reorder.
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              className="rounded-none"
              disabled={isBusy}
              onClick={handleCreateChapter}
            >
              {isBusy ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                <Plus />
              )}
              Add Chapter
            </Button>
          </CardHeader>

          <CardContent className="p-6 lg:p-9">
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
                <div className="space-y-5">
                  {chapters.map((chapter, chapterIndex) => (
                    <SortableChapter
                      key={chapter.id}
                      chapter={chapter}
                      chapterNumber={chapterIndex + 1}
                      disabled={isBusy}
                      onCreateLesson={() => handleCreateLesson(chapter.id)}
                      onDeleteChapter={() =>
                        handleDeleteChapter(chapter.id)
                      }
                      onDeleteLesson={(lessonId) =>
                        handleDeleteLesson(chapter.id, lessonId)
                      }
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
  chapter: CourseStructureChapter;
  chapterNumber: number;
  disabled: boolean;
  onCreateLesson: () => void;
  onDeleteChapter: () => void;
  onDeleteLesson: (lessonId: string) => void;
}

function SortableChapter({
  chapter,
  chapterNumber,
  disabled,
  onCreateLesson,
  onDeleteChapter,
  onDeleteLesson,
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
        "overflow-hidden rounded-lg border bg-card",
        isDragging && "relative z-20 opacity-70 shadow-xl",
      )}
    >
      <div className="flex min-h-16 items-center gap-2 border-b px-3 sm:px-5">
        <button
          type="button"
          className="touch-none cursor-grab rounded-md p-2 text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing disabled:pointer-events-none disabled:opacity-50"
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
          <span className="truncate text-base font-medium">
            Chapter Nr. {chapterNumber}
          </span>
          {!/^Chapter Nr\. \d+$/.test(chapter.title) ? (
            <span className="hidden truncate text-sm text-muted-foreground md:inline">
              {chapter.title}
            </span>
          ) : null}
        </button>

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="shrink-0 rounded-none"
          aria-label={`Delete chapter ${chapterNumber}`}
          disabled={disabled}
          onClick={onDeleteChapter}
        >
          <Trash2 />
        </Button>
      </div>

      {isOpen ? (
        <div className="space-y-3 p-3 sm:p-5">
          <SortableContext
            items={chapter.lessons.map(({ id }) => lessonDndId(id))}
            strategy={verticalListSortingStrategy}
          >
            <div className="overflow-hidden rounded-md border">
              {chapter.lessons.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  No lessons in this chapter yet.
                </div>
              ) : (
                chapter.lessons.map((lesson, lessonIndex) => (
                  <SortableLesson
                    key={lesson.id}
                    chapterId={chapter.id}
                    lesson={lesson}
                    lessonNumber={lessonIndex + 1}
                    disabled={disabled}
                    onDelete={() => onDeleteLesson(lesson.id)}
                  />
                ))
              )}
            </div>
          </SortableContext>

          <Button
            type="button"
            variant="outline"
            className="h-12 w-full rounded-none text-base"
            disabled={disabled}
            onClick={onCreateLesson}
          >
            <Plus />
            Create New Lesson
          </Button>
        </div>
      ) : null}
    </section>
  );
}

interface SortableLessonProps {
  chapterId: string;
  lesson: CourseStructureLesson;
  lessonNumber: number;
  disabled: boolean;
  onDelete: () => void;
}

function SortableLesson({
  chapterId,
  lesson,
  lessonNumber,
  disabled,
  onDelete,
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
        "flex min-h-16 items-center gap-2 border-b bg-card px-3 last:border-b-0 sm:px-5",
        isDragging && "relative z-30 opacity-70 shadow-xl",
      )}
    >
      <button
        type="button"
        className="touch-none cursor-grab rounded-md p-2 text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing disabled:pointer-events-none disabled:opacity-50"
        aria-label={`Drag lesson ${lessonNumber}`}
        disabled={disabled}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-5" />
      </button>

      <FileText className="size-5 shrink-0" />
      <span className="min-w-0 flex-1 truncate text-base">
        Lesson Nr. {lessonNumber}
      </span>
      {!/^Lesson Nr\. \d+$/.test(lesson.title) ? (
        <span className="hidden max-w-72 truncate text-sm text-muted-foreground md:block">
          {lesson.title}
        </span>
      ) : null}

      <Button
        type="button"
        variant="outline"
        size="icon"
        className="shrink-0 rounded-none"
        aria-label={`Delete lesson ${lessonNumber}`}
        disabled={disabled}
        onClick={onDelete}
      >
        <Trash2 />
      </Button>
    </div>
  );
}
