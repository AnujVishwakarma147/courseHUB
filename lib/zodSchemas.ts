import { z } from "zod";

export const courseLevels = [
  "Beginner",
  "Intermediate",
  "Advanced",
] as const;

export const courseStatus = ["Draft", "Published", "Archived"] as const;

export const minimumPaidCoursePrice = 50;

export const courseCategories = [
  "Development",
  "Business",
  "Finance",
  "IT & Software",
  "Office Productivity",
  "Personal Development",
  "Design",
  "Marketing",
  "Health & Fitness",
  "Music",
  "Teaching & Academics",
] as const;

export const courseSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must not exceed 100 characters"),

  slug: z
    .string()
    .trim()
    .min(3, "Slug must be at least 3 characters")
    .max(120, "Slug must not exceed 120 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug can only contain lowercase letters, numbers, and hyphens",
    ),

  description: z
    .string()
    .trim()
    .min(3, "Description must be at least 3 characters"),

  smallDescription: z
    .string()
    .trim()
    .min(3, "Small description must be at least 3 characters")
    .max(200, "Small description must not exceed 200 characters"),

  fileKey: z.string().min(1, "Course image is required"),

  price: z.coerce.number().refine(
    (price) => price === 0 || price >= minimumPaidCoursePrice,
    `Use 0 for a free course or at least ₹${minimumPaidCoursePrice} for Stripe`,
  ),

  duration: z.coerce
    .number()
    .int("Duration must be a whole number")
    .min(1, "Duration must be at least 1 hour")
    .max(500, "Duration must not exceed 500 hours"),

  level: z.enum(courseLevels),

  status: z.enum(courseStatus),

  category: z
    .string()
    .trim()
    .min(1, "Category is required"),
});

export const chapterSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, { message: "Name must be at least 3 characters long" }),
  courseId: z.string().uuid({ message: "Invalid course id" }),
});

export const lessonSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, { message: "Name must be at least 3 characters long" }),
  courseId: z.string().uuid({ message: "Invalid course id" }),
  chapterId: z.string().uuid({ message: "Invalid chapter id" }),
  description: z
    .string()
    .trim()
    .min(3, { message: "Description must be at least 3 characters long" })
    .optional(),
  thumbnailKey: z.string().trim().optional(),
  videoKey: z.string().trim().optional(),
});

export type CourseSchemaType = z.infer<typeof courseSchema>;
export type ChapterSchemaType = z.infer<typeof chapterSchema>;
export type LessonSchemaType = z.infer<typeof lessonSchema>;
