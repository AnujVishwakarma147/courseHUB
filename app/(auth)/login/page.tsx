import { getSessionCookie } from "better-auth/cookies";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  ADMIN_AUTH_COOKIE_PREFIX,
  getSafeCallbackURL,
  isAdminCallbackURL,
} from "@/lib/auth-flow";
import { LoginForm } from "./_components/LoginForm";

type LoginPageProps = {
  searchParams: Promise<{
    callbackURL?: string | string[];
    error?: string | string[];
  }>;
};

export default async function LoginPage({
  searchParams,
}: LoginPageProps) {
  const [requestHeaders, query] = await Promise.all([
    headers(),
    searchParams,
  ]);
  const rawCallbackURL = Array.isArray(query.callbackURL)
    ? query.callbackURL[0]
    : query.callbackURL;
  const callbackURL = getSafeCallbackURL(rawCallbackURL);
  const isAdminLogin = isAdminCallbackURL(callbackURL);
  const sessionCookie = getSessionCookie(
    requestHeaders,
    isAdminLogin
      ? { cookiePrefix: ADMIN_AUTH_COOKIE_PREFIX }
      : undefined,
  );

  if (sessionCookie) {
    redirect(callbackURL);
  }

  const socialError = Array.isArray(query.error)
    ? query.error[0]
    : query.error;
  const initialError = socialError
    ? socialError === "signup_disabled"
      ? "No account found for this social login. Please create an account first."
      : "Social login failed. Please try again."
    : undefined;

  return (
    <LoginForm
      callbackURL={callbackURL}
      initialError={initialError}
    />
  );
}
