import Link from "next/link";
import {
  CalendarDaysIcon,
  ChevronRightIcon,
  GraduationCapIcon,
  ShieldBanIcon,
  UserCheckIcon,
  UsersIcon,
} from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { prisma } from "@/lib/db";

export default async function AdminStudentsPage() {
  const students = await prisma.user.findMany({
    where: {
      OR: [
        { role: null },
        { role: { not: "admin" } },
      ],
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      image: true,
      banned: true,
      createdAt: true,
      _count: {
        select: {
          enrollment: {
            where: {
              status: "Active",
            },
          },
        },
      },
    },
  });

  const blockedCount = students.filter((student) => student.banned).length;

  return (
    <main className="px-5 md:px-7">
      <section className="mb-7">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <GraduationCapIcon className="size-6" />
          </span>

          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Students
            </h1>

            <p className="mt-1 text-muted-foreground">
              View registered students and manage their access.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-7 grid gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Registered Students"
          value={students.length}
          icon={<UsersIcon />}
        />
        <SummaryCard
          label="Active Students"
          value={students.length - blockedCount}
          icon={<UserCheckIcon />}
        />
        <SummaryCard
          label="Blocked Students"
          value={blockedCount}
          icon={<ShieldBanIcon />}
        />
      </section>

      {students.length === 0 ? (
        <Card className="rounded-2xl">
          <CardContent className="flex min-h-64 flex-col items-center justify-center text-center">
            <GraduationCapIcon className="size-12 text-muted-foreground" />
            <h2 className="mt-4 text-xl font-semibold">
              No students registered yet
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              New student accounts will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {students.map((student) => {
            const displayName = student.name || student.email.split("@")[0];

            return (
              <Link
                key={student.id}
                href={`/admin/students/${student.id}`}
                className="group rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Card className="h-full rounded-2xl transition-colors group-hover:border-primary/50">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <Avatar className="size-12 border">
                        <AvatarImage
                          src={student.image ?? undefined}
                          alt={displayName}
                        />
                        <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                          {displayName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1">
                        <h2 className="truncate text-lg font-semibold">
                          {displayName}
                        </h2>
                        <p className="mt-1 truncate text-sm text-muted-foreground">
                          {student.email}
                        </p>
                      </div>

                      <ChevronRightIcon className="mt-2 size-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="flex flex-wrap items-center gap-2">
                      {student.banned ? (
                        <Badge variant="destructive">
                          <ShieldBanIcon /> Blocked
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Active</Badge>
                      )}

                      <Badge variant="outline">
                        {student.emailVerified ? "Email verified" : "Email unverified"}
                      </Badge>
                    </div>

                    <div className="mt-4 rounded-xl border bg-muted/30 p-3">
                      <p className="text-xl font-bold">
                        {student._count.enrollment}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Active course enrollments
                      </p>
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarDaysIcon className="size-4" />
                      Joined {formatDate(student.createdAt)}
                    </div>
                  </CardContent>
                </Card>
              </Link>
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
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-bold">{value}</p>
        </div>

        <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary [&_svg]:size-5">
          {icon}
        </span>
      </CardContent>
    </Card>
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}
