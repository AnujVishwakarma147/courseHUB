"use client";

import Link from "next/link";
import {
  ArrowLeftIcon,
  Loader2Icon,
  MailCheckIcon,
  RotateCcwIcon,
} from "lucide-react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import {
  Suspense,
  useEffect,
  useState,
  useTransition,
} from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  adminAuthClient,
  authClient,
} from "@/lib/auth-client";
import {
  AUTH_MODE_HEADER,
  type AuthMode,
  getSafeCallbackURL,
  isAdminCallbackURL,
} from "@/lib/auth-flow";

export default function VerifyRequestPage() {
  return (
    <Suspense fallback={<VerificationLoading />}>
      <VerifyRequestForm />
    </Suspense>
  );
}

function VerifyRequestForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email =
    searchParams.get("email")?.trim() ?? "";

  const mode: AuthMode =
    searchParams.get("mode") === "signup"
      ? "signup"
      : "login";
  const callbackURL = getSafeCallbackURL(
    searchParams.get("callbackURL"),
  );
  const activeAuthClient = isAdminCallbackURL(callbackURL)
    ? adminAuthClient
    : authClient;

  const [otp, setOtp] =
    useState("");

  const [
    verifyPending,
    startVerifyTransition,
  ] = useTransition();

  const [
    resendPending,
    startResendTransition,
  ] = useTransition();

  useEffect(() => {
    if (email) {
      return;
    }

    router.replace(
      mode === "signup"
        ? "/signup"
        : `/login?callbackURL=${encodeURIComponent(callbackURL)}`,
    );
  }, [callbackURL, email, mode, router]);

  const isOtpComplete =
    otp.length === 6;

  function verifyOtp() {
    if (!email || !isOtpComplete) {
      return;
    }

    startVerifyTransition(async () => {
      const signupName =
        mode === "signup"
          ? sessionStorage.getItem(
              "coursehub-signup-name",
            )?.trim() ?? ""
          : "";
      const fallbackName =
        email.split("@")[0] ||
        "CourseHUB User";

      await activeAuthClient.signIn.emailOtp({
        email,
        otp,

        ...(mode === "signup"
          ? {
              name:
                signupName ||
                fallbackName,
            }
          : {}),

        fetchOptions: {
          headers: {
            [AUTH_MODE_HEADER]: mode,
          },

          onSuccess: () => {
            if (mode === "signup") {
              sessionStorage.removeItem(
                "coursehub-signup-name",
              );

              toast.success(
                "Account created successfully",
              );
            } else {
              toast.success(
                "Login successful",
              );
            }

            router.replace(
              mode === "signup"
                ? "/"
                : callbackURL,
            );
            router.refresh();
          },

          onError: (context: {
            error: { message?: string };
          }) => {
            setOtp("");

            toast.error(
              context.error.message ||
                "Invalid or expired OTP",
            );
          },
        },
      });
    });
  }

  function resendOtp() {
    if (!email) {
      return;
    }

    startResendTransition(async () => {
      await activeAuthClient.emailOtp.sendVerificationOtp({
        email,
        type: "sign-in",

        fetchOptions: {
          headers: {
            [AUTH_MODE_HEADER]: mode,
          },

          onSuccess: () => {
            setOtp("");

            toast.success(
              "A new OTP has been sent",
            );
          },

          onError: (context) => {
            toast.error(
              context.error.message ||
                "Unable to resend OTP",
            );
          },
        },
      });
    });
  }

  const backUrl =
    mode === "signup"
      ? "/signup"
      : `/login?callbackURL=${encodeURIComponent(callbackURL)}`;

  return (
    <Card className="mx-auto w-full max-w-md rounded-2xl border-border/80 shadow-xl shadow-black/5">
      <CardHeader className="items-center space-y-3 text-center">
        <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <MailCheckIcon className="size-6" />
        </div>

        <div>
          <CardTitle className="text-2xl">
            Check your email
          </CardTitle>

          <CardDescription className="mt-2 leading-6">
            We sent a 6-digit verification code to
          </CardDescription>

          <p className="mt-1 break-all text-sm font-semibold text-foreground">
            {email}
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex flex-col items-center gap-4">
          <InputOTP
            value={otp}
            onChange={setOtp}
            maxLength={6}
            disabled={verifyPending}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>

            <span className="px-1 text-muted-foreground">
              -
            </span>

            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>

          <p className="text-center text-sm text-muted-foreground">
            Enter the code sent to your email address.
          </p>
        </div>

        <Button
          type="button"
          onClick={verifyOtp}
          disabled={
            verifyPending ||
            resendPending ||
            !isOtpComplete
          }
          className="h-11 w-full rounded-xl font-semibold"
        >
          {verifyPending ? (
            <>
              <Loader2Icon className="size-4 animate-spin" />
              Verifying...
            </>
          ) : mode === "signup" ? (
            "Verify and Create Account"
          ) : (
            "Verify and Login"
          )}
        </Button>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href={backUrl}
            className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors hover:bg-muted"
          >
            <ArrowLeftIcon className="size-4" />
            Change email
          </Link>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={
              resendPending ||
              verifyPending
            }
            onClick={resendOtp}
          >
            {resendPending ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <RotateCcwIcon className="size-4" />
            )}

            Resend code
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function VerificationLoading() {
  return (
    <Card className="mx-auto w-full max-w-md rounded-2xl">
      <CardContent className="flex min-h-72 items-center justify-center">
        <Loader2Icon className="size-7 animate-spin text-primary" />

        <span className="sr-only">
          Loading verification form
        </span>
      </CardContent>
    </Card>
  );
}
