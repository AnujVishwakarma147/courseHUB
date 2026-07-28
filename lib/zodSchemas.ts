import { z } from "zod";

export const courseLevels = [
  "Beginner",
  "Intermediate",
  "Advanced",
] as const;

export const courseStatus = ["Draft", "Published", "Archived"] as const;

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

  price: z.coerce
    .number()
    .min(1, "Price must be at least 1"),

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

export type CourseSchemaType = z.infer<typeof courseSchema>;
