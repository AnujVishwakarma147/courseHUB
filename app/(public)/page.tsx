import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRightIcon,
  BookOpenCheckIcon,
  ChartNoAxesCombinedIcon,
  CheckCircle2Icon,
  Clock3Icon,
  SparklesIcon,
  UsersRoundIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SessionAwareSignInLink } from "./_components/SessionAwareSignInLink";

interface Feature {
  title: string;
  description: string;
  icon: LucideIcon;
}

const features: Feature[] = [
  {
    title: "Comprehensive Courses",
    description:
      "Access a wide range of carefully curated courses designed by industry experts.",
    icon: BookOpenCheckIcon,
  },
  {
    title: "Interactive Learning",
    description:
      "Engage with interactive content, quizzes, and assignments to enhance your learning experience.",
    icon: SparklesIcon,
  },
  {
    title: "Progress Tracking",
    description:
      "Monitor your progress and achievements with detailed analytics and personalized dashboards.",
    icon: ChartNoAxesCombinedIcon,
  },
  {
    title: "Community Support",
    description:
      "Join a vibrant community of learners and instructors to collaborate and share knowledge.",
    icon: UsersRoundIcon,
  },
];

const highlights = [
  { value: "24/7", label: "Course access" },
  { value: "100%", label: "Self-paced" },
  { value: "Live", label: "Progress tracking" },
];

export default function Home() {
  return (
    <div className="-mx-4 w-[calc(100%+2rem)] md:-mx-6 md:w-[calc(100%+3rem)] lg:-mx-10 lg:w-[calc(100%+5rem)]">
      <section className="relative isolate overflow-hidden px-1 py-16 sm:px-4 md:py-24 lg:px-8 lg:py-28">
        <div className="pointer-events-none absolute -left-32 -top-32 -z-10 size-96 rounded-full bg-primary/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -right-24 -z-10 size-96 rounded-full bg-violet-500/10 blur-3xl" />

        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <Badge variant="outline" className="rounded-full bg-background/70 px-4 py-1.5 shadow-sm backdrop-blur">
            <SparklesIcon className="size-3.5 text-primary" />
            A smarter way to learn online
          </Badge>

          <h1 className="mt-7 text-balance text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Build skills that move your
            <span className="text-primary"> future forward.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg md:text-xl md:leading-8">
            Discover a new way to learn with our modern, interactive learning
            management system. Access high-quality courses anytime, anywhere.
          </p>

          <div className="mt-8 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
            <Link
              className={buttonVariants({
                size: "lg",
                className: "h-12 rounded-xl px-6 text-base shadow-lg shadow-primary/20",
              })}
              href="/courses"
            >
              Explore Courses
              <ArrowRightIcon className="size-4" />
            </Link>

            <SessionAwareSignInLink />
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-medium text-muted-foreground">
            <span className="flex items-center gap-2">
              <CheckCircle2Icon className="size-4 text-primary" />
              No password required
            </span>
            <span className="flex items-center gap-2">
              <Clock3Icon className="size-4 text-primary" />
              Learn on your schedule
            </span>
          </div>

          <dl className="mt-12 grid w-full max-w-2xl grid-cols-3 divide-x rounded-2xl border bg-background/65 py-5 shadow-sm backdrop-blur">
            {highlights.map((highlight) => (
              <div key={highlight.label} className="px-2 sm:px-5">
                <dt className="text-xs text-muted-foreground sm:text-sm">
                  {highlight.label}
                </dt>
                <dd className="mt-1 text-lg font-bold tracking-tight text-foreground sm:text-2xl">
                  {highlight.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <Badge variant="secondary">Built for steady progress</Badge>
          <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-5xl">
            Everything you need to keep learning
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground md:text-lg">
            Structured content, a focused dashboard and clear progress—all in one calm learning space.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <Card
                key={feature.title}
                className="group rounded-2xl border-border/80 bg-card/80 transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
              >
                <CardHeader>
                  <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="size-6" />
                  </div>
                  <CardTitle className="mt-3 text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="leading-7 text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="mb-16 px-6 py-12 text-center sm:px-10 md:mb-24 md:py-16">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
          Ready to start learning?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground md:text-lg">
          Browse the course catalog and choose the next skill you want to master.
        </p>
        <Link
          href="/courses"
          className={buttonVariants({
            size: "lg",
            className: "mt-7 h-12 rounded-xl px-6 text-base",
          })}
        >
          Browse all courses
          <ArrowRightIcon className="size-4" />
        </Link>
      </section>
    </div>
  );
}
