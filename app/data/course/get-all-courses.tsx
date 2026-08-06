import "server-only";

import { unstable_cache } from "next/cache";

import { prisma } from "@/lib/db";

const getCachedCourses = unstable_cache(async () => {
  const data = await prisma.course.findMany({
    where: {
      status: "Published",
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      title: true,
      price: true,
      smallDescription: true,
      slug: true,
      fileKey: true,
      id: true,
      level: true,
      duration: true,
      category: true,
    },
  });

  return data;
}, ["published-courses"], {
  revalidate: 300,
  tags: ["published-courses"],
});

export async function getAllCourses() {
  return getCachedCourses();
}

export type PublicCourseType = Awaited<ReturnType<typeof getAllCourses>>[0];
