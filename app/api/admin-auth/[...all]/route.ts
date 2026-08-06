import ip from "@arcjet/ip";
import arcjet, {
  type BotOptions,
  type SlidingWindowRateLimitOptions,
  detectBot,
  slidingWindow,
} from "@arcjet/next";
import { toNextJsHandler } from "better-auth/next-js";
import { type NextRequest } from "next/server";

import { adminAuth } from "@/lib/auth";
import { AUTH_MODE_HEADER } from "@/lib/auth-flow";
import { prisma } from "@/lib/db";

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  characteristics: ["fingerprint"],
  rules: [],
});

const botOptions = {
  mode: "LIVE",
  allow: [],
} satisfies BotOptions;

const rateLimitOptions = {
  mode: "LIVE",
  interval: "2m",
  max: 5,
} satisfies SlidingWindowRateLimitOptions<[]>;

const adminAuthHandlers = toNextJsHandler(adminAuth.handler);

async function readBody(request: NextRequest): Promise<unknown> {
  try {
    return await request.clone().json();
  } catch {
    return {};
  }
}

function getEmail(body: unknown) {
  if (
    typeof body !== "object" ||
    body === null ||
    !("email" in body) ||
    typeof body.email !== "string"
  ) {
    return null;
  }

  return body.email.trim().toLowerCase();
}

function isEmailOtpLogin(request: NextRequest, body: unknown) {
  const path = request.nextUrl.pathname;

  if (path.endsWith("/sign-in/email-otp")) {
    return true;
  }

  return (
    path.endsWith("/email-otp/send-verification-otp") &&
    typeof body === "object" &&
    body !== null &&
    "type" in body &&
    body.type === "sign-in"
  );
}

async function protectAdminAuthRequest(request: NextRequest) {
  const fingerprint = ip(request) || "127.0.0.1";
  const decision =
    request.method === "POST"
      ? await aj
          .withRule(detectBot(botOptions))
          .withRule(slidingWindow(rateLimitOptions))
          .protect(request, { fingerprint })
      : await aj
          .withRule(detectBot(botOptions))
          .protect(request, { fingerprint });

  if (!decision.isDenied()) {
    return null;
  }

  return new Response(
    decision.reason.isRateLimit() ? "Too many requests" : "Forbidden",
    { status: decision.reason.isRateLimit() ? 429 : 403 },
  );
}

async function guardAdminEmailLogin(
  request: NextRequest,
  body: unknown,
) {
  if (!isEmailOtpLogin(request, body)) {
    return null;
  }

  const email = getEmail(body);
  const mode = request.headers.get(AUTH_MODE_HEADER);

  if (mode !== "login" || !email) {
    return Response.json(
      { message: "Please start again from the admin login page." },
      { status: 400 },
    );
  }

  const adminUser = await prisma.user.findUnique({
    where: { email },
    select: { role: true },
  });

  if (adminUser?.role !== "admin") {
    return Response.json(
      { message: "This account does not have admin access." },
      { status: 403 },
    );
  }

  return null;
}

export const POST = async (request: NextRequest) => {
  if (request.nextUrl.pathname.endsWith("/sign-out")) {
    return adminAuthHandlers.POST(request);
  }

  const deniedResponse = await protectAdminAuthRequest(request);
  if (deniedResponse) {
    return deniedResponse;
  }

  const body = await readBody(request);
  const adminLoginError = await guardAdminEmailLogin(request, body);
  if (adminLoginError) {
    return adminLoginError;
  }

  return adminAuthHandlers.POST(request);
};

export const GET = async (request: NextRequest) => {
  const deniedResponse = await protectAdminAuthRequest(request);
  if (deniedResponse) {
    return deniedResponse;
  }

  return adminAuthHandlers.GET(request);
};
