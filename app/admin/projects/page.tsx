import Link from "next/link";
import {
  BookOpenIcon,
  Clock3Icon,
  FolderKanbanIcon,
  Layers3Icon,
  UsersIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { prisma } from "@/lib/db";

export default async function AdminProjectsPage() {
  const courses = await prisma.course.findMany({
    orderBy: {
      updatedAt: "desc",
    },
    select: {
      id: true,
      title: true,
      slug: true,
      smallDescription: true,
      status: true,
      level: true,
      category: true,
      updatedAt: true,

      chapters: {
        select: {
          _count: {
            select: {
              lessons: true,
            },
          },
        },
      },

      _count: {
        select: {
          enrollment: true,
        },
      },
    },
  });

  return (
    <main className="px-5 md:px-7">
      <section className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FolderKanbanIcon className="size-6" />
            </span>

            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Course Projects
              </h1>

              <p className="mt-1 text-muted-foreground">
                Manage course development and publishing
                progress.
              </p>
            </div>
          </div>
        </div>

        <Link
          href="/admin/courses/create"
          className={buttonVariants({
            className: "h-11 rounded-xl px-5",
          })}
        >
          Create New Course
        </Link>
      </section>

      {courses.length === 0 ? (
        <Card className="rounded-2xl">
          <CardContent className="flex min-h-72 flex-col items-center justify-center text-center">
            <FolderKanbanIcon className="size-12 text-muted-foreground" />

            <h2 className="mt-4 text-xl font-semibold">
              No projects found
            </h2>

            <p className="mt-2 text-muted-foreground">
              Create your first course project to get started.
            </p>

            <Link
              href="/admin/courses/create"
              className={buttonVariants({
                className: "mt-5 rounded-xl",
              })}
            >
              Create Course
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => {
            const totalLessons =
              course.chapters.reduce(
                (total, chapter) =>
                  total + chapter._count.lessons,
                0,
              );

            return (
              <Card
                key={course.id}
                className="rounded-2xl transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <BookOpenIcon className="size-5" />
                    </span>

                    <StatusBadge
                      status={course.status}
                    />
                  </div>

                  <CardTitle className="mt-4 line-clamp-1 text-xl">
                    {course.title}
                  </CardTitle>

                  <p className="line-clamp-2 min-h-10 text-sm leading-5 text-muted-foreground">
                    {course.smallDescription}
                  </p>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    <ProjectStat
                      icon={<Layers3Icon />}
                      value={course.chapters.length}
                      label="Chapters"
                    />

                    <ProjectStat
                      icon={<BookOpenIcon />}
                      value={totalLessons}
                      label="Lessons"
                    />

                    <ProjectStat
                      icon={<UsersIcon />}
                      value={course._count.enrollment}
                      label="Students"
                    />
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <Badge variant="secondary">
                      {course.category}
                    </Badge>

                    <Badge variant="outline">
                      {course.level}
                    </Badge>
                  </div>

                  <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock3Icon className="size-4" />

                    Updated{" "}
                    {new Intl.DateTimeFormat("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }).format(course.updatedAt)}
                  </div>

                  <Link
                    href={`/admin/courses/${course.id}/edit`}
                    className={buttonVariants({
                      variant: "outline",
                      className:
                        "mt-5 h-10 w-full rounded-xl",
                    })}
                  >
                    Manage Project
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  if (status === "Published") {
    return (
      <Badge className="bg-green-600 text-white hover:bg-green-600">
        Published
      </Badge>
    );
  }

  if (status === "Archived") {
    return (
      <Badge variant="secondary">
        Archived
      </Badge>
    );
  }

  return (
    <Badge variant="outline">
      Draft
    </Badge>
  );
}

function ProjectStat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-xl border bg-muted/30 p-3">
      <div className="flex items-center gap-1.5 text-muted-foreground [&_svg]:size-4">
        {icon}
        <span className="text-xs">{label}</span>
      </div>

      <p className="mt-2 text-xl font-bold">
        {value}
      </p>
    </div>
  );
}