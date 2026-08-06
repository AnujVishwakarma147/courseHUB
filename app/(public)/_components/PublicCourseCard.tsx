import type { PublicCourseType } from "@/app/data/course/get-all-courses";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { env } from "@/lib/env";
import { School, TimerIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface iAppProps {
  data: PublicCourseType;
  priority?: boolean;
}

export function PublicCourseCard({ data, priority = false }: iAppProps) {
  const thumbnailUrl =
    `https://res.cloudinary.com/${env.CLOUDINARY_CLOUD_NAME}` +
    `/image/upload/${data.fileKey}`;

  return (
    <Card className="group relative gap-0 overflow-hidden py-0">
      <Badge className="absolute top-3 right-3 z-10 h-8 rounded-none px-3 text-base">
        {data.level}
      </Badge>

      <Image
        src={thumbnailUrl}
        alt={data.title}
        width={600}
        height={400}
        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
        priority={priority}
        loading={priority ? "eager" : "lazy"}
        className="aspect-video w-full object-cover"
      />

      <CardContent className="p-6">
        <Link
          href={`/courses/${data.slug}`}
          className="line-clamp-1 text-2xl font-medium transition-colors group-hover:text-primary hover:underline"
        >
          {data.title}
        </Link>

        <p className="mt-3 line-clamp-1 text-base text-muted-foreground">
          {data.smallDescription}
        </p>

        <div className="mt-4 flex items-center gap-x-7">
          <div className="flex items-center gap-x-2">
            <TimerIcon className="size-9 bg-primary/10 p-2 text-primary" />
            <span className="text-base text-muted-foreground">
              {data.duration}h
            </span>
          </div>

          <div className="flex min-w-0 items-center gap-x-2">
            <School className="size-9 shrink-0 bg-primary/10 p-2 text-primary" />
            <span className="truncate text-base text-muted-foreground">
              {data.category}
            </span>
          </div>
        </div>

        <Link
          href={`/courses/${data.slug}`}
          className={buttonVariants({
            size: "lg",
            className: "mt-3 h-11 w-full rounded-none text-base",
          })}
        >
          Learn More
        </Link>
      </CardContent>
    </Card>
  );
}

export function PublicCourseCardSkeleton() {
  return (
    <Card
      aria-hidden="true"
      className="relative gap-0 overflow-hidden py-0"
    >
      <Skeleton className="absolute top-3 right-3 z-10 h-8 w-28 rounded-none" />

      <Skeleton className="aspect-video w-full rounded-none" />

      <CardContent className="space-y-3 p-6">
        <Skeleton className="h-6 w-[95%]" />

        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        <div className="flex items-center gap-x-7 pt-1">
          <div className="flex items-center gap-x-2">
            <Skeleton className="size-9 rounded-none" />
            <Skeleton className="h-4 w-12" />
          </div>

          <div className="flex items-center gap-x-2">
            <Skeleton className="size-9 rounded-none" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>

        <Skeleton className="h-11 w-full rounded-none" />
      </CardContent>
    </Card>
  );
}

export function PublicCoursesSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <PublicCourseCardSkeleton key={index} />
      ))}
    </div>
  );
}
