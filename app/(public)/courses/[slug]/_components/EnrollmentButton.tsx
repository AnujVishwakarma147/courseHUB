"use client";

import { Button } from "@/components/ui/button";
import { tryCatch } from "@/hooks/try-catch";
import { Loader2, LockKeyhole } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { enrollInCourseAction } from "../actions";

export function EnrollmentButton({ courseId }: { courseId: string }) {
  const [pending, startTransition] = useTransition();

  function onSubmit() {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(
        enrollInCourseAction(courseId),
      );

      if (error) {
        toast.error("An unexpected error occurred. Please try again.");
        return;
      }

      if (result.status === "success") {
        if (result.data?.redirectUrl) {
          window.location.assign(result.data.redirectUrl);
          return;
        }

        if (result.data?.checkoutUrl) {
          window.location.assign(result.data.checkoutUrl);
        }
      } else if (result.status === "error") {
        toast.error(result.message);
      }
    });
  }

  return (
    <Button
      onClick={onSubmit}
      disabled={pending}
      className="mt-8 h-12 w-full gap-2 rounded-lg text-base font-semibold shadow-lg shadow-primary/20 transition-transform hover:-translate-y-0.5"
    >
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Opening secure checkout...
        </>
      ) : (
        <>
          <LockKeyhole className="size-4" />
          Enroll securely
        </>
      )}
    </Button>
  );
}
