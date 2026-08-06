import Link from "next/link";
import {
  ArrowRightIcon,
  BarChart3Icon,
  BookOpenIcon,
  CheckCircle2Icon,
  TargetIcon,
  UsersIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const values = [
  {
    title: "Quality Learning",
    description:
      "Carefully structured courses designed to make difficult concepts easier to understand.",
    icon: BookOpenIcon,
  },
  {
    title: "Learn at Your Pace",
    description:
      "Study whenever it works for you and continue learning from where you left off.",
    icon: TargetIcon,
  },
  {
    title: "Progress Tracking",
    description:
      "Track completed lessons and understand your progress throughout each course.",
    icon: BarChart3Icon,
  },
  {
    title: "Learning Community",
    description:
      "Connect learning, practical knowledge and instructors in one simple platform.",
    icon: UsersIcon,
  },
];

const benefits = [
  "Simple and user-friendly learning experience",
  "Structured chapters and lessons",
  "Progress tracking for enrolled courses",
  "Courses for different skill levels",
];

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-7xl">
      {/* Hero */}
      <section className="relative left-1/2 flex min-h-[calc(100svh-4rem)] w-screen -translate-x-1/2 items-center overflow-hidden px-6 py-14 md:px-12 md:py-20 lg:min-h-[calc(100svh-5rem)]">
        <div className="absolute -right-24 -top-24 size-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 size-72 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center text-center">
          <Badge variant="outline" className="mb-6 rounded-full px-4 py-1.5">
            About CourseHUB
          </Badge>

          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
            Learning made simple,
            <span className="text-primary"> accessible and effective.</span>
          </h1>

          <p className="mt-6 max-w-3xl text-base leading-8 text-muted-foreground md:text-xl">
            CourseHUB is an online learning platform created to help students
            discover courses, learn through structured lessons and track their
            progress from one convenient dashboard.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/courses"
              className={buttonVariants({
                size: "lg",
                className: "h-12 rounded-xl px-6 text-base",
              })}
            >
              Explore Courses
              <ArrowRightIcon className="ml-2 size-5" />
            </Link>

            <Link
              href="/contact"
              className={buttonVariants({
                size: "lg",
                variant: "outline",
                className: "h-12 rounded-xl px-6 text-base",
              })}
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="grid gap-8 py-16 lg:grid-cols-2 lg:items-center">
        <div>
          <Badge variant="secondary">Our Mission</Badge>

          <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
            Helping learners build skills with confidence
          </h2>

          <p className="mt-5 text-base leading-8 text-muted-foreground md:text-lg">
            Our mission is to create a modern learning environment where
            students can easily find useful courses, understand concepts through
            organized lessons and see meaningful progress.
          </p>

          <div className="mt-8 space-y-4">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-center gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <CheckCircle2Icon className="size-5" />
                </div>

                <p className="font-medium">{benefit}</p>
              </div>
            ))}
          </div>
        </div>

        <Card className="rounded-3xl border-primary/20 bg-primary/5 p-3">
          <CardHeader>
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <TargetIcon className="size-7" />
            </div>

            <CardTitle className="mt-4 text-2xl">Our goal</CardTitle>

            <CardDescription className="text-base leading-7">
              To make online education easier to access, easier to understand
              and easier to complete.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <p className="leading-7 text-muted-foreground">
              CourseHUB brings courses, lessons, enrollment and progress
              information into one consistent learning experience.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Values */}
      <section className="pb-16">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <Badge variant="outline">Why CourseHUB</Badge>

          <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
            Designed around the learner
          </h2>

          <p className="mt-4 text-muted-foreground md:text-lg">
            Every part of the platform focuses on making learning organized,
            understandable and convenient.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((value) => {
            const Icon = value.icon;

            return (
              <Card
                key={value.title}
                className="rounded-2xl transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
              >
                <CardHeader>
                  <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-6" />
                  </div>

                  <CardTitle className="mt-4 text-xl">{value.title}</CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="leading-7 text-muted-foreground">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
