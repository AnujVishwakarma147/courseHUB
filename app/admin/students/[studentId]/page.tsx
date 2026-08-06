import Link from "next/link";
import {
  ArrowLeftIcon,
  CalendarDaysIcon,
  CheckCircle2Icon,
  Clock3Icon,
  GraduationCapIcon,
  MailIcon,
  ShieldBanIcon,
} from "lucide-react";
import { notFound } from "next/navigation";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { prisma } from "@/lib/db";

import {
  RemoveCourseAccessButton,
  StudentAccessActions,
} from "./_components/StudentActions";

type StudentDetailPageProps = {
  params: Promise<{
    studentId: string;
  }>;
};

export default async function StudentDetailPage({
  params,
}: StudentDetailPageProps) {
  const { studentId } = await params;
  const student = await prisma.user.findUnique({
    where: { id: studentId },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      image: true,
      role: true,
      banned: true,
      banReason: true,
      banExpires: true,
      createdAt: true,
      updatedAt: true,
      accounts: {
        select: {
          providerId: true,
        },
      },
      enrollment: {
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          Course: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
      },
    },
  });

  if (!student || student.role === "admin") {
    notFound();
  }

  const displayName = student.name || student.email.split("@")[0];
  const activeEnrollments = student.enrollment.filter(
    (enrollment) => enrollment.status === "Active",
  ).length;
  const providers = [
    ...new Set(student.accounts.map((account) => account.providerId)),
  ];

  return (
    <main className="px-5 md:px-7">
      <Link
        href="/admin/students"
        className={buttonVariants({
          variant: "ghost",
          size: "sm",
          className: "mb-5 -ml-2",
        })}
      >
        <ArrowLeftIcon /> Back to Students
      </Link>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="rounded-2xl">
          <CardContent className="p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <Avatar className="size-20 border">
                <AvatarImage
                  src={student.image ?? undefined}
                  alt={displayName}
                />
                <AvatarFallback className="bg-primary/10 text-2xl font-semibold text-primary">
                  {displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="truncate text-3xl font-bold tracking-tight">
                    {displayName}
                  </h1>
                  {student.banned ? (
                    <Badge variant="destructive">
                      <ShieldBanIcon /> Blocked
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Active Student</Badge>
                  )}
                </div>

                <p className="mt-2 flex items-center gap-2 text-muted-foreground">
                  <MailIcon className="size-4" /> {student.email}
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <InfoTile
                    label="Active courses"
                    value={String(activeEnrollments)}
                  />
                  <InfoTile
                    label="Total enrollments"
                    value={String(student.enrollment.length)}
                  />
                  <InfoTile
                    label="Email status"
                    value={student.emailVerified ? "Verified" : "Unverified"}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 border-t pt-5 text-sm sm:grid-cols-2">
              <DetailRow
                icon={<CalendarDaysIcon />}
                label="Joined"
                value={formatDate(student.createdAt)}
              />
              <DetailRow
                icon={<Clock3Icon />}
                label="Last updated"
                value={formatDate(student.updatedAt)}
              />
              <DetailRow
                icon={<CheckCircle2Icon />}
                label="Sign-in method"
                value={providers.length > 0 ? providers.join(", ") : "Email OTP"}
              />
              {student.banExpires ? (
                <DetailRow
                  icon={<ShieldBanIcon />}
                  label="Block expires"
                  value={formatDate(student.banExpires)}
                />
              ) : null}
            </div>
          </CardContent>
        </Card>

        <StudentAccessActions
          studentId={student.id}
          studentName={displayName}
          banned={Boolean(student.banned)}
          banReason={student.banReason}
        />
      </section>

      <section className="mt-7">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <GraduationCapIcon className="size-5" />
          </span>
          <div>
            <h2 className="text-2xl font-bold">Course Enrollments</h2>
            <p className="text-sm text-muted-foreground">
              Review course access and remove active enrollments.
            </p>
          </div>
        </div>

        {student.enrollment.length === 0 ? (
          <Card className="rounded-2xl">
            <CardContent className="flex min-h-48 flex-col items-center justify-center text-center">
              <GraduationCapIcon className="size-10 text-muted-foreground" />
              <p className="mt-3 font-medium">No course enrollments</p>
              <p className="mt-1 text-sm text-muted-foreground">
                This student has not enrolled in a course yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {student.enrollment.map((enrollment) => (
              <Card key={enrollment.id} className="rounded-2xl">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <CardTitle className="truncate text-lg">
                        {enrollment.Course.title}
                      </CardTitle>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Enrolled {formatDate(enrollment.createdAt)}
                      </p>
                    </div>
                    <EnrollmentBadge status={enrollment.status} />
                  </div>
                </CardHeader>

                <CardContent className="flex flex-wrap items-center justify-between gap-3">
                  <Link
                    href={`/admin/courses/${enrollment.Course.id}/edit`}
                    className={buttonVariants({
                      variant: "ghost",
                      size: "sm",
                    })}
                  >
                    Open Course
                  </Link>

                  {enrollment.status === "Active" ? (
                    <RemoveCourseAccessButton
                      studentId={student.id}
                      studentName={displayName}
                      enrollmentId={enrollment.id}
                      courseSlug={enrollment.Course.slug}
                      courseTitle={enrollment.Course.title}
                    />
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-muted/30 p-3">
      <p className="text-lg font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-muted-foreground [&_svg]:size-4">{icon}</span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium capitalize">{value}</p>
      </div>
    </div>
  );
}

function EnrollmentBadge({
  status,
}: {
  status: "Pending" | "Active" | "Cancelled";
}) {
  if (status === "Active") {
    return <Badge>Active</Badge>;
  }

  if (status === "Cancelled") {
    return <Badge variant="destructive">Removed</Badge>;
  }

  return <Badge variant="outline">Pending</Badge>;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}
