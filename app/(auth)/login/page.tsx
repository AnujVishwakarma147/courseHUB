
import { getSessionCookie } from "better-auth/cookies";
import { LoginForm } from "./_components/LoginForm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const sessionCookie = getSessionCookie(await headers());

  if (sessionCookie) {
    redirect("/");
  }

  return <LoginForm />;
}
