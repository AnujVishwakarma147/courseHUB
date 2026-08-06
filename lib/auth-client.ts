import { emailOTPClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import { ADMIN_AUTH_BASE_PATH } from "./auth-flow";

export const authClient = createAuthClient({
  plugins: [emailOTPClient()],
});

export const adminAuthClient = createAuthClient({
  basePath: ADMIN_AUTH_BASE_PATH,
  plugins: [emailOTPClient()],
});
