"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { request } from "@arcjet/next";

import arcjet from "@/lib/arcjet";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { ApiResponse } from "@/lib/types";
import {
  courseSchema,
  type CourseSchemaType,
} from "@/lib/zodSchemas";

export async function CreateCourse(
  values: CourseSchemaType,
): Promise<ApiResponse> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return {
        status: "error",
        message: "You must be logged in to create a course",
      };
    }

    const decision = await arcjet.protect(await request(), {
      fingerprint: session.user.id,
    });

    if (decision.isDenied()) {
      return {
        status: "error",
        message: "Request blocked",
      };
    }

    if (session.user.role !== "admin") {
      return {
        status: "error",
        message: "Only admins can create courses",
      };
    }

    const validation = courseSchema.safeParse(values);

    if (!validation.success) {
      return {
        status: "error",
        message: "Invalid Form Data",
      };
    }

    const data = await prisma.course.create({
      data: {
        ...validation.data,
        userId: session.user.id,
      },
    });

    revalidatePath("/admin/courses");

    return {
      status: "success",
      message: "Course created successfully",
      data: { id: data.id },
    };
  } catch (error) {
    console.error("Failed to create course:", error);

    return {
      status: "error",
      message: "Failed to create course. The slug may already be in use.",
    };
  }
}
