import "server-only";

import { unstable_cache } from "next/cache";

import { prisma } from "@/lib/db";

const getCachedAiCourseContext = unstable_cache(
  async () =>
    prisma.course.findMany({
      where: {
        status: "Published",
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
      select: {
        title: true,
        slug: true,
        smallDescription: true,
        price: true,
        duration: true,
        level: true,
        category: true,
      },
    }),
  ["ai-published-course-context"],
  {
    revalidate: 300,
    tags: ["published-courses"],
  },
);

export async function getAiCourseContext() {
  return getCachedAiCourseContext();
}
