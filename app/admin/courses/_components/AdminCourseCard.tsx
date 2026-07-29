import type { AdminCourseType } from "@/app/data/admin/admin-get-courses";
import { buttonVariants } from "@/components/ui/button";
import { env } from "@/lib/env";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowRight,
  Eye,
  MoreVertical,
  Pencil,
  School,
  TimerIcon,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface iAppProps {
  data: AdminCourseType;
  priority?: boolean;
}

export function AdminCourseCard({ data, priority = false }: iAppProps) {
  const thumbnailUrl =
    `https://res.cloudinary.com/${env.CLOUDINARY_CLOUD_NAME}` +
    `/image/upload/${data.fileKey}`;

  return (
    <Card className="group relative gap-0 overflow-hidden py-0">
      <div className="absolute right-2 top-2 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
            <Button variant="secondary" size="icon">
              <MoreVertical className="size-4" />
              <span className="sr-only">Open course menu</span>
            </Button>
            }
          />

          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              render={<Link href={`/admin/courses/${data.id}/edit`} />}
            >
                <Pencil className="mr-2 size-4" />
                Edit Course
            </DropdownMenuItem>

            <DropdownMenuItem render={<Link href={`/courses/${data.slug}`} />}>
                <Eye className="mr-2 size-4" />
                Preview
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              variant="destructive"
              render={<Link href={`/admin/courses/${data.id}/delete`} />}
            >
                <Trash2 className="mr-2 size-4 text-destructive" />
                Delete Course
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Image
        src={thumbnailUrl}
        alt={data.title}
        width={600}
        height={400}
        priority={priority}
        className="aspect-video h-full w-full rounded-t-lg object-cover"
      />

      <CardContent className="p-4">
        <Link
          href={`/admin/courses/${data.id}`}
          className="line-clamp-2 text-lg font-medium transition-colors hover:underline group-hover:text-primary"
        >
          {data.title}
        </Link>

        <p className="mt-2 line-clamp-2 text-sm leading-tight text-muted-foreground">
          {data.smallDescription}
        </p>

        <div className="mt-4 flex items-center gap-x-5">
          <div className="flex items-center gap-x-2">
            <TimerIcon className="size-6 rounded-md bg-primary/10 p-1 text-primary" />

            <p className="text-sm text-muted-foreground">
              {data.duration}h
            </p>
          </div>

          <div className="flex items-center gap-x-2">
            <School className="size-6 rounded-md bg-primary/10 p-1 text-primary" />

            <p className="text-sm text-muted-foreground">
              {data.level}
            </p>
          </div>
        </div>

        <Link
          href={`/admin/courses/${data.id}/edit`}
          className={buttonVariants({
            className: "mt-4 w-full",
          })}
        >
          Edit Course
          <ArrowRight className="ml-1 size-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
