import { confirmStripeCheckoutAction } from "@/app/(public)/courses/[slug]/actions";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, CheckIcon, Play, XIcon } from "lucide-react";
import Link from "next/link";

type SearchParams = Promise<{
  session_id?: string;
}>;

export default async function PaymentSuccess({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { session_id: sessionId } = await searchParams;
  const result = sessionId
    ? await confirmStripeCheckoutAction(sessionId)
    : {
        status: "error" as const,
        message: "Payment session is missing.",
      };
  const isSuccess = result.status === "success";
  const watchUrl =
    result.status === "success" ? result.data?.watchUrl ?? "/courses" : "/courses";

  return (
    <div className="flex min-h-screen w-full items-center justify-center px-4">
      <Card className="w-full max-w-87.5 rounded-md">
        <CardContent className="p-6">
          <div className="flex w-full justify-center">
            <div
              className={
                isSuccess
                  ? "flex size-12 items-center justify-center rounded-full bg-green-500/30"
                  : "flex size-12 items-center justify-center rounded-full bg-red-500/30"
              }
            >
              {isSuccess ? (
                <CheckIcon className="size-7 text-green-500" />
              ) : (
                <XIcon className="size-7 text-red-500" />
              )}
            </div>
          </div>

          <div className="mt-5 text-center">
            <h2 className="text-xl font-semibold">
              {isSuccess ? "Payment Successful" : "Payment Verification Failed"}
            </h2>

            <p className="mx-auto mt-2 max-w-65 text-sm text-muted-foreground">
              {isSuccess
                ? "Congrats, your payment was successful. You now have access to the course!"
                : result.message}
            </p>
          </div>

          <Link
            href={watchUrl}
            className={buttonVariants({
              className: "mt-6 w-full rounded-none",
            })}
          >
            {isSuccess ? (
              <Play className="size-4 fill-current" />
            ) : (
              <ArrowLeft className="size-4" />
            )}
            {isSuccess ? "Watch Now" : "Back to Courses"}
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
