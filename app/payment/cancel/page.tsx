import { cancelStripeCheckoutAction } from "@/app/(public)/courses/[slug]/actions";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, XIcon } from "lucide-react";
import Link from "next/link";

type SearchParams = Promise<{
  course_id?: string;
  course_slug?: string;
}>;

export default async function PaymentCancelled({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const {
    course_id: courseId,
    course_slug: courseSlug,
  } = await searchParams;

  if (courseId) {
    await cancelStripeCheckoutAction(courseId);
  }

  const returnUrl = courseSlug
    ? `/courses/${encodeURIComponent(courseSlug)}`
    : "/courses";

  return (
    <div className="flex min-h-screen w-full items-center justify-center px-4">
      <Card className="w-full max-w-87.5 rounded-md">
        <CardContent className="p-6">
          <div className="flex w-full justify-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-red-500/30">
              <XIcon className="size-7 text-red-500" />
            </div>
          </div>

          <div className="mt-5 text-center">
            <h2 className="text-xl font-semibold">Payment Cancelled</h2>

            <p className="mx-auto mt-2 max-w-57.5 text-sm text-muted-foreground">
              No worries, you won&apos;t be charged. Please try again!
            </p>
          </div>

          <Link
            href={returnUrl}
            className={buttonVariants({
              className: "mt-6 w-full rounded-none",
            })}
          >
            <ArrowLeft className="size-4" />
            Back to Course
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
