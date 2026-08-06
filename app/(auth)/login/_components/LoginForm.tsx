"use client";

import Link from "next/link";
import {
  Loader2Icon,
  MailIcon,
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
  adminAuthClient,
  authClient,
} from "@/lib/auth-client";
import {
  AUTH_MODE_HEADER,
  isAdminCallbackURL,
} from "@/lib/auth-flow";

type SocialProvider = "google" | "github";

type LoginFormProps = {
  callbackURL?: string;
  initialError?: string;
};

export function LoginForm({
  callbackURL = "/",
  initialError,
}: LoginFormProps) {
  const router = useRouter();
  const isAdminLogin = isAdminCallbackURL(callbackURL);
  const activeAuthClient = isAdminLogin
    ? adminAuthClient
    : authClient;
  const errorCallbackURL = isAdminLogin
    ? `/login?callbackURL=${encodeURIComponent(callbackURL)}`
    : "/login";

  const [email, setEmail] =
    useState("");

  const [
    pendingProvider,
    setPendingProvider,
  ] = useState<SocialProvider | null>(
    null,
  );

  const [
    emailPending,
    startEmailTransition,
  ] = useTransition();

  const socialPending =
    pendingProvider !== null;

  async function signInWithSocial(
    provider: SocialProvider,
  ) {
    setPendingProvider(provider);

    try {
      await activeAuthClient.signIn.social({
        provider,

        callbackURL,
        errorCallbackURL,

        fetchOptions: {
          headers: {
            [AUTH_MODE_HEADER]: "login",
          },

          onSuccess: () => {
            toast.success(
              `Continuing with ${
                provider === "google"
                  ? "Google"
                  : "GitHub"
              }`,
            );
          },

          onError: (context) => {
            toast.error(
              context.error.message ||
                `${
                  provider === "google"
                    ? "Google"
                    : "GitHub"
                } login failed`,
            );

            setPendingProvider(null);
          },
        },
      });
    } catch {
      toast.error(
        "Social login failed. Please try again.",
      );

      setPendingProvider(null);
    }
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const cleanEmail =
      email.trim().toLowerCase();

    if (!cleanEmail) {
      toast.error(
        "Please enter your email address",
      );

      return;
    }

    startEmailTransition(async () => {
      await activeAuthClient.emailOtp.sendVerificationOtp({
        email: cleanEmail,
        type: "sign-in",

        fetchOptions: {
          headers: {
            [AUTH_MODE_HEADER]: "login",
          },

          onSuccess: () => {
            toast.success(
              "Login code sent to your email",
            );

            router.push(
              `/verify-request?mode=login&email=${encodeURIComponent(
                cleanEmail,
              )}&callbackURL=${encodeURIComponent(callbackURL)}`,
            );
          },

          onError: (context) => {
            toast.error(
              context.error.message ||
                "Unable to send login code",
            );
          },
        },
      });
    });
  }

  return (
    <Card className="mx-auto w-full max-w-md rounded-2xl border-border/80 shadow-xl shadow-black/5">
      <CardHeader className="space-y-2 pb-5">
        <CardTitle className="text-2xl">
          {isAdminLogin ? "Admin login" : "Welcome back!"}
        </CardTitle>

        <CardDescription className="text-sm leading-6">
          {isAdminLogin
            ? "Sign in with an admin account to continue."
            : "Login with Google, GitHub or your email address."}
        </CardDescription>

        {initialError ? (
          <p
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {initialError}
          </p>
        ) : null}
      </CardHeader>

      <CardContent>
        {/* Social login */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-xl"
            disabled={
              socialPending || emailPending
            }
            onClick={() =>
              signInWithSocial("google")
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
            className="h-11 rounded-xl"
            disabled={
              socialPending || emailPending
            }
            onClick={() =>
              signInWithSocial("github")
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
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>

          <div className="relative flex justify-center">
            <span className="bg-card px-3 text-xs font-medium uppercase text-muted-foreground">
              Or continue with email
            </span>
          </div>
        </div>

        {/* Email login */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div className="space-y-2">
            <Label htmlFor="login-email">
              Email address
            </Label>

            <div className="relative">
              <MailIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                value={email}
                disabled={emailPending}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                className="h-11 rounded-xl pl-10"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="h-11 w-full rounded-xl font-semibold"
            disabled={
              emailPending ||
              socialPending ||
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
                <MailIcon className="size-4" />
                Continue with Email
              </>
            )}
          </Button>
        </form>

        {!isAdminLogin ? (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-primary transition-colors hover:text-primary/80 hover:underline"
            >
              Create account
            </Link>
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
