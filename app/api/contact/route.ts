import * as z from "zod";
import ip from "@arcjet/ip";
import { slidingWindow } from "@arcjet/next";
import type { NextRequest } from "next/server";

import { sendEmail } from "@/lib/mail";
import { siteConfig } from "@/lib/site-config";
import arcjet from "@/lib/arcjet";

const contactProtection = arcjet.withRule(
  slidingWindow({
    mode: "LIVE",
    interval: "10m",
    max: 5,
  }),
);

const contactMessageSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  subject: z.string().trim().max(150),
  message: z.string().trim().min(10).max(5000),
});

export async function POST(request: NextRequest) {
  const decision = await contactProtection.protect(request, {
    fingerprint: ip(request) || "127.0.0.1",
  });

  if (decision.isDenied()) {
    return Response.json(
      {
        message: decision.reason.isRateLimit()
          ? "Too many messages. Please try again later."
          : "This request was blocked.",
      },
      { status: decision.reason.isRateLimit() ? 429 : 403 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { message: "Invalid request." },
      { status: 400 },
    );
  }

  const result = contactMessageSchema.safeParse(body);

  if (!result.success) {
    return Response.json(
      { message: "Please check the form details and try again." },
      { status: 400 },
    );
  }

  const { name, email, subject, message } = result.data;
  const safeSubject = subject.replace(/[\r\n]+/g, " ").trim();

  try {
    await sendEmail({
      to: siteConfig.supportEmail,
      replyTo: email,
      subject: `[CourseHUB] ${safeSubject || `New enquiry from ${name}`}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        safeSubject ? `Subject: ${safeSubject}` : "",
        "",
        "Message:",
        message,
      ]
        .filter(Boolean)
        .join("\n"),
    });

    return Response.json({ message: "Your message has been sent." });
  } catch (error) {
    console.error("Contact email request failed:", error);

    return Response.json(
      { message: "Email service is currently unavailable." },
      { status: 500 },
    );
  }
}
