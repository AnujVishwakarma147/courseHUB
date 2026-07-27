"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FaGithub, FaGoogle } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [pendingProvider, setPendingProvider] = useState<"google" | "github" | null>(null);
  const [emailPending, startEmailTransition] = useTransition();
  const [email, setEmail] = useState("");

  async function signInWithSocial(provider: "google" | "github") {
    setPendingProvider(provider);
    try {
      await authClient.signIn.social({
        provider,
        callbackURL: "/",
        fetchOptions: {
          onSuccess: () => {
            toast.success(`Signing in with ${provider === "google" ? "Google" : "GitHub"}`);
          },
          onError: () => {
            toast.error(
              provider === "google"
                ? "Google sign-in is unavailable. Check the Google OAuth credentials."
                : "GitHub sign-in failed.",
            );
          },
        },
      });
    } finally {
      setPendingProvider(null);
    }
  }

    function signInWithEmail() {
      if (!email.trim()) {
        toast.error("Please enter your email address");
        return;
      }

      startEmailTransition(async () => {
        await authClient.emailOtp.sendVerificationOtp({
          email: email.trim(),
          type: "sign-in",
          fetchOptions: {
            onSuccess: () => {
              toast.success("Email sent");
              router.push(`/verify-request?email=${encodeURIComponent(email.trim())}`);
            },
            onError: () => {
              toast.error("Error sending email");
            },
          },
        });
      });
    }

    return(
        <Card>
      <CardHeader>
        <CardTitle className="text-xl">Welcome back!</CardTitle>
        <CardDescription>Sign in with Google, GitHub, or email</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Button
            disabled={pendingProvider !== null}
            onClick={() => signInWithSocial("google")}
            variant="outline"
          >
            {pendingProvider === "google" ? <Loader2 className="size-4 animate-spin" /> : <FaGoogle className="size-4" />}
            Google
          </Button>
          <Button
            disabled={pendingProvider !== null}
            onClick={() => signInWithSocial("github")}
            variant="outline"
          >
            {pendingProvider === "github" ? <Loader2 className="size-4 animate-spin" /> : (
              <FaGithub className="size-4" />
            )}
            GitHub
          </Button>
        </div>

        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-0.5 after:z-0 after:flex after:items-center after:border-t after:border-border">
          <span className="relative z-10 br-card px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>

        <div className="grid gap-3">
          <div className="flex flex-col space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="name@example.com" />
          </div>
          <Button onClick={signInWithEmail} disabled={emailPending}>{emailPending ?(<>
            <Loader2 className="size-4 animate-spin" />
            <span>Loading...</span>
          </>):(
            <>
            <Send className="size-4" />
            <span>Continue with Email</span>
            </>
          )}
          </Button>
        </div>
      </CardContent>
    </Card>
    )
}
