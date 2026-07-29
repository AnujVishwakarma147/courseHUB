"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/app/data/admin/require-admin";
import { prisma } from "@/lib/db";
import type { ApiResponse } from "@/lib/types";

const courseIdSchema = z.string().uuid("Invalid course id");

export async function deleteCourse(
  courseId: string,
): Promise<ApiResponse> {
  await requireAdmin();

  try {
    const validCourseId = courseIdSchema.parse(courseId);
    const course = await prisma.course.findUnique({
      where: { id: validCourseId },
      select: { id: true },
    });

    if (!course) {
      return {
        status: "error",
        message: "Course not found",
      };
    }

    await prisma.course.delete({
      where: { id: course.id },
    });

    revalidatePath("/admin/courses");

    return {
      status: "success",
      message: "Course deleted successfully",
    };
  } catch (error) {
    console.error("Failed to delete course:", error);

    return {
      status: "error",
      message: "Failed to delete course",
    };
  }
}
