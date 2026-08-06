import "server-only";

import { prisma } from "@/lib/db";
import { unstable_cache } from "next/cache";
import { notFound } from "next/navigation";

const getCachedIndividualCourse = unstable_cache(
  async (slug: string) =>
    prisma.course.findFirst({
    where: {
      slug,
      status: "Published",
    },
    select: {
      id: true,
      title: true,
      description: true,
      fileKey: true,
      price: true,
      duration: true,
      level: true,
      category: true,
      smallDescription: true,
      slug: true,
      chapters: {
        select: {
          id: true,
          title: true,
          position: true,
          lessons: {
            select: {
              id: true,
              title: true,
              description: true,
              position: true,
            },
            orderBy: {
              position: "asc",
            },
          },
        },
        orderBy: {
          position: "asc",
        },
      },
    },
    }),
  ["published-course-detail"],
  {
    revalidate: 300,
    tags: ["published-course-details"],
  },
);

export async function getIndividualCourse(slug: string) {
  const course = await getCachedIndividualCourse(slug);

  if (!course) {
    return notFound();
  }

  return course;
}
