"use client";

import {
  CourseForm,
  type CourseFormValues,
} from "@/app/admin/courses/create/_components/CourseForm";

interface EditCourseFormProps {
  courseId: string;
  initialValues: CourseFormValues;
  initialImageUrl: string;
}

export function EditCourseForm({
  courseId,
  initialValues,
  initialImageUrl,
}: EditCourseFormProps) {
  return (
    <CourseForm
      mode="edit"
      courseId={courseId}
      initialValues={initialValues}
      initialImageUrl={initialImageUrl}
    />
  );
}
