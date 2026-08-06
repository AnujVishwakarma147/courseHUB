import { getSessionCookie } from "better-auth/cookies";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { SignupForm } from "./_components/SignupForm";

export default async function SignupPage() {
  const sessionCookie = getSessionCookie(
    await headers(),
  );

  if (sessionCookie) {
    redirect("/");
  }

  return <SignupForm />;
}
