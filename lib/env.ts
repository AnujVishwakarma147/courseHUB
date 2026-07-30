import { createEnv } from "@t3-oss/env-nextjs";
import * as z from "zod";

const optionalStripeWebhookSecret = z.preprocess(
  (value) =>
    typeof value === "string" &&
    (value.trim() === "" || value.trim() === "whsec_...")
      ? undefined
      : value,
  z.string().startsWith("whsec_").optional(),
);

export const env = createEnv({
  server: {
    DATABASE_URL: z.url(),
    BETTER_AUTH_SECRET: z.string().min(1),
    BETTER_AUTH_URL: z.string().url(),
    AUTH_GITHUB_CLIENT_ID: z.string().min(1),
    AUTH_GITHUB_CLIENT_SECRET: z.string().min(1),
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
    RESEND_API_KEY: z.string().min(1),
    ARCJET_KEY: z.string().min(1),
    CLOUDINARY_CLOUD_NAME:z.string().min(1),
    CLOUDINARY_API_KEY:z.string().min(1),
    CLOUDINARY_API_SECRET:z.string().min(1),
    STRIPE_SECRET_KEY: z.string().startsWith("sk_").optional(),
    STRIPE_WEBHOOK_SECRET: optionalStripeWebhookSecret,
    STRIPE_CURRENCY: z
      .string()
      .trim()
      .toLowerCase()
      .pipe(z.enum(["inr", "usd"]))
      .default("inr"),
  },

  experimental__runtimeEnv: {},
});
