import { prisma } from "@/lib/db";

export async function checkIfCourseBought(
  courseId: string,
  userId: string,
): Promise<boolean> {
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
    select: {
      status: true,
    },
  });

  return enrollment?.status === "Active";
}
