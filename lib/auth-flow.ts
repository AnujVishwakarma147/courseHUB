export const AUTH_MODE_HEADER = "x-coursehub-auth-mode";
export const ADMIN_AUTH_BASE_PATH = "/api/admin-auth";
export const ADMIN_AUTH_COOKIE_PREFIX = "coursehub-admin";

export type AuthMode = "login" | "signup";

export function isAuthMode(value: string | null): value is AuthMode {
  return value === "login" || value === "signup";
}

export function getSafeCallbackURL(
  value: string | null | undefined,
  fallback = "/",
) {
  const callbackURL = value?.trim();

  if (
    !callbackURL ||
    !callbackURL.startsWith("/") ||
    callbackURL.startsWith("//") ||
    callbackURL.startsWith("/\\")
  ) {
    return fallback;
  }

  return callbackURL;
}

export function isAdminCallbackURL(value: string | null | undefined) {
  const callbackURL = getSafeCallbackURL(value);
  const pathname = callbackURL.split(/[?#]/, 1)[0];

  return pathname === "/admin" || pathname.startsWith("/admin/");
}
