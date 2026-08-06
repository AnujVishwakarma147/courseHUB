import {
  BookOpenIcon,
  CalendarDaysIcon,
  ShieldCheckIcon,
  UsersIcon,
} from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { prisma } from "@/lib/db";

export default async function AdminTeamPage() {
  const users = await prisma.user.findMany({
    where: {
      role: "admin",
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      banned: true,
      createdAt: true,

      _count: {
        select: {
          courses: true,
        },
      },
    },
  });

  const activeAdminCount = users.filter(
    (user) => !user.banned,
  ).length;
  const createdCourseCount = users.reduce(
    (total, user) => total + user._count.courses,
    0,
  );

  return (
    <main className="px-5 md:px-7">
      <section className="mb-7">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <UsersIcon className="size-6" />
          </span>

          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Team Members
            </h1>

            <p className="mt-1 text-muted-foreground">
              Administrators who manage courses and platform
              operations.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-7 grid gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Total Admins"
          value={users.length}
          icon={<UsersIcon />}
        />

        <SummaryCard
          label="Active Admins"
          value={activeAdminCount}
          icon={<ShieldCheckIcon />}
        />

        <SummaryCard
          label="Courses Created"
          value={createdCourseCount}
          icon={<BookOpenIcon />}
        />
      </section>

      {users.length === 0 ? (
        <Card className="rounded-2xl">
          <CardContent className="flex min-h-64 flex-col items-center justify-center">
            <UsersIcon className="size-12 text-muted-foreground" />

            <h2 className="mt-4 text-xl font-semibold">
              No administrators found
            </h2>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {users.map((user) => {
            const displayName =
              user.name || user.email.split("@")[0];

            const fallback =
              displayName.charAt(0).toUpperCase();

            return (
              <Card
                key={user.id}
                className="rounded-2xl"
              >
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <Avatar className="size-12 border">
                      <AvatarImage
                        src={user.image ?? undefined}
                        alt={displayName}
                      />

                      <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                        {fallback}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-lg font-semibold">
                        {displayName}
                      </h2>

                      <p className="mt-1 truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>

                    <RoleBadge
                      banned={Boolean(user.banned)}
                    />
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="rounded-xl border bg-muted/30 p-3">
                    <BookOpenIcon className="size-4 text-muted-foreground" />

                    <p className="mt-2 text-xl font-bold">
                      {user._count.courses}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      Created courses
                    </p>
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarDaysIcon className="size-4" />

                    Joined{" "}
                    {new Intl.DateTimeFormat("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }).format(user.createdAt)}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
}

function SummaryCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <Card className="rounded-2xl">
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm text-muted-foreground">
            {label}
          </p>

          <p className="mt-2 text-3xl font-bold">
            {value}
          </p>
        </div>

        <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary [&_svg]:size-5">
          {icon}
        </span>
      </CardContent>
    </Card>
  );
}

function RoleBadge({
  banned,
}: {
  banned: boolean;
}) {
  if (banned) {
    return (
      <Badge variant="destructive">
        Banned
      </Badge>
    );
  }

  return (
    <Badge>
      Admin
    </Badge>
  );
}
