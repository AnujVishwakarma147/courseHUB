"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { requireAdmin } from "@/app/data/admin/require-admin";
import { adminAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/mail";
import { siteConfig } from "@/lib/site-config";
import type { ApiResponse } from "@/lib/types";

const studentIdSchema = z.string().min(1, "Invalid student id");
const blockStudentSchema = z.object({
  studentId: studentIdSchema,
  reason: z
    .string()
    .trim()
    .min(3, "Please provide a short reason")
    .max(200, "Reason must be 200 characters or less"),
});
const enrollmentActionSchema = z.object({
  studentId: studentIdSchema,
  enrollmentId: z.string().min(1, "Invalid enrollment id"),
  courseSlug: z.string().min(1, "Invalid course slug"),
});

type StudentAccessResponse = ApiResponse<{
  notificationSent: boolean;
}>;

async function getManagedStudent(studentId: string) {
  const student = await prisma.user.findUnique({
    where: { id: studentId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      banned: true,
      banReason: true,
    },
  });

  if (!student || student.role === "admin") {
    return null;
  }

  return student;
}

async function sendStudentAccessNotification({
  student,
  action,
  reason,
}: {
  student: {
    name: string;
    email: string;
  };
  action: "blocked" | "unblocked";
  reason: string;
}) {
  const isBlocked = action === "blocked";

  try {
    await sendEmail({
      to: student.email,
      replyTo: siteConfig.supportEmail,
      subject: isBlocked
        ? "Your CourseHUB account has been blocked"
        : "Your CourseHUB account has been unblocked",
      text: [
        `Hi ${student.name},`,
        "",
        isBlocked
          ? "Your CourseHUB account has been blocked by an administrator."
          : "Your CourseHUB account has been unblocked by an administrator.",
        `Reason: ${reason}`,
        "",
        isBlocked
          ? "You will not be able to sign in until an administrator unblocks your account."
          : "Your account access has been restored and you can sign in again.",
        "",
        `If you have questions, reply to this email or contact ${siteConfig.supportEmail}.`,
        "",
        "CourseHUB Support",
      ].join("\n"),
    });

    return true;
  } catch (error) {
    console.error("Student access notification request failed:", error);
    return false;
  }
}

function revalidateStudentPages(studentId: string) {
  revalidatePath("/admin/students");
  revalidatePath(`/admin/students/${studentId}`);
}

export async function blockStudent(
  input: z.infer<typeof blockStudentSchema>,
): Promise<StudentAccessResponse> {
  await requireAdmin();

  const validation = blockStudentSchema.safeParse(input);
  if (!validation.success) {
    return {
      status: "error",
      message: validation.error.issues[0]?.message ?? "Invalid block request",
    };
  }

  const student = await getManagedStudent(validation.data.studentId);
  if (!student) {
    return { status: "error", message: "Student not found" };
  }

  if (student.banned) {
    return { status: "error", message: "Student is already blocked" };
  }

  try {
    await adminAuth.api.banUser({
      headers: await headers(),
      body: {
        userId: student.id,
        banReason: validation.data.reason,
      },
    });

    const notificationSent = await sendStudentAccessNotification({
      student,
      action: "blocked",
      reason: validation.data.reason,
    });

    revalidateStudentPages(student.id);

    return {
      status: "success",
      message: notificationSent
        ? "Student blocked and notification email sent"
        : "Student blocked, but the notification email could not be sent",
      data: { notificationSent },
    };
  } catch (error) {
    console.error("Failed to block student:", error);
    return { status: "error", message: "Failed to block student" };
  }
}

export async function unblockStudent(
  studentId: string,
): Promise<StudentAccessResponse> {
  await requireAdmin();

  const validation = studentIdSchema.safeParse(studentId);
  if (!validation.success) {
    return { status: "error", message: "Invalid student id" };
  }

  const student = await getManagedStudent(validation.data);
  if (!student) {
    return { status: "error", message: "Student not found" };
  }

  if (!student.banned) {
    return { status: "error", message: "Student is not blocked" };
  }

  try {
    await adminAuth.api.unbanUser({
      headers: await headers(),
      body: { userId: student.id },
    });

    const notificationSent = await sendStudentAccessNotification({
      student,
      action: "unblocked",
      reason: student.banReason || "No reason was provided",
    });

    revalidateStudentPages(student.id);

    return {
      status: "success",
      message: notificationSent
        ? "Student unblocked and notification email sent"
        : "Student unblocked, but the notification email could not be sent",
      data: { notificationSent },
    };
  } catch (error) {
    console.error("Failed to unblock student:", error);
    return { status: "error", message: "Failed to unblock student" };
  }
}

export async function removeStudentFromCourse(
  input: z.infer<typeof enrollmentActionSchema>,
): Promise<ApiResponse> {
  await requireAdmin();

  const validation = enrollmentActionSchema.safeParse(input);
  if (!validation.success) {
    return {
      status: "error",
      message: validation.error.issues[0]?.message ?? "Invalid request",
    };
  }

  const student = await getManagedStudent(validation.data.studentId);
  if (!student) {
    return { status: "error", message: "Student not found" };
  }

  try {
    const result = await prisma.enrollment.updateMany({
      where: {
        id: validation.data.enrollmentId,
        userId: student.id,
        status: "Active",
        Course: {
          slug: validation.data.courseSlug,
        },
      },
      data: {
        status: "Cancelled",
      },
    });

    if (result.count === 0) {
      return {
        status: "error",
        message: "Active course enrollment not found",
      };
    }

    revalidateStudentPages(student.id);
    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/${validation.data.courseSlug}`);

    return {
      status: "success",
      message: "Student removed from the course",
    };
  } catch (error) {
    console.error("Failed to remove student from course:", error);
    return {
      status: "error",
      message: "Failed to remove student from the course",
    };
  }
}
