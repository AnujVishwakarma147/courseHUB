import Link from "next/link";
import {
  BookOpenIcon,
  SearchIcon,
  UsersIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { prisma } from "@/lib/db";

interface AdminSearchPageProps {
  searchParams: Promise<{
    q?: string | string[];
  }>;
}

export default async function AdminSearchPage({
  searchParams,
}: AdminSearchPageProps) {
  const params = await searchParams;

  const rawQuery = Array.isArray(params.q)
    ? params.q[0] ?? ""
    : params.q ?? "";

  const query = rawQuery.trim();

  const [courses, users] = query
    ? await Promise.all([
        prisma.course.findMany({
          where: {
            OR: [
              {
                title: {
                  contains: query,
                  mode: "insensitive",
                },
              },
              {
                category: {
                  contains: query,
                  mode: "insensitive",
                },
              },
              {
                smallDescription: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            ],
          },
          orderBy: {
            updatedAt: "desc",
          },
          take: 20,
          select: {
            id: true,
            title: true,
            smallDescription: true,
            category: true,
            level: true,
            status: true,
          },
        }),

        prisma.user.findMany({
          where: {
            OR: [
              {
                name: {
                  contains: query,
                  mode: "insensitive",
                },
              },
              {
                email: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            ],
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 20,
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        }),
      ])
    : [[], []];

  const totalResults =
    courses.length + users.length;

  return (
    <main className="px-5 md:px-7">
      <section className="mx-auto max-w-5xl">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <SearchIcon className="size-6" />
          </span>

          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Admin Search
            </h1>

            <p className="mt-1 text-muted-foreground">
              Search courses and registered users.
            </p>
          </div>
        </div>

        <form
          action="/admin/search"
          method="get"
          className="mt-7 flex gap-3"
        >
          <Input
            name="q"
            defaultValue={query}
            placeholder="Search course title, category, name or email..."
            className="h-12 rounded-xl text-base"
            autoFocus
          />

          <Button
            type="submit"
            className="h-12 rounded-xl px-6"
          >
            <SearchIcon className="size-4" />
            Search
          </Button>
        </form>

        {!query ? (
          <Card className="mt-7 rounded-2xl">
            <CardContent className="flex min-h-64 flex-col items-center justify-center text-center">
              <SearchIcon className="size-12 text-muted-foreground" />

              <h2 className="mt-4 text-xl font-semibold">
                Start searching
              </h2>

              <p className="mt-2 max-w-md text-muted-foreground">
                Enter a course title, course category,
                member name or email address.
              </p>
            </CardContent>
          </Card>
        ) : totalResults === 0 ? (
          <Card className="mt-7 rounded-2xl">
            <CardContent className="flex min-h-64 flex-col items-center justify-center text-center">
              <SearchIcon className="size-12 text-muted-foreground" />

              <h2 className="mt-4 text-xl font-semibold">
                No results found
              </h2>

              <p className="mt-2 text-muted-foreground">
                No results found for “{query}”.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="mt-7 space-y-8">
            <p className="text-sm text-muted-foreground">
              Found {totalResults} result
              {totalResults === 1 ? "" : "s"} for “{query}”
            </p>

            {courses.length > 0 && (
              <section>
                <div className="mb-4 flex items-center gap-2">
                  <BookOpenIcon className="size-5 text-primary" />

                  <h2 className="text-xl font-semibold">
                    Courses
                  </h2>

                  <Badge variant="secondary">
                    {courses.length}
                  </Badge>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {courses.map((course) => (
                    <Card
                      key={course.id}
                      className="rounded-2xl"
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between gap-3">
                          <CardTitle className="text-lg">
                            {course.title}
                          </CardTitle>

                          <Badge variant="outline">
                            {course.status}
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent>
                        <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
                          {course.smallDescription}
                        </p>

                        <div className="mt-4 flex gap-2">
                          <Badge variant="secondary">
                            {course.category}
                          </Badge>

                          <Badge variant="outline">
                            {course.level}
                          </Badge>
                        </div>

                        <Link
                          href={`/admin/courses/${course.id}/edit`}
                          className={buttonVariants({
                            variant: "outline",
                            className:
                              "mt-5 h-10 rounded-xl",
                          })}
                        >
                          Open Course
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {users.length > 0 && (
              <section>
                <div className="mb-4 flex items-center gap-2">
                  <UsersIcon className="size-5 text-primary" />

                  <h2 className="text-xl font-semibold">
                    Team and Users
                  </h2>

                  <Badge variant="secondary">
                    {users.length}
                  </Badge>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {users.map((user) => (
                    <Card
                      key={user.id}
                      className="rounded-2xl"
                    >
                      <CardContent className="flex items-center justify-between gap-4 p-5">
                        <div className="min-w-0">
                          <h3 className="truncate font-semibold">
                            {user.name}
                          </h3>

                          <p className="mt-1 truncate text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        </div>

                        <Badge
                          variant={
                            user.role === "admin"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {user.role === "admin"
                            ? "Admin"
                            : "Member"}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </section>
    </main>
  );
}