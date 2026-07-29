"use server";

import { request } from "@arcjet/next";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import arcjet from "@/lib/arcjet";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { ApiResponse } from "@/lib/types";
import {
  courseSchema,
  type CourseSchemaType,
} from "@/lib/zodSchemas";

export async function UpdateCourse(
  courseId: string,
  values: CourseSchemaType,
): Promise<ApiResponse> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return {
        status: "error",
        message: "You must be logged in to update a course",
      };
    }

    const decision = await arcjet.protect(await request(), {
      fingerprint: session.user.id,
    });

    if (decision.isDenied()) {
      return { status: "error", message: "Request blocked" };
    }

    if (session.user.role !== "admin") {
      return {
        status: "error",
        message: "Only admins can update courses",
      };
    }

    const validation = courseSchema.safeParse(values);

    if (!validation.success) {
      return { status: "error", message: "Invalid form data" };
    }

    const course = await prisma.course.update({
      where: { id: courseId },
      data: validation.data,
      select: { id: true },
    });

    revalidatePath("/admin/courses");
    revalidatePath(`/admin/courses/${courseId}/edit`);

    return {
      status: "success",
      message: "Course updated successfully",
      data: course,
    };
  } catch (error) {
    console.error("Failed to update course:", error);

    return {
      status: "error",
      message: "Failed to update course. The slug may already be in use.",
    };
  }
}
