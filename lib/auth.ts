import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db";
import { env } from "./env";
import { admin, emailOTP } from "better-auth/plugins";
import { sendEmail } from "./mail";
import {
  ADMIN_AUTH_BASE_PATH,
  ADMIN_AUTH_COOKIE_PREFIX,
} from "./auth-flow";

type AuthInstanceOptions = {
  basePath?: string;
  cookiePrefix?: string;
};

function sanitizeAuthLogText(value: unknown) {
  return String(value)
    .replace(
      /([?&](?:code|state|access_token|refresh_token|id_token)=)[^&\s]+/gi,
      "$1[REDACTED]",
    )
    .replace(
      /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,
      "[REDACTED_EMAIL]",
    )
    .slice(0, 500);
}

function summarizeAuthLogValue(value: unknown) {
  if (typeof value === "string") {
    return sanitizeAuthLogText(value);
  }

  if (typeof value !== "object" || value === null) {
    return sanitizeAuthLogText(value);
  }

  const error = value as Record<string, unknown>;
  const fields = [
    "name",
    "message",
    "error",
    "error_description",
    "code",
    "status",
    "statusText",
  ];

  return fields
    .flatMap((field) =>
      error[field] === undefined
        ? []
        : [`${field}=${sanitizeAuthLogText(error[field])}`],
    )
    .join(" ");
}

function createCourseHubAuth(options: AuthInstanceOptions = {}) {
  return betterAuth({
    baseURL: env.BETTER_AUTH_URL,
    ...(options.basePath ? { basePath: options.basePath } : {}),
    ...(options.cookiePrefix
      ? {
          advanced: {
            cookiePrefix: options.cookiePrefix,
          },
        }
      : {}),

    database: prismaAdapter(prisma, {
      provider: "postgresql",
    }),

    logger: {
      level: "error",
      log(level, message, ...args) {
        if (level !== "error") {
          return;
        }

        const details = args
          .map(summarizeAuthLogValue)
          .filter(Boolean)
          .join(" ");
        const summary = [
          "[Better Auth]",
          sanitizeAuthLogText(message || "Authentication error"),
          details,
        ]
          .filter(Boolean)
          .join(" ");

        console.error(summary);
      },
    },

    socialProviders: {
      github: {
        clientId: env.AUTH_GITHUB_CLIENT_ID,
        clientSecret: env.AUTH_GITHUB_CLIENT_SECRET,
        disableImplicitSignUp: true,
      },
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        disableImplicitSignUp: true,
      },
    },

    plugins: [
      admin({
        defaultRole: "user",
        adminRoles: ["admin"],
      }),
      emailOTP({
        async sendVerificationOTP({ email, otp }) {
          await sendEmail({
            to: email,
            subject: "CourseHub - Verify your email",
            html: `<p>Your OTP is <strong>${otp}</strong></p>`,
          });
        },
      }),
    ],
  });
}

export const auth = createCourseHubAuth();

export const adminAuth = createCourseHubAuth({
  basePath: ADMIN_AUTH_BASE_PATH,
  cookiePrefix: ADMIN_AUTH_COOKIE_PREFIX,
});
