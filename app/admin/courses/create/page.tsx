"use client";

import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";
import slugify from "slugify";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  courseCategories,
  courseLevels,
  courseStatus,
  courseSchema,
  type CourseSchemaType,
} from "@/lib/zodSchemas";

type CourseFormValues = {
  [Key in keyof CourseSchemaType]: CourseSchemaType[Key] | string;
};

const initialValues: CourseFormValues = {
  title: "",
  slug: "",
  smallDescription: "",
  description: "",
  fileKey: "",
  category: "",
  price: "",
  duration: "",
  level: "Beginner",
  status: "Draft",
};

export default function CourseCreationPage() {
  const [values, setValues] = useState<CourseFormValues>(initialValues);
  const [errors, setErrors] = useState<
    Partial<Record<keyof CourseSchemaType, string>>
  >({});

  function updateValue<Key extends keyof CourseFormValues>(
    key: Key,
    value: CourseFormValues[Key],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function generateSlug() {
    updateValue(
      "slug",
      slugify(String(values.title), {
        lower: true,
        strict: true,
        trim: true,
      }),
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = courseSchema.safeParse(values);

    if (!result.success) {
      const nextErrors: Partial<Record<keyof CourseSchemaType, string>> = {};

      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof CourseSchemaType;
        if (!nextErrors[field]) nextErrors[field] = issue.message;
      }

      setErrors(nextErrors);
      return;
    }

    setErrors({});
    console.log(result.data);
  }

  return (
    <main className="mx-auto w-full max-w-7xl space-y-8 px-4 py-2 md:px-6 lg:px-10 lg:py-4">
      <div className="flex items-center gap-5">
        <Link
          href="/admin/courses"
          aria-label="Back to courses"
          className={buttonVariants({
            variant: "outline",
            size: "icon-lg",
            className: "size-12 rounded-none",
          })}
        >
          <ArrowLeft className="size-5" />
        </Link>

        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Create Courses
        </h1>
      </div>

      <Card className="rounded-xl">
        <CardHeader className="px-6 pt-7 lg:px-10">
          <CardTitle className="text-xl">Basic Information</CardTitle>
          <CardDescription className="text-base">
            Provide basic information about the course
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 pb-8 lg:px-10">
          <form className="space-y-6" noValidate onSubmit={handleSubmit}>
            <FormField label="Title" error={errors.title}>
              <Input
                id="title"
                placeholder="Title"
                value={values.title}
                aria-invalid={Boolean(errors.title)}
                className="h-12 rounded-none px-4 text-base"
                onChange={(event) => updateValue("title", event.target.value)}
              />
            </FormField>

            <FormField label="Slug" error={errors.slug}>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Input
                  id="slug"
                  placeholder="course-slug"
                  value={values.slug}
                  aria-invalid={Boolean(errors.slug)}
                  className="h-12 flex-1 rounded-none px-4 text-base"
                  onChange={(event) => updateValue("slug", event.target.value)}
                />
                <Button
                  type="button"
                  className="h-12 rounded-none px-6 text-base"
                  onClick={generateSlug}
                >
                  Generate Slug
                  <Sparkles className="size-5" />
                </Button>
              </div>
            </FormField>

            <FormField
              label="Small Description"
              error={errors.smallDescription}
            >
              <Textarea
                id="smallDescription"
                placeholder="A short summary of your course"
                value={values.smallDescription}
                aria-invalid={Boolean(errors.smallDescription)}
                maxLength={200}
                className="min-h-32 resize-y rounded-none px-4 py-3 text-base"
                onChange={(event) =>
                  updateValue("smallDescription", event.target.value)
                }
              />
            </FormField>

            <FormField label="Description" error={errors.description}>
              <Textarea
                id="description"
                placeholder="Description"
                value={values.description}
                aria-invalid={Boolean(errors.description)}
                className="min-h-40 resize-y rounded-none px-4 py-3 text-base"
                onChange={(event) =>
                  updateValue("description", event.target.value)
                }
              />
            </FormField>

            <FormField label="Thumbnail image" error={errors.fileKey}>
              <Input
                id="fileKey"
                type="url"
                placeholder="Thumbnail URL"
                value={values.fileKey}
                aria-invalid={Boolean(errors.fileKey)}
                className="h-12 rounded-none px-4 text-base"
                onChange={(event) => updateValue("fileKey", event.target.value)}
              />
            </FormField>

            <div className="grid gap-6 md:grid-cols-2">
              <FormField label="Category" error={errors.category}>
                <Select
                  value={String(values.category) || null}
                  onValueChange={(value) => updateValue("category", value ?? "")}
                >
                  <SelectTrigger
                    id="category"
                    aria-invalid={Boolean(errors.category)}
                    className="h-12 w-full rounded-none px-4 text-base"
                  >
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {courseCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Level" error={errors.level}>
                <Select
                  value={String(values.level)}
                  onValueChange={(value) =>
                    updateValue("level", value ?? "Beginner")
                  }
                >
                  <SelectTrigger
                    id="level"
                    aria-invalid={Boolean(errors.level)}
                    className="h-12 w-full rounded-none px-4 text-base"
                  >
                    <SelectValue placeholder="Select Level" />
                  </SelectTrigger>
                  <SelectContent>
                    {courseLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Duration (hours)" error={errors.duration}>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  max="500"
                  step="1"
                  placeholder="0"
                  value={values.duration}
                  aria-invalid={Boolean(errors.duration)}
                  className="h-12 rounded-none px-4 text-base"
                  onChange={(event) =>
                    updateValue("duration", event.target.value)
                  }
                />
              </FormField>

              <FormField label="Price ($)" error={errors.price}>
                <Input
                  id="price"
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="0"
                  value={values.price}
                  aria-invalid={Boolean(errors.price)}
                  className="h-12 rounded-none px-4 text-base"
                  onChange={(event) => updateValue("price", event.target.value)}
                />
              </FormField>
            </div>

            <FormField label="Status" error={errors.status}>
              <Select
                value={String(values.status)}
                onValueChange={(value) =>
                  updateValue("status", value ?? "Draft")
                }
              >
                <SelectTrigger
                  id="status"
                  aria-invalid={Boolean(errors.status)}
                  className="h-12 w-full rounded-none px-4 text-base"
                >
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  {courseStatus.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <div className="flex justify-start pt-2">
              <Button type="submit" className="h-11 rounded-none px-6 text-base">
                Create Course
                <span className="ml-1 text-xl font-light">+</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-base font-medium">{label}</Label>
      {children}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
