import { auth } from "@/lib/auth";
import {
  AUTH_MODE_HEADER,
  isAuthMode,
} from "@/lib/auth-flow";
import { prisma } from "@/lib/db";
import ip from "@arcjet/ip";
import arcjet, {
  type ArcjetDecision,
  type BotOptions,
  type EmailOptions,
  type ProtectSignupOptions,
  type SlidingWindowRateLimitOptions,
  detectBot,
  protectSignup,
  slidingWindow,
} from "@arcjet/next";
import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest } from "next/server";

const aj = arcjet({
  key: process.env.ARCJET_KEY!, // Make sure this is in your .env
  characteristics: ["fingerprint"],
  rules: [],
});

const authHandlers = toNextJsHandler(auth.handler);

const botOptions = {
  mode: "LIVE",
  allow: [], 
} satisfies BotOptions;

const emailOptions = {
  mode: "LIVE",
  deny: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"],
} satisfies EmailOptions;

const rateLimitOptions = {
  mode: "LIVE",
  interval: "2m", 
  max: 5, 
} satisfies SlidingWindowRateLimitOptions<[]>;

const signupOptions = {
  email: emailOptions,
  
  bots: botOptions,
  
  rateLimit: rateLimitOptions,
} satisfies ProtectSignupOptions<[]>;

async function readBody(req: NextRequest): Promise<unknown> {
  try {
    return await req.clone().json();
  } catch {
    return {};
  }
}

async function protect(
  req: NextRequest,
  body: unknown,
): Promise<ArcjetDecision> {
  const fingerprint = ip(req) || "127.0.0.1";

  if (
    typeof body === "object" &&
    body !== null &&
    "email" in body &&
    typeof body.email === "string"
  ) {
    return aj
      .withRule(protectSignup(signupOptions))
      .protect(req, { email: body.email, fingerprint });
  } else if (req.method === "POST") {
    return aj
      .withRule(detectBot(botOptions))
      .withRule(slidingWindow(rateLimitOptions))
      .protect(req, { fingerprint });
  } else {
    return aj
      .withRule(detectBot(botOptions))
      .protect(req, { fingerprint });
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

function isSignInOtpRequest(req: NextRequest, body: unknown) {
  const path = req.nextUrl.pathname;

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

async function guardEmailOtpFlow(req: NextRequest, body: unknown) {
  if (!isSignInOtpRequest(req, body)) {
    return null;
  }

  const mode = req.headers.get(AUTH_MODE_HEADER);
  const email = getEmail(body);

  if (!isAuthMode(mode) || !email) {
    return Response.json(
      { message: "Please start again from the login or sign-up page." },
      { status: 400 },
    );
  }

  const account = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (mode === "login" && !account) {
    return Response.json(
      {
        message:
          "No account found with this email. Please create an account first.",
      },
      { status: 404 },
    );
  }

  if (mode === "signup" && account) {
    return Response.json(
      {
        message:
          "An account with this email already exists. Please login instead.",
      },
      { status: 409 },
    );
  }

  return null;
}

export const POST = async (req: NextRequest) => {
  if (req.nextUrl.pathname.endsWith("/sign-out")) {
    return authHandlers.POST(req);
  }

  const body = await readBody(req);
  const decision = await protect(req, body);

  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) {
      return new Response(null, { status: 429 });
    } else if (decision.reason.isEmail()) {
      let message: string;

      if (decision.reason.emailTypes.includes("INVALID")) {
        message = "Email address format is invalid. Is there a typo?";
      } else if (decision.reason.emailTypes.includes("DISPOSABLE")) {
        message = "We do not allow disposable email addresses.";
      } else if (decision.reason.emailTypes.includes("NO_MX_RECORDS")) {
        message =
          "Your email domain does not have an MX record. Is there a typo?";
      } else {
       
        message = "Invalid email.";
      }
      
      return new Response(JSON.stringify({ message }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    } else {
      return new Response("Forbidden", { status: 403 });
    }
  }

  const emailOtpError = await guardEmailOtpFlow(req, body);
  if (emailOtpError) {
    return emailOtpError;
  }

  return authHandlers.POST(req);
};

export const GET = async (req: NextRequest) => {
  return authHandlers.GET(req);
};
