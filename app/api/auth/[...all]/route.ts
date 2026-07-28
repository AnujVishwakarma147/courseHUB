import { auth } from "@/lib/auth";
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

async function protect(req: NextRequest): Promise<ArcjetDecision> {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  let userId: string;
  if (session?.user?.id) {
    userId = session.user.id;
  } else {
    userId = ip(req) || "127.0.0.1"; 
  }

 
  let body: unknown = {};
  try {
    body = await req.clone().json();
  } catch {
    // Body might be empty
  }

  if (
    typeof body === "object" &&
    body !== null &&
    "email" in body &&
    typeof body.email === "string"
  ) {
    return aj
      .withRule(protectSignup(signupOptions))
      .protect(req, { email: body.email, fingerprint: userId });
  } else if (req.method === "POST") {
   
    return aj
      .withRule(detectBot(botOptions))
      .withRule(slidingWindow(rateLimitOptions))
      .protect(req, { fingerprint: userId });
  } else {
    // For all other auth requests
    return aj
      .withRule(detectBot(botOptions))
      .protect(req, { fingerprint: userId });
  }
}

export const POST = async (req: NextRequest) => {
  const decision = await protect(req);

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

  
  return authHandlers.POST(req);
};

export const GET = async (req: NextRequest) => {
  return authHandlers.GET(req);
};
