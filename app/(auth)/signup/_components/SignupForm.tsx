"use client";

import Link from "next/link";
import {
  BarChart3Icon,
  BookOpenCheckIcon,
  GraduationCapIcon,
  Loader2Icon,
  MailIcon,
  PlayCircleIcon,
  UserPlusIcon,
  UserRoundIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  type FormEvent,
  useState,
  useTransition,
} from "react";
import {
  FaGithub,
  FaGoogle,
} from "react-icons/fa";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { AUTH_MODE_HEADER } from "@/lib/auth-flow";

type SocialProvider = "google" | "github";

const learningBenefits = [
  {
    title: "Structured Courses",
    description:
      "Organized chapters and lessons for focused learning.",
    icon: BookOpenCheckIcon,
  },
  {
    title: "Track Progress",
    description:
      "Continue learning exactly where you stopped.",
    icon: BarChart3Icon,
  },
  {
    title: "Learn Anytime",
    description:
      "Access enrolled courses from your dashboard.",
    icon: PlayCircleIcon,
  },
];

export function SignupForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [
    pendingProvider,
    setPendingProvider,
  ] = useState<SocialProvider | null>(null);

  const [
    emailPending,
    startEmailTransition,
  ] = useTransition();

  const socialPending =
    pendingProvider !== null;

  async function signUpWithSocial(
    provider: SocialProvider,
  ) {
    setPendingProvider(provider);

    try {
      await authClient.signIn.social({
        provider,
        callbackURL: "/",
        errorCallbackURL: "/signup",
        requestSignUp: true,

        fetchOptions: {
          onError: (context) => {
            toast.error(
              context.error.message ||
                "Social sign up failed",
            );

            setPendingProvider(null);
          },
        },
      });
    } catch {
      toast.error(
        "Social sign up failed. Please try again.",
      );

      setPendingProvider(null);
    }
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const cleanName = name.trim();

    const cleanEmail = email
      .trim()
      .toLowerCase();

    if (cleanName.length < 2) {
      toast.error(
        "Please enter your full name",
      );

      return;
    }

    if (!cleanEmail) {
      toast.error(
        "Please enter your email address",
      );

      return;
    }

    startEmailTransition(async () => {
      await authClient.emailOtp.sendVerificationOtp({
        email: cleanEmail,
        type: "sign-in",

        fetchOptions: {
          headers: {
            [AUTH_MODE_HEADER]: "signup",
          },

          onSuccess: () => {
            sessionStorage.setItem(
              "coursehub-signup-name",
              cleanName,
            );

            toast.success(
              "Verification code sent to your email",
            );

            router.push(
              `/verify-request?mode=signup&email=${encodeURIComponent(
                cleanEmail,
              )}`,
            );
          },

          onError: (context) => {
            toast.error(
              context.error.message ||
                "Unable to send verification code",
            );
          },
        },
      });
    });
  }

  return (
    <div className="mx-auto grid w-full max-w-4xl overflow-hidden rounded-3xl border bg-card shadow-xl lg:max-h-170 lg:grid-cols-[0.85fr_1.15fr]">
      {/* Left course information */}
      <section className="relative hidden overflow-hidden border-r bg-primary/10 p-7 lg:block">
        <div className="pointer-events-none absolute -left-20 -top-20 size-52 rounded-full bg-primary/15 blur-3xl" />

        <div className="relative">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md">
            <GraduationCapIcon className="size-6" />
          </div>

          <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Start Learning Today
          </p>

          <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight">
            Build skills for your future.
          </h1>

          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Explore structured courses, complete lessons
            and monitor your learning progress from one
            convenient dashboard.
          </p>

          <div className="mt-6 space-y-4">
            {learningBenefits.map((benefit) => {
              const Icon = benefit.icon;

              return (
                <div
                  key={benefit.title}
                  className="flex items-start gap-3"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border bg-background/70 text-primary">
                    <Icon className="size-4" />
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold">
                      {benefit.title}
                    </h2>

                    <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 rounded-xl border bg-background/65 p-3">
            <p className="text-xs text-muted-foreground">
              Already have an account?
            </p>

            <Link
              href="/login"
              className="mt-2 flex h-9 items-center justify-center rounded-lg border border-primary/30 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              Login to your account
            </Link>
          </div>
        </div>
      </section>

      {/* Right signup form */}
      <section className="p-5 sm:p-7">
        {/* Login and Signup tabs */}
        <div className="mb-5 grid grid-cols-2 rounded-xl border bg-muted/30 p-1">
          <Link
            href="/login"
            className="flex h-9 items-center justify-center rounded-lg text-sm font-semibold text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
          >
            Login
          </Link>

          <Link
            href="/signup"
            aria-current="page"
            className="flex h-9 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground shadow-sm"
          >
            Sign Up
          </Link>
        </div>

        <div className="mb-5">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <UserPlusIcon className="size-5" />
          </div>

          <h2 className="mt-3 text-2xl font-bold tracking-tight">
            Create your account
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Create a free account and start learning.
          </p>
        </div>

        {/* Social signup buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-xl"
            disabled={
              socialPending || emailPending
            }
            onClick={() =>
              signUpWithSocial("google")
            }
          >
            {pendingProvider === "google" ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <FaGoogle className="size-4" />
            )}

            Google
          </Button>

          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-xl"
            disabled={
              socialPending || emailPending
            }
            onClick={() =>
              signUpWithSocial("github")
            }
          >
            {pendingProvider === "github" ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <FaGithub className="size-4" />
            )}

            GitHub
          </Button>
        </div>

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>

          <div className="relative flex justify-center">
            <span className="bg-card px-3 text-[11px] font-medium uppercase text-muted-foreground">
              Or create with email
            </span>
          </div>
        </div>

        {/* Email signup form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="signup-name">
              Full name
            </Label>

            <div className="relative">
              <UserRoundIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                id="signup-name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Enter your full name"
                value={name}
                disabled={emailPending}
                onChange={(event) =>
                  setName(event.target.value)
                }
                className="h-10 rounded-xl pl-10"
                minLength={2}
                maxLength={80}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="signup-email">
              Email address
            </Label>

            <div className="relative">
              <MailIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                id="signup-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                value={email}
                disabled={emailPending}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                className="h-10 rounded-xl pl-10"
                required
              />
            </div>
          </div>

          <p className="text-xs leading-5 text-muted-foreground">
            A secure verification code will be sent to
            your email. No password is required.
          </p>

          <Button
            type="submit"
            className="h-11 w-full rounded-xl font-semibold"
            disabled={
              emailPending ||
              socialPending ||
              !name.trim() ||
              !email.trim()
            }
          >
            {emailPending ? (
              <>
                <Loader2Icon className="size-4 animate-spin" />
                Sending code...
              </>
            ) : (
              <>
                <UserPlusIcon className="size-4" />
                Create Account
              </>
            )}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground lg:hidden">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-primary hover:underline"
          >
            Login
          </Link>
        </p>
      </section>
    </div>
  );
}
